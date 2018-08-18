pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol";

contract OverdraftToken is StandardToken {
    string public name = "OverDraft";
    string public symbol = "OD";
    uint8 public decimals = 2;
    uint public initialSupply = 100;

    constructor() public {
        totalSupply_ = initialSupply;
        balances[msg.sender] = initialSupply;
    }
}