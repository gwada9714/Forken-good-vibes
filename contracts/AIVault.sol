// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title AIVault
 * @dev AI-powered autonomous treasury management vault
 * @notice Part of ForKen AI Vault - BNB Good Vibes Only Hackathon
 */
contract AIVault is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;

    // ============ Structs ============
    
    struct UserDeposit {
        uint256 amount;
        uint256 depositTime;
        uint256 lastActionTime;
    }

    struct AIAction {
        uint8 actionType;      // 0: stake, 1: unstake, 2: compound, 3: bridge
        address target;         // Target contract
        uint256 amount;
        uint256 timestamp;
        string reasoning;       // AI decision reasoning (for transparency)
    }

    // ============ State Variables ============
    
    /// @notice Total value locked in the vault
    uint256 public totalValueLocked;
    
    /// @notice Authorized AI agent address
    address public aiAgent;
    
    /// @notice Strategy executor contract
    address public strategyExecutor;
    
    /// @notice User deposits mapping
    mapping(address => UserDeposit) public deposits;
    
    /// @notice Action history
    AIAction[] public actionHistory;
    
    /// @notice Supported tokens
    mapping(address => bool) public supportedTokens;
    
    /// @notice User token balances
    mapping(address => mapping(address => uint256)) public userTokenBalances;

    // ============ Events ============
    
    event Deposited(address indexed user, address indexed token, uint256 amount);
    event Withdrawn(address indexed user, address indexed token, uint256 amount);
    event AIActionExecuted(uint8 indexed actionType, address target, uint256 amount, string reasoning);
    event AgentUpdated(address indexed oldAgent, address indexed newAgent);
    event StrategyExecutorUpdated(address indexed executor);
    event TokenSupported(address indexed token, bool supported);

    // ============ Modifiers ============
    
    modifier onlyAgent() {
        require(msg.sender == aiAgent, "AIVault: caller is not the AI agent");
        _;
    }

    modifier onlyAgentOrOwner() {
        require(msg.sender == aiAgent || msg.sender == owner(), "AIVault: unauthorized");
        _;
    }

    // ============ Constructor ============
    
    constructor(address _aiAgent) Ownable(msg.sender) {
        require(_aiAgent != address(0), "AIVault: invalid agent address");
        aiAgent = _aiAgent;
        
        // Native BNB is always supported (represented as address(0))
        supportedTokens[address(0)] = true;
    }

    // ============ User Functions ============
    
    /**
     * @notice Deposit BNB into the vault
     */
    function deposit() external payable nonReentrant whenNotPaused {
        require(msg.value > 0, "AIVault: amount must be > 0");
        
        deposits[msg.sender].amount += msg.value;
        deposits[msg.sender].depositTime = block.timestamp;
        deposits[msg.sender].lastActionTime = block.timestamp;
        
        userTokenBalances[msg.sender][address(0)] += msg.value;
        totalValueLocked += msg.value;
        
        emit Deposited(msg.sender, address(0), msg.value);
    }

    /**
     * @notice Deposit ERC20 tokens into the vault
     * @param token Token address
     * @param amount Amount to deposit
     */
    function depositToken(address token, uint256 amount) external nonReentrant whenNotPaused {
        require(supportedTokens[token], "AIVault: token not supported");
        require(amount > 0, "AIVault: amount must be > 0");
        
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        
        deposits[msg.sender].amount += amount;
        deposits[msg.sender].depositTime = block.timestamp;
        deposits[msg.sender].lastActionTime = block.timestamp;
        
        userTokenBalances[msg.sender][token] += amount;
        totalValueLocked += amount;
        
        emit Deposited(msg.sender, token, amount);
    }

    /**
     * @notice Withdraw BNB from the vault
     * @param amount Amount to withdraw
     */
    function withdraw(uint256 amount) external nonReentrant {
        require(userTokenBalances[msg.sender][address(0)] >= amount, "AIVault: insufficient balance");
        
        userTokenBalances[msg.sender][address(0)] -= amount;
        deposits[msg.sender].amount -= amount;
        totalValueLocked -= amount;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "AIVault: BNB transfer failed");
        
        emit Withdrawn(msg.sender, address(0), amount);
    }

    /**
     * @notice Withdraw ERC20 tokens from the vault
     * @param token Token address
     * @param amount Amount to withdraw
     */
    function withdrawToken(address token, uint256 amount) external nonReentrant {
        require(userTokenBalances[msg.sender][token] >= amount, "AIVault: insufficient balance");
        
        userTokenBalances[msg.sender][token] -= amount;
        deposits[msg.sender].amount -= amount;
        totalValueLocked -= amount;
        
        IERC20(token).safeTransfer(msg.sender, amount);
        
        emit Withdrawn(msg.sender, token, amount);
    }

    // ============ AI Agent Functions ============
    
    /**
     * @notice Execute a strategy decided by the AI agent
     * @param actionType Type of action (0: stake, 1: unstake, 2: compound, 3: bridge)
     * @param target Target contract address
     * @param data Encoded function call data
     * @param reasoning AI decision reasoning for transparency
     */
    function executeStrategy(
        uint8 actionType,
        address target,
        bytes calldata data,
        string calldata reasoning
    ) external onlyAgent nonReentrant whenNotPaused returns (bool success, bytes memory result) {
        require(target != address(0), "AIVault: invalid target");
        require(target == strategyExecutor || target == address(this), "AIVault: unauthorized target");
        
        // Execute the strategy
        (success, result) = target.call(data);
        require(success, "AIVault: strategy execution failed");
        
        // Record the action
        actionHistory.push(AIAction({
            actionType: actionType,
            target: target,
            amount: 0, // Will be decoded from data
            timestamp: block.timestamp,
            reasoning: reasoning
        }));
        
        emit AIActionExecuted(actionType, target, 0, reasoning);
    }

    // ============ View Functions ============
    
    /**
     * @notice Get user's total balance across all tokens
     * @param user User address
     */
    function getUserTotalBalance(address user) external view returns (uint256) {
        return deposits[user].amount;
    }

    /**
     * @notice Get user's balance for a specific token
     * @param user User address
     * @param token Token address (address(0) for BNB)
     */
    function getUserTokenBalance(address user, address token) external view returns (uint256) {
        return userTokenBalances[user][token];
    }

    /**
     * @notice Get total number of AI actions executed
     */
    function getActionCount() external view returns (uint256) {
        return actionHistory.length;
    }

    /**
     * @notice Get action by index
     * @param index Action index
     */
    function getAction(uint256 index) external view returns (AIAction memory) {
        require(index < actionHistory.length, "AIVault: index out of bounds");
        return actionHistory[index];
    }

    /**
     * @notice Get recent actions
     * @param count Number of recent actions to return
     */
    function getRecentActions(uint256 count) external view returns (AIAction[] memory) {
        uint256 total = actionHistory.length;
        if (count > total) count = total;
        
        AIAction[] memory recent = new AIAction[](count);
        for (uint256 i = 0; i < count; i++) {
            recent[i] = actionHistory[total - count + i];
        }
        return recent;
    }

    // ============ Admin Functions ============
    
    /**
     * @notice Update the authorized AI agent
     * @param newAgent New agent address
     */
    function setAIAgent(address newAgent) external onlyOwner {
        require(newAgent != address(0), "AIVault: invalid agent address");
        address oldAgent = aiAgent;
        aiAgent = newAgent;
        emit AgentUpdated(oldAgent, newAgent);
    }

    /**
     * @notice Update the strategy executor
     * @param executor Executor contract address
     */
    function setStrategyExecutor(address executor) external onlyOwner {
        require(executor != address(0), "AIVault: invalid executor address");
        strategyExecutor = executor;
        emit StrategyExecutorUpdated(executor);
    }

    /**
     * @notice Add or remove supported token
     * @param token Token address
     * @param supported Whether token is supported
     */
    function setSupportedToken(address token, bool supported) external onlyOwner {
        supportedTokens[token] = supported;
        emit TokenSupported(token, supported);
    }

    /**
     * @notice Pause the vault
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause the vault
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Emergency withdraw all funds to owner
     * @dev Only use in case of emergency
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        if (balance > 0) {
            (bool success, ) = owner().call{value: balance}("");
            require(success, "AIVault: emergency withdraw failed");
        }
    }

    // ============ Receive Function ============
    
    receive() external payable {
        // Accept BNB transfers (e.g., from strategies returning funds)
    }
}
