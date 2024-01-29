// SPDX-License-Identifier: MIT
pragma solidity =0.8.23;

contract Owned {
    address public owner;
    address public nominatedOwner;

    uint256[30] __gap;
    
    event OwnerNominated(address newOwner);
    event OwnerChanged(address oldOwner, address newOwner);

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "Only the contract owner may perform this action"
        );
        _;
    }

    constructor(address _owner) {
        require(_owner != address(0), "Owner address cannot be 0");
        owner = _owner;
        emit OwnerChanged(address(0), _owner);
    }

    /**
     @notice nominate new owner, can only be called by owner
     @param _owner new owner
     */
    function nominateNewOwner(address _owner) external onlyOwner {
        nominatedOwner = _owner;
        emit OwnerNominated(_owner);
    }

    /**
     @notice nominated owner can accept ownership, can only be called by nominated owner
     */
    function acceptOwnership() external {
        require(
            msg.sender == nominatedOwner,
            "You must be nominated before you can accept ownership"
        );
        emit OwnerChanged(owner, nominatedOwner);
        owner = nominatedOwner;
        nominatedOwner = address(0);
    }
}
