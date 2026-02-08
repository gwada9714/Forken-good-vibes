import { ethers, Contract, Wallet } from 'ethers';
import * as dotenv from 'dotenv';
import { getDecisionEngine, type Decision } from './decision-engine';

dotenv.config();

// ABIs (simplified for key functions)
const AI_VAULT_ABI = [
    'function executeStrategy(uint8 actionType, address target, bytes calldata data, string calldata reasoning) external returns (bool success, bytes memory result)',
    'function totalValueLocked() external view returns (uint256)',
    'function getActionCount() external view returns (uint256)',
    'function getRecentActions(uint256 count) external view returns (tuple(uint8 actionType, address target, uint256 amount, uint256 timestamp, string reasoning)[])',
];

const STRATEGY_EXECUTOR_ABI = [
    'function stakeToPool(uint256 poolId, uint256 amount) external returns (bool)',
    'function unstakeFromPool(uint256 poolId, uint256 amount) external returns (bool)',
    'function compound(uint256 poolId) external returns (uint256)',
    'function bridgeToChain(uint256 targetChainId, address token, uint256 amount) external returns (bool)',
];

/**
 * Executor - Executes AI decisions onchain
 */
export class Executor {
    private provider: ethers.JsonRpcProvider;
    private wallet: Wallet;
    private aiVault: Contract;
    private strategyExecutor: Contract;
    private strategyExecutorInterface: ethers.Interface;

    constructor() {
        // Validate environment
        if (!process.env.AI_AGENT_PRIVATE_KEY) {
            throw new Error('AI_AGENT_PRIVATE_KEY not set');
        }
        if (!process.env.AI_VAULT_ADDRESS) {
            throw new Error('AI_VAULT_ADDRESS not set');
        }
        if (!process.env.STRATEGY_EXECUTOR_ADDRESS) {
            throw new Error('STRATEGY_EXECUTOR_ADDRESS not set');
        }

        // Setup provider and wallet
        const rpcUrl = process.env.BSC_RPC || 'https://bsc-dataseed1.binance.org/';
        this.provider = new ethers.JsonRpcProvider(rpcUrl);
        this.wallet = new Wallet(process.env.AI_AGENT_PRIVATE_KEY, this.provider);

        // Setup contracts
        this.aiVault = new Contract(
            process.env.AI_VAULT_ADDRESS,
            AI_VAULT_ABI,
            this.wallet
        );

        this.strategyExecutor = new Contract(
            process.env.STRATEGY_EXECUTOR_ADDRESS,
            STRATEGY_EXECUTOR_ABI,
            this.wallet
        );

        this.strategyExecutorInterface = new ethers.Interface(STRATEGY_EXECUTOR_ABI);

        console.log('Executor initialized');
        console.log('  Agent address:', this.wallet.address);
        console.log('  AIVault:', process.env.AI_VAULT_ADDRESS);
        console.log('  StrategyExecutor:', process.env.STRATEGY_EXECUTOR_ADDRESS);
    }

    /**
     * Execute a decision from the AI
     */
    async execute(decision: Decision): Promise<{
        success: boolean;
        txHash?: string;
        error?: string;
    }> {
        console.log(`\n🤖 Executing decision: ${decision.action}`);
        console.log(`   Reasoning: ${decision.reasoning}`);
        console.log(`   Confidence: ${decision.confidence}%`);

        // Skip if confidence too low
        if (decision.confidence < 60) {
            console.log('   ⚠️ Confidence too low, skipping execution');
            return { success: false, error: 'Confidence below threshold' };
        }

        // Skip hold action
        if (decision.action === 'hold') {
            console.log('   ✅ Hold action - no execution needed');
            return { success: true };
        }

        try {
            let actionType: number;
            let data: string;

            switch (decision.action) {
                case 'stake':
                    actionType = 0;
                    data = this.strategyExecutorInterface.encodeFunctionData('stakeToPool', [
                        decision.poolId || 0,
                        ethers.parseEther(decision.amount || '0'),
                    ]);
                    break;

                case 'unstake':
                    actionType = 1;
                    data = this.strategyExecutorInterface.encodeFunctionData('unstakeFromPool', [
                        decision.poolId || 0,
                        ethers.parseEther(decision.amount || '0'),
                    ]);
                    break;

                case 'compound':
                    actionType = 2;
                    data = this.strategyExecutorInterface.encodeFunctionData('compound', [
                        decision.poolId || 0,
                    ]);
                    break;

                case 'bridge':
                    actionType = 3;
                    data = this.strategyExecutorInterface.encodeFunctionData('bridgeToChain', [
                        decision.targetChainId || 204, // Default to opBNB
                        ethers.ZeroAddress, // BNB
                        ethers.parseEther(decision.amount || '0'),
                    ]);
                    break;

                default:
                    return { success: false, error: `Unknown action: ${decision.action}` };
            }

            // Estimate gas
            const gasEstimate = await this.aiVault.executeStrategy.estimateGas(
                actionType,
                process.env.STRATEGY_EXECUTOR_ADDRESS,
                data,
                decision.reasoning
            );

            console.log(`   Gas estimate: ${gasEstimate.toString()}`);

            // Execute the transaction
            const tx = await this.aiVault.executeStrategy(
                actionType,
                process.env.STRATEGY_EXECUTOR_ADDRESS,
                data,
                decision.reasoning,
                {
                    gasLimit: gasEstimate * 120n / 100n, // 20% buffer
                }
            );

            console.log(`   📤 Transaction sent: ${tx.hash}`);

            // Wait for confirmation
            const receipt = await tx.wait();
            console.log(`   ✅ Confirmed in block ${receipt.blockNumber}`);

            return {
                success: true,
                txHash: tx.hash,
            };
        } catch (error: any) {
            console.error('   ❌ Execution failed:', error.message);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    /**
     * Get current vault status
     */
    async getVaultStatus(): Promise<{
        tvl: string;
        actionCount: number;
        recentActions: any[];
    }> {
        const tvl = await this.aiVault.totalValueLocked();
        const actionCount = await this.aiVault.getActionCount();
        const recentActions = actionCount > 0
            ? await this.aiVault.getRecentActions(Math.min(5, Number(actionCount)))
            : [];

        return {
            tvl: ethers.formatEther(tvl),
            actionCount: Number(actionCount),
            recentActions,
        };
    }

    /**
     * Get agent wallet balance
     */
    async getAgentBalance(): Promise<string> {
        const balance = await this.provider.getBalance(this.wallet.address);
        return ethers.formatEther(balance);
    }
}

// Singleton instance
let executor: Executor | null = null;

export function getExecutor(): Executor {
    if (!executor) {
        executor = new Executor();
    }
    return executor;
}
