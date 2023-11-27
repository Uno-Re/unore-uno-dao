// SPDX-License-Identifier: MIT
pragma solidity =0.8.23;

// Originally inspired by Synthetix.io, but heavily modified by the UNO team
// https://github.com/Synthetixio/synthetix/blob/develop/contracts/StakingRewards.sol

import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {IVotingEscrow} from "../interfaces/dao/IVotingEscrow.sol";

contract VeUnoDaoYieldDistributor is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct LockedBalance {
        int128 amount;
        uint256 end;
    }

    // Constant for price precision
    uint256 public constant PRICE_PRECISION = 1e6;

    // Stores last reward time of staker
    mapping(address => uint256) public lastRewardClaimTime;
    // Vote escrow contract, used for voting power
    IVotingEscrow public veUNO;
    // Reward token which staker earns for staking Uno
    IERC20 public emittedToken;
    // Yield and period related
    uint256 public periodFinish;
    uint256 public lastUpdateTime;
    uint256 public yieldRate;
    uint256 public yieldDuration = 604800; // 7 * 86400  (7 days)
    // Yield tracking
    uint256 public yieldPerVeUNOStored;
    mapping(address => uint256) public userYieldPerTokenPaid;
    mapping(address => uint256) public yields;
    // veUNO tracking
    uint256 public totalVeUNOParticipating;
    uint256 public totalVeUNOSupplyStored;
    mapping(address => uint256) public userVeUNOCheckpointed;
    mapping(address => uint256) public userVeUNOEndpointCheckpointed;
    mapping(address => bool) public userIsInitialized;
    // Greylists
    mapping(address => bool) public greylist;
    // Admin booleans for emergencies
    bool public yieldCollectionPaused; // For emergencies, by default "False"
    // Used to change secure states
    address public timelock;
    // Stores user's flag for reward apy update
    mapping(address => bool) public rewardNotifiers;

    event RewardAdded(uint256 reward, uint256 yieldRate);
    event YieldCollected(
        address indexed user,
        uint256 yieldAmount,
        address token_address
    );
    event YieldDurationUpdated(uint256 newDuration);
    event RecoveredERC20(address token, uint256 amount);

    modifier onlyByOwnGov() {
        require(
            msg.sender == owner() || msg.sender == timelock,
            "Not owner or timelock"
        );
        _;
    }

    modifier notYieldCollectionPaused() {
        require(yieldCollectionPaused == false, "Yield collection is paused"); // TODO
        _;
    }

    modifier checkpointUser(address _account) {
        _checkpointUser(_account);
        _;
    }

    constructor(IERC20 _emittedToken, address _timelock, IVotingEscrow _veUNO) {
        emittedToken = _emittedToken;
        veUNO = _veUNO;
        timelock = _timelock;
        lastUpdateTime = block.timestamp;
        rewardNotifiers[msg.sender] = true;
    }

    function sync() public {
        // Update the total veUNO supply
        yieldPerVeUNOStored = yieldPerVeUNO();
        totalVeUNOSupplyStored = veUNO.totalSupply();
        lastUpdateTime = lastTimeYieldApplicable();
    }

    // Only positions with locked veUNO can accrue yield. Otherwise, expired-locked veUNO
    function eligibleCurrentVeUNO(
        address _account
    )
        public
        view
        returns (uint256 eligible_veuno_bal, uint256 stored_ending_timestamp)
    {
        uint256 curr_veuno_bal = veUNO.balanceOf(_account);

        // Stored is used to prevent abuse
        stored_ending_timestamp = userVeUNOEndpointCheckpointed[_account];

        // Only unexpired veUNO should be eligible
        if (
            stored_ending_timestamp != 0 &&
            (block.timestamp >= stored_ending_timestamp)
        ) {
            eligible_veuno_bal = 0;
        } else if (block.timestamp >= stored_ending_timestamp) {
            eligible_veuno_bal = 0;
        } else {
            eligible_veuno_bal = curr_veuno_bal;
        }
    }

    function lastTimeYieldApplicable() public view returns (uint256) {
        return block.timestamp < periodFinish ? block.timestamp : periodFinish; // return min value
    }

    function yieldPerVeUNO() public view returns (uint256 yield) {
        if (totalVeUNOSupplyStored == 0) {
            yield = yieldPerVeUNOStored;
        } else {
            yield =
                yieldPerVeUNOStored +
                (((lastTimeYieldApplicable() - lastUpdateTime) *
                    yieldRate *
                    1e18) / totalVeUNOSupplyStored);
        }
    }

    function earned(address _account) public view returns (uint256 yieldAmount) {
        // Uninitialized users should not earn anything yet
        if (!userIsInitialized[_account]) return 0;

        // Get eligible veUNO balances
        (
            uint256 eligible_current_veuno,
            uint256 ending_timestamp
        ) = eligibleCurrentVeUNO(_account);

        // If your veUNO is unlocked
        uint256 eligible_time_fraction = PRICE_PRECISION;
        if (eligible_current_veuno == 0) {
            // And you already claimed after expiration
            if (lastRewardClaimTime[_account] >= ending_timestamp) {
                // You get NOTHING. You LOSE. Good DAY ser!
                return 0;
            }
            // You haven't claimed yet
            else {
                uint256 eligible_time = ending_timestamp -
                    lastRewardClaimTime[_account];
                uint256 total_time = block.timestamp -
                    lastRewardClaimTime[_account];
                eligible_time_fraction =
                    (eligible_time * PRICE_PRECISION) /
                    total_time;
            }
        }

        // If the amount of veUNO increased, only pay off based on the old balance
        // Otherwise, take the midpoint
        uint256 veuno_balance_to_use;
        {
            uint256 old_veuno_balance = userVeUNOCheckpointed[_account];
            if (eligible_current_veuno > old_veuno_balance) {
                veuno_balance_to_use = old_veuno_balance;
            } else {
                veuno_balance_to_use =
                    (eligible_current_veuno + old_veuno_balance) /
                    2;
            }
        }

        yieldAmount =
            yields[_account] +
            ((veuno_balance_to_use *
                (yieldPerVeUNO() - userYieldPerTokenPaid[_account]) *
                eligible_time_fraction) / (PRICE_PRECISION * 1e18));
    }

    // Anyone can checkpoint another user
    function checkpointOtherUser(address _user) external {
        _checkpointUser(_user);
    }

    // Checkpoints the user
    function checkpoint() external {
        _checkpointUser(msg.sender);
    }

    function getYield()
        external
        nonReentrant
        notYieldCollectionPaused
        checkpointUser(msg.sender)
        returns (uint256 yield0)
    {
        require(greylist[msg.sender] == false, "Address has been greylisted"); // TODO

        yield0 = yields[msg.sender];

        if (yield0 > 0) {
            yields[msg.sender] = 0;
            emittedToken.safeTransfer(msg.sender, yield0);
            emit YieldCollected(msg.sender, yield0, address(emittedToken));
        }

        lastRewardClaimTime[msg.sender] = block.timestamp;
    }

    function notifyRewardAmount(uint256 _amount) external {
        // Only whitelisted addresses can notify rewards
        require(rewardNotifiers[msg.sender], "Sender not whitelisted");

        // Handle the transfer of emission tokens via `transferFrom` to reduce the number
        // of transactions required and ensure correctness of the smission amount
        emittedToken.safeTransferFrom(msg.sender, address(this), _amount);

        // Update some values beforehand
        sync();

        // Update the new yieldRate
        if (block.timestamp >= periodFinish) {
            yieldRate = _amount / yieldDuration;
        } else {
            uint256 remaining = periodFinish - block.timestamp;
            uint256 leftover = remaining * yieldRate;
            yieldRate = (_amount + leftover) / yieldDuration;
        }

        // Update duration-related info
        lastUpdateTime = block.timestamp;
        periodFinish = block.timestamp + yieldDuration;

        emit RewardAdded(_amount, yieldRate);
    }

    function fractionParticipating() external view returns (uint256) {
        return
            (totalVeUNOParticipating * PRICE_PRECISION) /
            totalVeUNOSupplyStored;
    }

    function getYieldForDuration() external view returns (uint256) {
        return yieldRate * yieldDuration;
    }

    function _checkpointUser(address _account) internal {
        // Need to retro-adjust some things if the period hasn't been renewed, then start a new one
        sync();

        // Calculate the earnings first
        _syncEarned(_account);

        // Get the old and the new veUNO balances
        uint256 old_veuno_balance = userVeUNOCheckpointed[_account];
        uint256 new_veuno_balance = veUNO.balanceOf(_account);

        // Update the user's stored veUNO balance
        userVeUNOCheckpointed[_account] = new_veuno_balance;

        // Update the user's stored ending timestamp
        IVotingEscrow.LockedBalance memory curr_locked_bal_pack = veUNO.locked(
            _account
        );
        userVeUNOEndpointCheckpointed[_account] = curr_locked_bal_pack.end;

        // Update the total amount participating
        if (new_veuno_balance >= old_veuno_balance) {
            uint256 weight_diff = new_veuno_balance - old_veuno_balance;
            totalVeUNOParticipating = totalVeUNOParticipating + weight_diff;
        } else {
            uint256 weight_diff = old_veuno_balance - new_veuno_balance;
            totalVeUNOParticipating = totalVeUNOParticipating - weight_diff;
        }

        // Mark the user as initialized
        if (!userIsInitialized[_account]) {
            userIsInitialized[_account] = true;
            lastRewardClaimTime[_account] = block.timestamp;
        }
    }

    function _syncEarned(address _account) internal {
        if (_account != address(0)) {
            uint256 earned0 = earned(_account);
            yields[_account] = earned0;
            userYieldPerTokenPaid[_account] = yieldPerVeUNOStored;
        }
    }

    /* ========== RESTRICTED FUNCTIONS ========== */

    // Added to support recovering LP Yield and other mistaken tokens from other systems to be distributed to holders
    function recoverERC20(
        IERC20 _token,
        uint256 _amount
    ) external onlyByOwnGov {
        // Only the owner address can receive the recovery withdrawal
        _token.safeTransfer(owner(), _amount);
        emit RecoveredERC20(address(_token), _amount);
    }

    function setYieldDuration(uint256 _yieldDuration) external onlyByOwnGov {
        require(
            periodFinish == 0 || block.timestamp > periodFinish, // TODO
            "Previous yield period must be complete before changing the duration for the new period"
        );
        yieldDuration = _yieldDuration;
        emit YieldDurationUpdated(_yieldDuration);
    }

    function greylistAddress(address _user) external onlyByOwnGov {
        greylist[_user] = !(greylist[_user]);
    }

    function toggleRewardNotifier(address _notifier) external onlyByOwnGov {
        rewardNotifiers[_notifier] = !rewardNotifiers[_notifier];
    }

    function setPauses(bool _yieldCollectionPaused) external onlyByOwnGov {
        yieldCollectionPaused = _yieldCollectionPaused;
    }

    function setYieldRate(
        uint256 _newRate0,
        bool _isSync
    ) external onlyByOwnGov {
        yieldRate = _newRate0;

        if (_isSync) {
            sync();
        }
    }

    function setPeriodFinish(
        uint256 _newPeriod,
        bool _isSync
    ) external onlyByOwnGov {
        periodFinish = _newPeriod;

        if (_isSync) {
            sync();
        }
    }

    function setTimelock(address _newTimelock) external onlyByOwnGov {
        timelock = _newTimelock;
    }

    function withdrawUNO(address _to) external onlyByOwnGov {
        emittedToken.safeTransfer(_to, emittedToken.balanceOf(address(this)));
    }
}
