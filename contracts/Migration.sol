// SPDX-License-Identifier: MIT

pragma solidity =0.8.23;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/dao/IVotingEscrow.sol";

contract Migration is Ownable {

    IVotingEscrow public oldVotingEscrow;
    IVotingEscrow public newVotingEscrow;

    event UserMigrated(address indexed migrator, address indexed user);
    event NewVotingEscrowUpdated(address indexed votingEscrow);

    constructor(address _oldVotingEscrow) Ownable(msg.sender) {
        oldVotingEscrow = IVotingEscrow(_oldVotingEscrow);
    }

    function migrate() external {
        require(newVotingEscrow != address(0), "New Voting Escrow is not set");
        IVotingEscrow.LockedBalance memory lockedOfUser = oldVotingEscrow.locked(msg.sender);
        uint256 userPointEpoch = oldVotingEscrow.get_user_point_epoch(msg.sender);
        IVotingEscrow.Point memory userPointHistory = oldVotingEscrow.user_point_history(msg.sender, userPointEpoch);

        IVotingEscrow(newVotingEscrow).setUserDetails(msg.sender, userPointEpoch, Point.slope, Point.bias, Point.ts, Point.blk, lockedOfUser.end, lockedOfUser.amount);

        emit UserMigrated(address(this), msg.sender);
    }

    function setNewVotingEscrow(address _votinEscrow) external onlyOwner {
        newVotingEscrow = IVotingEscrow(_votinEscrow);

        emit NewVotingEscrowUpdated(votinEscrow);
    }
}
