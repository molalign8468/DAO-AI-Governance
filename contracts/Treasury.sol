// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;


contract Treasury{
    address public governor;
    address public owner;

    event Deposited(address indexed sender, uint256 amount);
    event Transferred(address indexed recipient, uint256 amount);

    constructor(address _governor) {
        governor = _governor;
    }

    modifier onlyGovernor() {
        require(msg.sender == governor, "Only governor can call");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only governor can call");
        _;
    }

    receive() external payable {
        emit Deposited(msg.sender, msg.value);
    }

    function deposit() external payable {
        emit Deposited(msg.sender, msg.value);
    }

    function transfer(address to, uint256 amount) external onlyGovernor {
        require(address(this).balance >= amount, "Not enough funds in Treasury");
        payable(to).transfer(amount);
        emit Transferred(to, amount);
    }

    function setGovernor(address _governor) external {
        governor = _governor;
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
