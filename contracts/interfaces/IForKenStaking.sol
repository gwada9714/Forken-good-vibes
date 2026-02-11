// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IForKenStaking
 * @dev Interface for ForKen Staking contract
 */
interface IForKenStaking {
    struct Pool {
        uint256 poolId;
        address stakingToken;
        address rewardToken;
        uint256 rewardPerBlock;
        uint256 totalStaked;
        uint256 minStakeAmount;
        uint256 lockDuration;
        bool isActive;
    }

    struct UserStake {
        uint256 amount;
        uint256 rewardDebt;
        uint256 pendingRewards;
        uint256 stakeTime;
        uint256 unlockTime;
    }

    /**
     * @notice Stake tokens into a pool
     * @param poolId Pool identifier
     * @param amount Amount to stake
     */
    function stake(uint256 poolId, uint256 amount) external;

    /**
     * @notice Unstake tokens from a pool
     * @param poolId Pool identifier
     * @param amount Amount to unstake
     */
    function unstake(uint256 poolId, uint256 amount) external;

    /**
     * @notice Claim pending rewards from a pool
     * @param poolId Pool identifier
     */
    function claimRewards(uint256 poolId) external;

    /**
     * @notice Get pool information
     * @param poolId Pool identifier
     */
    function getPool(uint256 poolId) external view returns (Pool memory);

    /**
     * @notice Get user stake information
     * @param poolId Pool identifier
     * @param user User address
     */
    function getUserStake(uint256 poolId, address user) external view returns (UserStake memory);

    /**
     * @notice Get pending rewards for a user
     * @param poolId Pool identifier
     * @param user User address
     */
    function pendingRewards(uint256 poolId, address user) external view returns (uint256);

    /**
     * @notice Get current APY for a pool
     * @param poolId Pool identifier
     */
    function getPoolAPY(uint256 poolId) external view returns (uint256);
}
