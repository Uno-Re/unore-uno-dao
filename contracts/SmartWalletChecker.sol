// SPDX-License-Identifier: MIT

pragma solidity =0.8.23;

contract SmartWalletChecker {
    function check(address account) external view returns (bool) {
        require(account == tx.origin, "Invalid sender");
        uint256 size;
        assembly {
            size := extcodesize(account)
        }
        return size == 0;
    }
}
