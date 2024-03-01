// SPDX-License-Identifier: MIT

pragma solidity =0.8.23;

import "@openzeppelin/contracts/access/Ownable2Step.sol";

contract Ownership is Ownable2Step {
    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor(address _owner) Ownable(_owner) {}
}
