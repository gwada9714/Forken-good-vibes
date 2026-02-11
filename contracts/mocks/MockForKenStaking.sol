// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title MockForKenStaking
 * @dev Mock staking contract for testing AIVault
 */
contract MockForKenStaking {
    mapping(uint256 => mapping(address => uint256)) public stakes;
    
    event Staked(address indexed user, uint256 indexed poolId, uint256 amount);
    event Unstaked(address indexed user, uint256 indexed poolId, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 indexed poolId, uint256 amount);
    
    function stake(uint256 poolId, uint256 amount) external {
        stakes[poolId][msg.sender] += amount;
        emit Staked(msg.sender, poolId, amount);
    }
    
    function unstake(uint256 poolId, uint256 amount) external {
        require(stakes[poolId][msg.sender] >= amount, "Insufficient stake");
        stakes[poolId][msg.sender] -= amount;
        emit Unstaked(msg.sender, poolId, amount);
    }
    
    function claimRewards(uint256 poolId) external returns (uint256) {
        // Mock: return 0 rewards
        emit RewardsClaimed(msg.sender, poolId, 0);
        return 0;
    }
    
    function getPendingRewards(uint256 poolId, address user) external pure returns (uint256) {
        return 0;
    }
    
    function getUserStake(uint256 poolId, address user) external view returns (uint256) {
        return stakes[poolId][user];
    }
    
    function getPoolAPY(uint256 poolId) external pure returns (uint256) {
        return 1000; // 10% mock APY
    }
}
