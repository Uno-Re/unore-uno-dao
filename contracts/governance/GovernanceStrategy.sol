// SPDX-License-Identifier: agpl-3.0
pragma solidity =0.8.23;

import {IGovernanceStrategy} from "../interfaces/IGovernanceStrategy.sol";
import {IERC20} from "../interfaces/IERC20.sol";
import {IGovernancePowerDelegationToken} from "../interfaces/IGovernancePowerDelegationToken.sol";

/**
 * @title Governance Strategy contract
 * @dev Smart contract containing logic to measure users' relative power to propose and vote.
 * User Power = User Power from Uno token + User Power from stkUno Token.
 * User Power from Token = Token Power + Token Power as Delegatee [- Token Power if user has delegated]
 * Two wrapper functions linked to Uno Tokens's GovernancePowerDelegationERC20.sol implementation
 * - getPropositionPowerAt: fetching a user Proposition Power at a specified block
 * - getVotingPowerAt: fetching a user Voting Power at a specified block
 **/
contract GovernanceStrategy is IGovernanceStrategy {
    address public immutable UNO;
    address public immutable STK_UNO;

    /**
     * @dev Constructor, register tokens used for Voting and Proposition Powers.
     * @param _uno The address of the UNO Token contract.
     * @param _stkUNO The address of the stkUNO Token Contract
     **/
    constructor(address _uno, address _stkUNO) {
        UNO = _uno;
        STK_UNO = _stkUNO;
    }

    /**
     * @dev Returns the total supply of Proposition Tokens Available for Governance
     * = UNO Available for governance      + stkUNO available
     * The supply of UNO staked in stkUNO are not taken into account so:
     * = (Supply of UNO - UNO in stkUNO) + (Supply of stkUNO)
     * = Supply of UNO, Since the supply of stkUNO is equal to the number of UNO staked
     * @param blockNumber Blocknumber at which to evaluate
     * @return total supply at blockNumber
     **/
    function getTotalPropositionSupplyAt(
        uint256 blockNumber
    ) public view override returns (uint256) {
        return IERC20(UNO).totalSupplyAt(blockNumber);
    }

    /**
     * @dev Returns the total supply of Outstanding Voting Tokens
     * @param blockNumber Blocknumber at which to evaluate
     * @return total supply at blockNumber
     **/
    function getTotalVotingSupplyAt(
        uint256 blockNumber
    ) public view override returns (uint256) {
        return getTotalPropositionSupplyAt(blockNumber);
    }

    /**
     * @dev Returns the Proposition Power of a user at a specific block number.
     * @param user Address of the user.
     * @param blockNumber Blocknumber at which to fetch Proposition Power
     * @return Power number
     **/
    function getPropositionPowerAt(
        address user,
        uint256 blockNumber
    ) public view override returns (uint256) {
        return
            _getPowerByTypeAt(
                user,
                blockNumber,
                IGovernancePowerDelegationToken.DelegationType.PROPOSITION_POWER
            );
    }

    /**
     * @dev Returns the Vote Power of a user at a specific block number.
     * @param user Address of the user.
     * @param blockNumber Blocknumber at which to fetch Vote Power
     * @return Vote number
     **/
    function getVotingPowerAt(
        address user,
        uint256 blockNumber
    ) public view override returns (uint256) {
        return
            _getPowerByTypeAt(
                user,
                blockNumber,
                IGovernancePowerDelegationToken.DelegationType.VOTING_POWER
            );
    }

    function _getPowerByTypeAt(
        address user,
        uint256 blockNumber,
        IGovernancePowerDelegationToken.DelegationType powerType
    ) internal view returns (uint256) {
        return
            IGovernancePowerDelegationToken(UNO).getPowerAtBlock(
                user,
                blockNumber,
                powerType
            ) +
            IGovernancePowerDelegationToken(STK_UNO).getPowerAtBlock(
                user,
                blockNumber,
                powerType
            );
    }
}
