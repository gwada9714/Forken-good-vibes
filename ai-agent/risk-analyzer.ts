import { ethers } from 'ethers';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Risk Analyzer for ForKen AI Vault
 * Monitors positions and detects risk conditions
 */

interface RiskAlert {
    level: 'low' | 'medium' | 'high' | 'critical';
    type: string;
    message: string;
    suggestion: string;
    timestamp: number;
}

interface PoolMetrics {
    poolId: number;
    tvlChange24h: number;      // Percentage
    apyChange24h: number;      // Percentage points
    utilizationRate: number;   // 0-100%
    largeTxCount24h: number;   // Number of large transactions
}

export class RiskAnalyzer {
    private riskThresholds: {
        tvlDropCritical: number;
        tvlDropHigh: number;
        apyDropCritical: number;
        apyDropHigh: number;
        utilizationHigh: number;
        largeTxWarning: number;
    };

    constructor() {
        // Default risk thresholds
        this.riskThresholds = {
            tvlDropCritical: -30,  // 30% drop
            tvlDropHigh: -15,      // 15% drop
            apyDropCritical: -50,  // 50% APY reduction
            apyDropHigh: -25,      // 25% APY reduction
            utilizationHigh: 90,   // 90% utilization
            largeTxWarning: 10,    // 10 large txs in 24h
        };
    }

    /**
     * Analyze a pool for risk signals
     */
    analyzePool(metrics: PoolMetrics): RiskAlert | null {
        // Check TVL changes
        if (metrics.tvlChange24h <= this.riskThresholds.tvlDropCritical) {
            return {
                level: 'critical',
                type: 'TVL_CRASH',
                message: `Pool ${metrics.poolId}: TVL dropped ${Math.abs(metrics.tvlChange24h).toFixed(1)}% in 24h`,
                suggestion: 'Immediate unstake recommended',
                timestamp: Date.now(),
            };
        }

        if (metrics.tvlChange24h <= this.riskThresholds.tvlDropHigh) {
            return {
                level: 'high',
                type: 'TVL_DROP',
                message: `Pool ${metrics.poolId}: TVL dropped ${Math.abs(metrics.tvlChange24h).toFixed(1)}% in 24h`,
                suggestion: 'Consider reducing position',
                timestamp: Date.now(),
            };
        }

        // Check APY changes
        if (metrics.apyChange24h <= this.riskThresholds.apyDropCritical) {
            return {
                level: 'high',
                type: 'APY_CRASH',
                message: `Pool ${metrics.poolId}: APY reduced by ${Math.abs(metrics.apyChange24h).toFixed(1)}%`,
                suggestion: 'Evaluate alternative pools',
                timestamp: Date.now(),
            };
        }

        // Check utilization
        if (metrics.utilizationRate >= this.riskThresholds.utilizationHigh) {
            return {
                level: 'medium',
                type: 'HIGH_UTILIZATION',
                message: `Pool ${metrics.poolId}: Utilization at ${metrics.utilizationRate.toFixed(1)}%`,
                suggestion: 'Withdrawal delays possible',
                timestamp: Date.now(),
            };
        }

        // Check unusual activity
        if (metrics.largeTxCount24h >= this.riskThresholds.largeTxWarning) {
            return {
                level: 'medium',
                type: 'UNUSUAL_ACTIVITY',
                message: `Pool ${metrics.poolId}: ${metrics.largeTxCount24h} large transactions in 24h`,
                suggestion: 'Monitor closely for whale activity',
                timestamp: Date.now(),
            };
        }

        return null;
    }

    /**
     * Calculate overall portfolio risk score
     */
    calculatePortfolioRisk(
        positions: { poolId: number; amount: string; poolRiskScore: number }[],
        totalValue: string
    ): {
        score: number;
        diversification: number;
        concentration: number;
        recommendations: string[];
    } {
        if (positions.length === 0) {
            return {
                score: 0,
                diversification: 0,
                concentration: 0,
                recommendations: ['No positions to analyze'],
            };
        }

        const total = parseFloat(totalValue);
        const recommendations: string[] = [];

        // Calculate concentration (largest position %)
        const amounts = positions.map(p => parseFloat(p.amount));
        const maxPosition = Math.max(...amounts);
        const concentration = (maxPosition / total) * 100;

        if (concentration > 70) {
            recommendations.push('High concentration risk - consider diversifying');
        }

        // Calculate diversification score (0-100)
        const diversification = Math.min(positions.length * 20, 100);

        if (diversification < 40) {
            recommendations.push('Low diversification - add more pools');
        }

        // Calculate weighted risk score
        let weightedRisk = 0;
        for (const pos of positions) {
            const weight = parseFloat(pos.amount) / total;
            weightedRisk += pos.poolRiskScore * weight;
        }

        // Final score (0-100, lower is safer)
        const score = Math.round(
            (weightedRisk * 10 + concentration * 0.3 - diversification * 0.2)
        );

        return {
            score: Math.max(0, Math.min(100, score)),
            diversification,
            concentration,
            recommendations,
        };
    }

    /**
     * Check if emergency unstake is needed
     */
    shouldEmergencyUnstake(alerts: RiskAlert[]): boolean {
        return alerts.some(a => a.level === 'critical');
    }
}

// Singleton instance
let riskAnalyzer: RiskAnalyzer | null = null;

export function getRiskAnalyzer(): RiskAnalyzer {
    if (!riskAnalyzer) {
        riskAnalyzer = new RiskAnalyzer();
    }
    return riskAnalyzer;
}
