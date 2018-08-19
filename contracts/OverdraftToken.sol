pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

/**
 * @title Overdraft token
 *
 * @dev Implementation of an erc20 token which allows pausing functionality and overdrafts.
 *
 */
contract OverdraftToken is StandardToken, Ownable{
    string public name = "OverDraft";
    string public symbol = "OD";
    uint8 public decimals = 2;
    uint8 public initialSupply = 100;
    uint8 public highOverdraft = 100;
    uint8 public mediumOverdraft = 50;
    uint8 public noOverdraft = 0;
    mapping(address => uint8) public accountOverdraft;
    mapping(address => bool) public pausedReceive;
    mapping(address => bool) public pausedTransfer;

    /**
     * @dev Restores state if the provided address can't receive.
     * @param _receiver address
     */
    modifier canReceive (address _receiver) {
        require(!pausedReceive[_receiver], "Receiver receiving functionality is paused");
        _;
    }

    /**
     * @dev Restores state if the msg.sender can't transfer.
     */
    modifier canTransfer () {
        require(!pausedTransfer[msg.sender], "Your transfer functionality is paused");
        _;
    }

    /**
    * @dev Contract's constructor.
    */
    constructor() public {
        totalSupply_ = initialSupply;
        balances[msg.sender] = initialSupply;
    }

    /**
    * @dev Edits the overdraft of an account, will revert if the addressToEdit has not enough balance to reduce it's overdraft, could force the change and autopause the account until has received enough
    * @param _addressToEdit address to be edited
    * @param _overdraftLevel maximum overdraft amount. Must be one of the three levels
    */
    function editOverdraft(address _addressToEdit, uint8 _overdraftLevel) public onlyOwner returns (bool) {
        require(
            _overdraftLevel == highOverdraft || _overdraftLevel == mediumOverdraft || _overdraftLevel == noOverdraft, "Overdraft is not one of presets");
        balances[_addressToEdit] = balances[_addressToEdit].sub(accountOverdraft[_addressToEdit]);
        accountOverdraft[_addressToEdit] = _overdraftLevel;
        balances[_addressToEdit] = balances[_addressToEdit].add(_overdraftLevel);
        emit OverdraftChanged(_addressToEdit, msg.sender, _overdraftLevel);
        return true;
    }

    /**
    * @dev returns balance taking in account the overdraft of the account (using - is safe since overdraft is uint8 there can't be overflow)
    * @param _owner address to be queried
    */
    function balanceOfWithOverdraft(address _owner) public view returns (int256) {
        int256 balance = int256(balanceOf(_owner));
        return balance - accountOverdraft[_owner];
    }

    /**
    * @dev Pauses the ability of an account to receive tokens
    * @param _addressToPause address to be paused
    */
    function pauseReceive(address _addressToPause) public onlyOwner returns (bool) {
        pausedReceive[_addressToPause] = true;
        emit ReceivePaused(_addressToPause, msg.sender);
        return true;
    }

    /**
    * @dev Unpauses the ability of an account to receive tokens
    * @param _addressToUnpause address to be unpaused
    */
    function unpauseReceive(address _addressToUnpause) public onlyOwner returns (bool) {
        pausedReceive[_addressToUnpause] = false;
        emit ReceiveUnpaused(_addressToUnpause, msg.sender);
        return true;
    }

    /**
    * @dev Pauses the ability of an account to send tokens
    * @param _addressToPause address to be paused
    */
    function pauseTransfer(address _addressToPause) public onlyOwner returns (bool) {
        pausedTransfer[_addressToPause] = true;
        emit TransferPaused(_addressToPause, msg.sender);
        return true;
    }

    /**
    * @dev Unpauses the ability of an account to send tokens
    * @param _addressToUnpause address to be unpaused
    */
    function unpauseTransfer(address _addressToUnpause) public onlyOwner returns (bool) {
        pausedTransfer[_addressToUnpause] = false;
        emit TransferUnpaused(_addressToUnpause, msg.sender);
        return true;
    }

    /**
    * @dev Transfer token for a specified address taking in account overdrafts and pausing
    * @param _to The address to transfer to.
    * @param _value The amount to be transferred.
    */
    function transfer(address _to, uint256 _value) public canReceive(_to) canTransfer returns (bool) {
        require(_value <= balances[msg.sender], "not enough balance");
        require(_to != address(0), "cannot send to empty address");

        balances[msg.sender] = balances[msg.sender].sub(_value);
        balances[_to] = balances[_to].add(_value);
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    /**
     * @dev Transfer tokens from one address to another taking in account overdrafts and pausing
     * @param _from address The address which you want to send tokens from
     * @param _to address The address which you want to transfer to
     * @param _value uint256 the amount of tokens to be transferred
     */
    function transferFrom(
        address _from,
        address _to,
        uint256 _value
      )
      public canReceive(_to) canTransfer
      returns (bool)
    {
        require(_value <= balances[_from], "not enough balance");
        require(_value <= allowed[_from][msg.sender], "not enough allowance");
        require(_to != address(0), "cannot send to empty address");

        balances[_from] = balances[_from].sub(_value);
        balances[_to] = balances[_to].add(_value);
        allowed[_from][msg.sender] = allowed[_from][msg.sender].sub(_value);
        emit Transfer(_from, _to, _value);
        return true;
    }

    event OverdraftChanged( address indexed addressChanged, address indexed overdraftChanger, uint256 overdraftAmount);
    event ReceivePaused( address indexed addressChanged, address indexed changer);
    event ReceiveUnpaused( address indexed addressChanged, address indexed changer);
    event TransferPaused( address indexed addressChanged, address indexed changer);
    event TransferUnpaused( address indexed addressChanged, address indexed changer);
}
