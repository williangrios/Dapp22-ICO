// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.7;

interface ERC20Interface {
    
    function totalSupply() external view returns (uint256);
    function balanceOf(address _owner)external view returns (uint256 balance);
    function transfer(address _to, uint256 _value) external returns (bool success);
    function transferFrom(address _from, address _to, uint256 _value)external returns (bool success);
    function approve(address _spender, uint256 _value) external returns (bool success);
    function allowance(address _owner, address _spender) external view returns (uint256 remaining);

    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);
    
} 

contract ERC20Token is ERC20Interface {
    
    string public name;
    string public symbol;
    uint public decimals;
    uint public totalSupply;
    mapping(address => uint) public balances;
    mapping (address => mapping (address => uint)) public allowed;
    
    constructor(string memory _name, string memory _symbol, uint _decimals, uint _totalSupply) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        totalSupply = _totalSupply;
        balances[msg.sender] = _totalSupply;
    }

    function transfer(address to, uint value) public override returns (bool){
        require(balances[msg.sender] >= value, "Insufficient value");
        balances[msg.sender]  -= value;
        balances[to]  += value;
        emit Transfer(msg.sender, to, value);
        return true;
    }

    function transferFrom(address from, address to, uint value) public override returns(bool){
        uint _allowance = allowed[from][msg.sender];
        require(balances[from] >= value && _allowance >= value, "Insufficient value");
        allowed[from][msg.sender] -= value;
        balances[from]  -= value;
        balances[to]  += value;
        emit Transfer(msg.sender, to, value);
        return true;
    }

    function approve(address spender, uint value) public override  returns (bool) {
        require(spender != msg.sender, "Its no make sense");
        allowed[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function allowance(address owner, address spender) public view returns (uint){
        return allowed[owner][spender];
    }

    function balanceOf(address owner) public view returns (uint){
        return balances[owner];
    }

}

contract ICO {

    struct Sale {
        address investor;
        uint quantity;
    }

    Sale[] public sales;

    mapping (address => bool) investors;

    address public token;
    address public admin;
    uint public end;
    uint public price;

    uint public availableTokens;
    uint public minPurchase;
    uint public maxPurchase;

    bool public released = false;
    
    constructor(string memory _name, string memory _symbol, uint _decimals, uint _totalSupply ) {
        token = address(new ERC20Token(_name, _symbol, _decimals, _totalSupply));
        admin = msg.sender;
    }

    function start(uint duration, uint _price, uint _avaliableTokens, uint _minPurchase, uint _maxPurchase) external onlyAdmin() icoNotActive() {
        require(duration > 0 , "Duration should be superior than 0");
        uint totalSupply = ERC20Token(token).totalSupply();
        require(_avaliableTokens > 0 && _avaliableTokens <= totalSupply , "Total supply should be > 0 and <= totalsupply");
        require(_minPurchase > 0 , "minPurchase should be > 0");
        require(_maxPurchase > 0 && _maxPurchase <=_avaliableTokens , "maxPurchase should be > 0 and <= _avaliableTokens");
        end = duration + block.timestamp;
        price = _price;
        availableTokens = _avaliableTokens;
        minPurchase = _minPurchase;
        maxPurchase = _maxPurchase;
    }

    function whiteList(address investor) external onlyAdmin() {
        investors[investor] = true;
    }

    function checkWhiteList() external view returns (bool) {
        return investors[msg.sender];
    }

    function buy() payable external onlyInvestors() icoActive() {
        require(msg.value  % price == 0, "have to send a multiple of price");
        require(msg.value >= minPurchase && msg.value <= maxPurchase, "Should be between max and min purchase");
        uint quantity = price * msg.value;
        require (quantity <= availableTokens, "Not enough tokens left for sale");
        sales.push(Sale(msg.sender, quantity));
    }

    function release() external onlyAdmin() icoEnded() tokensReleased(){
        ERC20Token tokenInstance = ERC20Token(token);
        for (uint i = 0 ; i < sales.length; i++){
            Sale storage sale = sales[i];
            tokenInstance.transfer(sale.investor, sale.quantity);
        }
        released = true;
    }

    function withdraw(address payable to, uint amount) external onlyAdmin() icoEnded() tokensReleased(){
        to.transfer(amount);
    }

    modifier tokensReleased() {
        require(released == false, "Tokens must Not have been released");
        _;
    }

    modifier tokensNotReleased() {
        require(released == true, "Tokens must have been released");
        _;
    }

    modifier icoEnded(){
        require(end > 0 && (block.timestamp > end || availableTokens == 0), "ICO have must ended");
        _;
    }

    modifier onlyInvestors(){
        require(investors[msg.sender] == true, "Only investors" );
        _;
    }

    modifier onlyAdmin(){
        require(msg.sender == admin, "Only Admin");
        _;
    }

    modifier icoActive() {
        require(end > 0 && block.timestamp < end && availableTokens > 0 , "ICO must be active");
        _;
    }

    modifier icoNotActive() {
        require(end == 0 , "ICO should not be active");
        _;
    }

}