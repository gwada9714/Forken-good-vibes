// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SimpleToken
 * @dev Basic ERC20 token created by the AITokenFactory
 */
contract SimpleToken is ERC20, Ownable {
    uint8 private _decimals;

    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 initialSupply_,
        address owner_
    ) ERC20(name_, symbol_) Ownable(owner_) {
        _decimals = decimals_;
        _mint(owner_, initialSupply_);
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
}

/**
 * @title AITokenFactory
 * @dev AI-assisted token creation factory for BNB Good Vibes Only Hackathon
 * @notice The AI agent ONLY analyzes and suggests - USER signs all transactions
 * 
 * Key principles:
 * - NO agent private key involved
 * - NO fund management
 * - User always signs with their own wallet
 * - Factory only deploys tokens on user's behalf
 */
contract AITokenFactory is Ownable {
    // ============ Events ============
    
    event TokenCreated(
        address indexed creator,
        address indexed tokenAddress,
        string name,
        string symbol,
        uint256 initialSupply,
        uint256 timestamp
    );

    // ============ State ============
    
    /// @notice All tokens created by this factory
    address[] public createdTokens;
    
    /// @notice Tokens created by each user
    mapping(address => address[]) public userTokens;
    
    /// @notice Token creation count
    uint256 public tokenCount;

    // ============ Constructor ============
    
    constructor() Ownable(msg.sender) {}

    // ============ Main Function ============
    
    /**
     * @notice Create a new ERC20 token
     * @dev Called directly by the user (not an agent) - user signs with their wallet
     * @param name Token name (e.g., "My Token")
     * @param symbol Token symbol (e.g., "MTK")
     * @param decimals Token decimals (usually 18)
     * @param initialSupply Initial supply (in smallest units, e.g., 1000000 * 10^18)
     * @return tokenAddress The address of the newly created token
     */
    function createToken(
        string memory name,
        string memory symbol,
        uint8 decimals,
        uint256 initialSupply
    ) external returns (address tokenAddress) {
        require(bytes(name).length > 0, "AITokenFactory: name required");
        require(bytes(symbol).length > 0, "AITokenFactory: symbol required");
        require(bytes(symbol).length <= 11, "AITokenFactory: symbol too long");
        require(initialSupply > 0, "AITokenFactory: supply must be > 0");

        // Deploy new token - ownership goes to the caller (user), NOT an agent
        SimpleToken newToken = new SimpleToken(
            name,
            symbol,
            decimals,
            initialSupply,
            msg.sender  // User owns the token, NOT the factory or any agent
        );

        tokenAddress = address(newToken);
        
        // Track the token
        createdTokens.push(tokenAddress);
        userTokens[msg.sender].push(tokenAddress);
        tokenCount++;

        emit TokenCreated(
            msg.sender,
            tokenAddress,
            name,
            symbol,
            initialSupply,
            block.timestamp
        );

        return tokenAddress;
    }

    // ============ View Functions ============
    
    /**
     * @notice Get all tokens created by a user
     * @param user The user address
     * @return Array of token addresses
     */
    function getUserTokens(address user) external view returns (address[] memory) {
        return userTokens[user];
    }

    /**
     * @notice Get total number of tokens created
     * @return The count
     */
    function getTokenCount() external view returns (uint256) {
        return tokenCount;
    }

    /**
     * @notice Get all created tokens (paginated)
     * @param offset Start index
     * @param limit Max tokens to return
     * @return Array of token addresses
     */
    function getTokens(uint256 offset, uint256 limit) external view returns (address[] memory) {
        uint256 total = createdTokens.length;
        if (offset >= total) {
            return new address[](0);
        }
        
        uint256 end = offset + limit;
        if (end > total) {
            end = total;
        }
        
        address[] memory result = new address[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = createdTokens[i];
        }
        
        return result;
    }
}
