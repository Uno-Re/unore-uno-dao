// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "../interfaces/apps/IVeUnoDaoYieldDistributor.sol";

contract NotifyRewardProxy is AccessControl {
    using SafeERC20 for IERC20;

    event ApyUpdated(uint256 apy);
    event NotifyRewardExecuted(address indexed user, uint256 amount);

    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");

    IVeUnoDaoYieldDistributor public yieldDistributor;
    IERC20 public uno;
    IERC20 public veUNO;
    uint256 public apy;

    constructor(IVeUnoDaoYieldDistributor _yieldDistributor, IERC20 _uno, address _admin) {
        yieldDistributor = _yieldDistributor;
        uno = _uno;
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
    }

    function updateApy(uint256 _apy) external onlyRole(DEFAULT_ADMIN_ROLE) {
        apy = _apy;
        emit ApyUpdated(_apy);
    }

    function execNotifyReward(address _user) external onlyRole(EXECUTOR_ROLE) {
        uint256 amount = yieldDistributor.getYieldForDuration();
        uno.safeTransferFrom(_user, address(this), amount);
        uno.approve(address(yieldDistributor), amount);
        yieldDistributor.notifyRewardAmount(amount);

        emit NotifyRewardExecuted(_user, amount);
    }
}
