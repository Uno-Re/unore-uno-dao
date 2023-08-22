// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "../interfaces/apps/IVeUnoDaoYieldDistributor.sol";

contract NotifyRewardProxy is AccessControl {
    using SafeERC20 for IERC20;

    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");

    IVeUnoDaoYieldDistributor public yieldDistributor;
    IERC20 public uno;

    constructor(IVeUnoDaoYieldDistributor _yieldDistributor, IERC20 _uno, address _admin) {
        yieldDistributor = _yieldDistributor;
        uno = _uno;
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
    }

    function execNotifyReward(address _user, uint256 _amount) external onlyRole(EXECUTOR_ROLE) {
        uno.safeTransferFrom(_user, address(this), _amount);
        uno.approve(address(yieldDistributor), _amount);
        yieldDistributor.notifyRewardAmount(_amount);
    }
}
