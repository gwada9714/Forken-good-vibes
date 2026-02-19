import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * AI Decision Engine for ForKen AI Vault
 * Uses Gemini (free tier) to analyze market conditions and make DeFi decisions
 */

interface PoolInfo {
    poolId: number;
    name: string;
    apy: number;
    tvl: number;
    riskScore: number;
    lockDuration: number;
}

export interface Decision {
    action: 'stake' | 'unstake' | 'compound' | 'bridge' | 'hold';
    poolId?: number;
    amount?: string;
    targetChainId?: number;
    reasoning: string;
    confidence: number;
}

interface MarketContext {
    pools: PoolInfo[];
    userBalance: string;
    currentPositions: { poolId: number; amount: string }[];
    gasPrice: string;
    timestamp: number;
}

export class DecisionEngine {
    private genAI: GoogleGenerativeAI;
    private modelName: string;
    private riskTolerance: number;

    constructor() {
        if (!process.env.GOOGLE_AI_API_KEY) {
            throw new Error('GOOGLE_AI_API_KEY not set. Get a free key at https://aistudio.google.com/');
        }

        this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
        this.modelName = 'gemini-2.5-flash';
        this.riskTolerance = parseInt(process.env.RISK_TOLERANCE || '5');
    }

    /**
     * Analyze market conditions and decide on the best action
     */
    async analyze(context: MarketContext): Promise<Decision> {
        const prompt = this.buildPrompt(context);

        try {
            const model = this.genAI.getGenerativeModel({ model: this.modelName });
            const result = await model.generateContent(prompt);
            const response = result.response;
            const text = response.text();

            return this.parseDecision(text);
        } catch (error) {
            console.error('AI analysis failed:', error);
            // Default to holding if AI fails
            return {
                action: 'hold',
                reasoning: 'AI analysis failed, defaulting to hold position',
                confidence: 0,
            };
        }
    }

    private buildPrompt(context: MarketContext): string {
        return `You are an AI DeFi portfolio manager for the ForKen AI Vault on BNB Chain.
Your goal is to maximize yield while managing risk appropriately.

RISK TOLERANCE: ${this.riskTolerance}/10 (higher = more aggressive)

CURRENT MARKET CONDITIONS:
- User Balance: ${context.userBalance} BNB
- Gas Price: ${context.gasPrice} gwei
- Timestamp: ${new Date(context.timestamp).toISOString()}

AVAILABLE POOLS:
${context.pools.map(p => `
- Pool ${p.poolId} (${p.name}):
  APY: ${p.apy}%
  TVL: ${p.tvl} BNB
  Risk Score: ${p.riskScore}/10
  Lock Duration: ${p.lockDuration} days
`).join('')}

CURRENT POSITIONS:
${context.currentPositions.length === 0 ? 'No active positions' : context.currentPositions.map(pos => `- Pool ${pos.poolId}: ${pos.amount} BNB`).join('\n')}

Based on this information, decide on the SINGLE BEST action to take.
Consider:
1. Gas costs vs potential gains
2. Risk-adjusted returns
3. Lock duration constraints
4. Diversification benefits

Respond in this EXACT JSON format (no markdown, no code blocks, just raw JSON):
{
  "action": "stake" | "unstake" | "compound" | "bridge" | "hold",
  "poolId": <number if applicable>,
  "amount": "<amount in BNB if applicable>",
  "targetChainId": <chain id if bridging>,
  "reasoning": "<brief explanation>",
  "confidence": <0-100>
}`;
    }

    private parseDecision(text: string): Decision {
        try {
            // Extract JSON from response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in response');
            }

            const parsed = JSON.parse(jsonMatch[0]);

            return {
                action: parsed.action || 'hold',
                poolId: parsed.poolId,
                amount: parsed.amount,
                targetChainId: parsed.targetChainId,
                reasoning: parsed.reasoning || 'No reasoning provided',
                confidence: parsed.confidence || 0,
            };
        } catch (error) {
            console.error('Failed to parse AI decision:', error);
            return {
                action: 'hold',
                reasoning: 'Failed to parse AI response',
                confidence: 0,
            };
        }
    }
}

// Singleton instance
let decisionEngine: DecisionEngine | null = null;

export function getDecisionEngine(): DecisionEngine {
    if (!decisionEngine) {
        decisionEngine = new DecisionEngine();
    }
    return decisionEngine;
}
