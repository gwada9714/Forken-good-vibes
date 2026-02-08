// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IForKenBridge
 * @dev Interface for ForKen Bridge contract
 */
interface IForKenBridge {
    struct BridgeRequest {
        uint256 requestId;
        address sender;
        address recipient;
        address token;
        uint256 amount;
        uint256 sourceChainId;
        uint256 targetChainId;
        uint256 timestamp;
        uint8 status; // 0: pending, 1: completed, 2: failed
    }

    /**
     * @notice Initiate a cross-chain transfer
     * @param token Token to bridge
     * @param amount Amount to bridge
     * @param targetChainId Target chain ID
     * @param recipient Recipient on target chain
     */
    function bridge(
        address token,
        uint256 amount,
        uint256 targetChainId,
        address recipient
    ) external payable returns (uint256 requestId);

    /**
     * @notice Get bridge request details
     * @param requestId Request identifier
     */
    function getBridgeRequest(uint256 requestId) external view returns (BridgeRequest memory);

    /**
     * @notice Get bridge fee for a transfer
     * @param token Token to bridge
     * @param amount Amount to bridge
     * @param targetChainId Target chain ID
     */
    function getBridgeFee(
        address token,
        uint256 amount,
        uint256 targetChainId
    ) external view returns (uint256 fee);

    /**
     * @notice Check if a chain is supported
     * @param chainId Chain ID to check
     */
    function isSupportedChain(uint256 chainId) external view returns (bool);

    /**
     * @notice Get supported tokens for bridging
     */
    function getSupportedTokens() external view returns (address[] memory);
}
