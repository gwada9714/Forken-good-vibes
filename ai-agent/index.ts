import { getDecisionEngine } from './decision-engine';
import { getRiskAnalyzer } from './risk-analyzer';
import { getExecutor } from './executor';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Scheduler - Main entry point for the AI Agent
 * Runs periodic analysis and executes decisions
 */

const CHECK_INTERVAL = parseInt(process.env.CHECK_INTERVAL || '3600') * 1000; // Default 1 hour

// Mock pool data (in production, fetch from blockchain/API)
function getMockPools() {
    return [
        {
            poolId: 1,
            name: 'BNB-BUSD Staking',
            apy: 12.5,
            tvl: 1000000,
            riskScore: 3,
            lockDuration: 30,
        },
        {
            poolId: 2,
            name: 'ForKen Premium Pool',
            apy: 25.0,
            tvl: 500000,
            riskScore: 5,
            lockDuration: 90,
        },
        {
            poolId: 3,
            name: 'High Yield Pool',
            apy: 45.0,
            tvl: 100000,
            riskScore: 8,
            lockDuration: 180,
        },
    ];
}

async function runAnalysisCycle(): Promise<void> {
    console.log('\n' + '='.repeat(60));
    console.log('🔄 Starting analysis cycle:', new Date().toISOString());
    console.log('='.repeat(60));

    try {
        const decisionEngine = getDecisionEngine();
        const riskAnalyzer = getRiskAnalyzer();
        const executor = getExecutor();

        // Get vault status
        const vaultStatus = await executor.getVaultStatus();
        console.log('\n📊 Vault Status:');
        console.log('   TVL:', vaultStatus.tvl, 'BNB');
        console.log('   Actions executed:', vaultStatus.actionCount);

        // Get agent balance
        const agentBalance = await executor.getAgentBalance();
        console.log('   Agent balance:', agentBalance, 'BNB');

        // Get market context
        const pools = getMockPools();
        const context = {
            pools,
            userBalance: vaultStatus.tvl,
            currentPositions: [], // In production, fetch from contract
            gasPrice: '5', // In production, fetch from provider
            timestamp: Date.now(),
        };

        // Check for risks
        console.log('\n⚠️ Risk Analysis:');
        const riskAlerts: any[] = [];
        for (const pool of pools) {
            // Mock metrics (in production, fetch actual data)
            const metrics = {
                poolId: pool.poolId,
                tvlChange24h: Math.random() * 10 - 5, // Random -5% to +5%
                apyChange24h: Math.random() * 10 - 5,
                utilizationRate: 50 + Math.random() * 40,
                largeTxCount24h: Math.floor(Math.random() * 5),
            };

            const alert = riskAnalyzer.analyzePool(metrics);
            if (alert) {
                console.log(`   [${alert.level.toUpperCase()}] ${alert.message}`);
                riskAlerts.push(alert);
            }
        }

        if (riskAlerts.length === 0) {
            console.log('   ✅ No risk alerts');
        }

        // Check for emergency unstake
        if (riskAnalyzer.shouldEmergencyUnstake(riskAlerts)) {
            console.log('\n🚨 EMERGENCY: Critical risk detected!');
            // Execute emergency unstake
            // In production, this would unstake all positions
            return;
        }

        // Get AI decision
        console.log('\n🤖 AI Analysis:');
        const decision = await decisionEngine.analyze(context);
        console.log('   Decision:', decision.action);
        console.log('   Reasoning:', decision.reasoning);
        console.log('   Confidence:', decision.confidence + '%');

        // Execute decision
        if (decision.action !== 'hold') {
            const result = await executor.execute(decision);
            if (result.success) {
                console.log('   ✅ Execution successful');
                if (result.txHash) {
                    console.log('   TX:', result.txHash);
                }
            } else {
                console.log('   ❌ Execution failed:', result.error);
            }
        }

        console.log('\n✅ Analysis cycle complete');
    } catch (error) {
        console.error('❌ Analysis cycle failed:', error);
    }
}

async function main() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║           ForKen AI Vault - Autonomous Agent               ║');
    console.log('║        BNB Good Vibes Only: OpenClaw Edition               ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('\nAgent starting...');
    console.log('Check interval:', CHECK_INTERVAL / 1000, 'seconds');

    // Run initial cycle
    await runAnalysisCycle();

    // Schedule periodic runs
    setInterval(runAnalysisCycle, CHECK_INTERVAL);

    console.log('\n🟢 Agent is running. Press Ctrl+C to stop.');
}

// Handle shutdown
process.on('SIGINT', () => {
    console.log('\n\n👋 Agent shutting down...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n\n👋 Agent shutting down...');
    process.exit(0);
});

main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
