// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SimpleStorage {
    address public owner;
    uint256 private value;
    string public message;

    event OwnerSet(address indexed oldOwner, address indexed newOwner);
    event ValueUpdated(uint256 oldValue, uint256 newValue);
    event MessageUpdated(string oldMessage, string newMessage);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        address oldOwner = owner;
        owner = msg.sender;
        emit OwnerSet(oldOwner, owner);
    }

    function setValue(uint256 _value) public onlyOwner {
        uint256 oldValue = value;
        value = _value;
        emit ValueUpdated(oldValue, _value);
    }

    function getValue() public view returns (uint256) {
        return value;
    }

    function setMessage(string calldata _message) public onlyOwner {
        string memory oldMessage = message;
        message = _message;
        emit MessageUpdated(oldMessage, _message);
    }
}