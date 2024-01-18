// SPDX-License-Identifier: MIT

pragma solidity =0.8.23;

contract SmartWalletChecker {

    /**
     @notice return true if account is EAO account else false
     */
    function check(address account) external view returns (bool) {
        uint256 size;
        assembly {
            size := extcodesize(account)
        }
        return size == 0;
    }
}
