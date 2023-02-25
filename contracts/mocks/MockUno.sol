// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.10;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockUno is Ownable, ERC20 {
    uint256 INITIAL_SUPPLY = 10000000000 * 10**18;

    constructor(string memory _name_, string memory _symbol_) ERC20(_name_, _symbol_) {}

    function faucet(uint256 _amount) external {
        _mint(msg.sender, _amount);
    }
}
