// SPDX-License-Identifier: MIT

pragma solidity =0.8.23;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../access/Owned.sol";
import "../interfaces/apps/IVeUnoDaoYieldDistributor.sol";

contract Resolver is Owned {
    event ApyUpdated(uint256 apy);

    uint256 public constant APY_BASE = 10000; // APY should be provided as per this base to get ratio, 60% should 6000
    uint256 public constant SECONDS_IN_YEAR = 31536000;

    IVeUnoDaoYieldDistributor public immutable yieldDistributor;
    IERC20 public immutable veUno;

    uint256 public apy;
    address public rewardTreasury;

    constructor(
        IVeUnoDaoYieldDistributor _yieldDistributor,
        IERC20 _veUno,
        address _admin,
        address _rewardTreasury
    ) Owned(_admin) {
        yieldDistributor = _yieldDistributor;
        veUno = _veUno;
        rewardTreasury = _rewardTreasury;
    }

    function updateApy(uint256 _apy) external onlyOwner {
        require(_apy <= APY_BASE, "NotifyRewardProxy: invalid APY");
        apy = _apy;
        emit ApyUpdated(_apy);
    }

    function getRewardAmount() public view returns (uint256) {
        uint256 veTotalSupply = veUno.totalSupply();
        uint256 duration = yieldDistributor.yieldDuration();
        uint256 reward = (veTotalSupply * apy * duration) /
            (APY_BASE * SECONDS_IN_YEAR);

        uint256 periodFinish = yieldDistributor.periodFinish();
        if (periodFinish > block.timestamp) {
            periodFinish -= block.timestamp;
            uint256 yieldRate = yieldDistributor.yieldRate();
            uint256 leftover = periodFinish * yieldRate;

            if (leftover > reward) {
                return 0;
            }
            reward -= leftover;
        }
        return reward;
    }

    function checker()
        external
        view
        returns (bool canExec, bytes memory execPayload)
    {
        uint lastChecked = yieldDistributor.lastUpdateTime();
        if (block.timestamp >= lastChecked + 7 days) {
            uint256 amount = getRewardAmount();
            bytes4 selector = bytes4(
                keccak256("notifyRewardAmount(address,uint256)")
            );
            execPayload = abi.encodeWithSelector(
                selector,
                rewardTreasury,
                amount
            );
            canExec = true;
            return (canExec, execPayload);
        }
    }
}
