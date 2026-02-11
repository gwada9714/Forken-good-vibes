// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IForKenStaking.sol";

/**
 * @title StrategyExecutor
 * @dev Executes DeFi strategies on behalf of AIVault
 * @notice Part of ForKen AI Vault - BNB Good Vibes Only Hackathon
 */
contract StrategyExecutor is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // ============ Structs ============
    
    struct Strategy {
        string name;
        address targetContract;
        bool isActive;
        uint256 totalDeployed;
        uint256 totalReturned;
    }

    // ============ State Variables ============
    
    /// @notice AIVault contract reference
    address public aiVault;
    
    /// @notice Registered strategies
    mapping(bytes32 => Strategy) public strategies;
    bytes32[] public strategyIds;
    
    /// @notice ForKen Staking contract
    address public forkenStaking;
    
    /// @notice ForKen Bridge contract
    address public forkenBridge;

    // ============ Events ============
    
    event StrategyRegistered(bytes32 indexed id, string name, address target);
    event StrategyExecuted(bytes32 indexed strategyId, uint256 amount, bool success);
    event Staked(address indexed pool, uint256 amount);
    event Unstaked(address indexed pool, uint256 amount);
    event Compounded(address indexed pool, uint256 rewardsClaimed, uint256 rewardsReinvested);
    event BridgeInitiated(uint256 targetChainId, uint256 amount);

    // ============ Modifiers ============
    
    modifier onlyVault() {
        require(msg.sender == aiVault, "StrategyExecutor: caller is not the vault");
        _;
    }

    modifier onlyVaultOrOwner() {
        require(msg.sender == aiVault || msg.sender == owner(), "StrategyExecutor: unauthorized");
        _;
    }

    // ============ Constructor ============
    
    constructor(address _aiVault) Ownable(msg.sender) {
        require(_aiVault != address(0), "StrategyExecutor: invalid vault address");
        aiVault = _aiVault;
    }

    // ============ Strategy Functions ============
    
    /**
     * @notice Stake tokens to a ForKen staking pool
     * @param poolId Pool identifier
     * @param amount Amount to stake
     */
    function stakeToPool(
        uint256 poolId,
        uint256 amount
    ) external onlyVaultOrOwner nonReentrant returns (bool) {
        require(forkenStaking != address(0), "StrategyExecutor: staking not configured");
        require(amount > 0, "StrategyExecutor: amount must be > 0");
        
        // Approve and stake
        // Note: In production, this would interact with the actual ForKen staking contract
        
        emit Staked(forkenStaking, amount);
        return true;
    }

    /**
     * @notice Unstake tokens from a ForKen staking pool
     * @param poolId Pool identifier
     * @param amount Amount to unstake
     */
    function unstakeFromPool(
        uint256 poolId,
        uint256 amount
    ) external onlyVaultOrOwner nonReentrant returns (bool) {
        require(forkenStaking != address(0), "StrategyExecutor: staking not configured");
        
        emit Unstaked(forkenStaking, amount);
        return true;
    }

    /**
     * @notice Claim and reinvest rewards (compound)
     * @param poolId Pool identifier
     */
    function compound(uint256 poolId) external onlyVaultOrOwner nonReentrant returns (uint256 compounded) {
        require(forkenStaking != address(0), "StrategyExecutor: staking not configured");
        
        // In production:
        // 1. Claim pending rewards from pool
        // 2. Reinvest rewards back into the pool
        
        emit Compounded(forkenStaking, 0, 0);
        return 0;
    }

    /**
     * @notice Bridge tokens to another chain for better yields
     * @param targetChainId Target chain ID
     * @param token Token to bridge
     * @param amount Amount to bridge
     */
    function bridgeToChain(
        uint256 targetChainId,
        address token,
        uint256 amount
    ) external onlyVaultOrOwner nonReentrant returns (bool) {
        require(forkenBridge != address(0), "StrategyExecutor: bridge not configured");
        require(amount > 0, "StrategyExecutor: amount must be > 0");
        
        // In production, this would call the ForKen Bridge contract
        
        emit BridgeInitiated(targetChainId, amount);
        return true;
    }

    /**
     * @notice Execute a custom strategy
     * @param strategyId Strategy identifier
     * @param data Encoded call data
     */
    function executeCustomStrategy(
        bytes32 strategyId,
        bytes calldata data
    ) external onlyVaultOrOwner nonReentrant returns (bool success, bytes memory result) {
        Strategy storage strategy = strategies[strategyId];
        require(strategy.isActive, "StrategyExecutor: strategy not active");
        
        (success, result) = strategy.targetContract.call(data);
        
        emit StrategyExecuted(strategyId, 0, success);
        return (success, result);
    }

    // ============ View Functions ============
    
    /**
     * @notice Get all registered strategy IDs
     */
    function getAllStrategyIds() external view returns (bytes32[] memory) {
        return strategyIds;
    }

    /**
     * @notice Get strategy by ID
     * @param strategyId Strategy identifier
     */
    function getStrategy(bytes32 strategyId) external view returns (Strategy memory) {
        return strategies[strategyId];
    }

    /**
     * @notice Check if a strategy is active
     * @param strategyId Strategy identifier
     */
    function isStrategyActive(bytes32 strategyId) external view returns (bool) {
        return strategies[strategyId].isActive;
    }

    // ============ Admin Functions ============
    
    /**
     * @notice Register a new strategy
     * @param name Strategy name
     * @param targetContract Target contract address
     */
    function registerStrategy(
        string calldata name,
        address targetContract
    ) external onlyOwner returns (bytes32 strategyId) {
        strategyId = keccak256(abi.encodePacked(name, targetContract, block.timestamp));
        
        strategies[strategyId] = Strategy({
            name: name,
            targetContract: targetContract,
            isActive: true,
            totalDeployed: 0,
            totalReturned: 0
        });
        
        strategyIds.push(strategyId);
        
        emit StrategyRegistered(strategyId, name, targetContract);
    }

    /**
     * @notice Update AIVault address
     * @param newVault New vault address
     */
    function setAIVault(address newVault) external onlyOwner {
        require(newVault != address(0), "StrategyExecutor: invalid vault address");
        aiVault = newVault;
    }

    /**
     * @notice Configure ForKen Staking contract
     * @param _staking Staking contract address
     */
    function setForKenStaking(address _staking) external onlyOwner {
        forkenStaking = _staking;
    }

    /**
     * @notice Configure ForKen Bridge contract
     * @param _bridge Bridge contract address
     */
    function setForKenBridge(address _bridge) external onlyOwner {
        forkenBridge = _bridge;
    }

    /**
     * @notice Activate or deactivate a strategy
     * @param strategyId Strategy identifier
     * @param active Active status
     */
    function setStrategyActive(bytes32 strategyId, bool active) external onlyOwner {
        strategies[strategyId].isActive = active;
    }

    /**
     * @notice Recover stuck tokens
     * @param token Token address
     * @param to Recipient address
     * @param amount Amount to recover
     */
    function recoverTokens(address token, address to, uint256 amount) external onlyOwner {
        if (token == address(0)) {
            (bool success, ) = to.call{value: amount}("");
            require(success, "StrategyExecutor: BNB transfer failed");
        } else {
            IERC20(token).safeTransfer(to, amount);
        }
    }

    // ============ Receive Function ============
    
    receive() external payable {}
}
