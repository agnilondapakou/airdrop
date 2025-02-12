// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.28;

contract CustomERC20 {
    // Token details
    string public name = "PakouToken";
    string public symbol = "PAK";
    uint8 public decimals = 18;
    uint256 public totalSupply;

    // Balance mapping
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    // Owner address
    address public owner;

    // Events
    event Mint(address indexed to, uint256 amount);
    event Transfer(address indexed from, address indexed to, uint256 amount);
    event Approval(address indexed owner, address indexed spender, uint256 amount);
    event Burn(address indexed from, uint256 amount);

    // custom messages
    error NotContractOwner();
    error InsufficientBalance(address account, uint256 balance, uint256 attemptAmount);
    error InsufficientAllowance();
    error InvalidRecipiend();
    error AllowanceExceeded(address spender, uint256 allowance, uint256 attempted);

    // modifier
    modifier onlyOwner() {
        // use custom messages
        if (msg.sender != owner) revert NotContractOwner();
        _;
    }

    function _mint(address to, uint256 amount) internal {
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Mint(to, amount);
        emit Transfer(address(0), to, amount);
    }

    function mint(address to, uint256 amount) external onlyOwner() {
        _mint(to, amount);
    }

    function _transfer(address from, address to, uint256 amount) internal {
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
    }
    
    function transfer(address to, uint256 amount) external returns (bool) {
        if(balanceOf[msg.sender] < amount) revert InsufficientBalance(msg.sender, balanceOf[msg.sender], amount);

        if(to == address(0)) revert InvalidRecipiend();

        _transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(owner, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        if(balanceOf[from] < amount) revert InsufficientBalance(from, balanceOf[from], amount);

        if(allowance[from][msg.sender] < amount) revert AllowanceExceeded(msg.sender, allowance[from][msg.sender], amount);

        allowance[from][msg.sender] -= amount;
        _transfer(from, to, amount);
        return true;
    }

    function burn(uint256 amount) external {
        if(balanceOf[msg.sender] < amount) revert InsufficientBalance(msg.sender, balanceOf[msg.sender], amount);

        balanceOf[msg.sender] -= amount;
        totalSupply -= amount;
        emit Burn(msg.sender, amount);
        emit Transfer(msg.sender, address(0), amount);
    }

}