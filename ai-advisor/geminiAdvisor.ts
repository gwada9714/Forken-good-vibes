import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Gemini AI Advisor for Token Creation (FREE — Google AI Studio)
 *
 * Takes a natural language project description and uses Gemini API
 * to suggest optimal token parameters (name, symbol, supply, decimals).
 *
 * This module makes a REAL API call to Gemini (free tier).
 * The user reviews suggestions and decides — AI only advises.
 *
 * Get a free API key at: https://aistudio.google.com/
 */

export interface ProjectDescription {
    description: string;
    targetAudience?: string;
    useCase?: string;
}

export interface TokenSuggestion {
    name: string;
    symbol: string;
    decimals: number;
    initialSupply: string;
    reasoning: string;
    alternatives?: {
        name: string;
        symbol: string;
    }[];
}

export interface AIAdvisorResponse {
    success: boolean;
    suggestion?: TokenSuggestion;
    error?: string;
    model: string;
    usage?: {
        inputTokens: number;
        outputTokens: number;
    };
}

export class GeminiAdvisor {
    private genAI: GoogleGenerativeAI;
    private modelName: string;

    constructor(apiKey?: string) {
        const key = apiKey || process.env.GOOGLE_AI_API_KEY;
        if (!key) {
            throw new Error(
                'GOOGLE_AI_API_KEY not set. Get a free key at https://aistudio.google.com/ — Provide it as constructor argument or in .env file.'
            );
        }

        this.genAI = new GoogleGenerativeAI(key);
        this.modelName = 'gemini-2.0-flash';
    }

    /**
     * Analyze a project description and suggest token parameters
     */
    async suggestTokenParams(project: ProjectDescription): Promise<AIAdvisorResponse> {
        const prompt = this.buildPrompt(project);

        try {
            const model = this.genAI.getGenerativeModel({ model: this.modelName });
            const result = await model.generateContent(prompt);
            const response = result.response;
            const text = response.text();

            const suggestion = this.parseResponse(text);

            return {
                success: true,
                suggestion,
                model: this.modelName,
                usage: response.usageMetadata
                    ? {
                        inputTokens: response.usageMetadata.promptTokenCount || 0,
                        outputTokens: response.usageMetadata.candidatesTokenCount || 0,
                    }
                    : undefined,
            };
        } catch (error: any) {
            console.error('Gemini API call failed:', error.message);
            return {
                success: false,
                error: error.message,
                model: this.modelName,
            };
        }
    }

    private buildPrompt(project: ProjectDescription): string {
        let prompt = `You are an AI assistant helping users create ERC-20 tokens on BNB Chain.

The user will describe their project. Based on their description, suggest token parameters that are appropriate for their use case.

RULES:
- Token name: 3-32 characters, descriptive and professional
- Token symbol: 2-11 characters, uppercase letters and numbers only
- Decimals: 0-18 (18 is standard for most tokens, 0 for indivisible tokens)
- Initial supply: a reasonable number for the use case (e.g., 1M for utility tokens, 21M for Bitcoin-like scarcity, 1B for gaming tokens)
- Do NOT suggest names or symbols that mimic existing major tokens (BTC, ETH, BNB, USDT, etc.)
- Provide clear reasoning for each parameter choice

USER PROJECT DESCRIPTION:
${project.description}`;

        if (project.targetAudience) {
            prompt += `\n\nTARGET AUDIENCE: ${project.targetAudience}`;
        }

        if (project.useCase) {
            prompt += `\n\nUSE CASE: ${project.useCase}`;
        }

        prompt += `

Respond in this EXACT JSON format (no markdown, no code blocks, just raw JSON):
{
  "name": "Suggested Token Name",
  "symbol": "SYM",
  "decimals": 18,
  "initialSupply": "1000000",
  "reasoning": "Brief explanation of why these parameters fit the project",
  "alternatives": [
    { "name": "Alternative Name 1", "symbol": "ALT1" },
    { "name": "Alternative Name 2", "symbol": "ALT2" }
  ]
}`;

        return prompt;
    }

    private parseResponse(text: string): TokenSuggestion {
        // Extract JSON from response (Gemini may add text around it)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No JSON found in Gemini response');
        }

        const parsed = JSON.parse(jsonMatch[0]);

        // Validate required fields
        if (!parsed.name || !parsed.symbol || !parsed.initialSupply) {
            throw new Error('Gemini response missing required fields');
        }

        return {
            name: String(parsed.name),
            symbol: String(parsed.symbol).toUpperCase(),
            decimals: Number(parsed.decimals) || 18,
            initialSupply: String(parsed.initialSupply),
            reasoning: String(parsed.reasoning || 'No reasoning provided'),
            alternatives: Array.isArray(parsed.alternatives)
                ? parsed.alternatives.map((alt: any) => ({
                    name: String(alt.name),
                    symbol: String(alt.symbol).toUpperCase(),
                }))
                : undefined,
        };
    }
}

// Convenience function for one-shot usage
export async function getAISuggestion(
    description: string,
    options?: { targetAudience?: string; useCase?: string }
): Promise<AIAdvisorResponse> {
    const advisor = new GeminiAdvisor();
    return advisor.suggestTokenParams({
        description,
        targetAudience: options?.targetAudience,
        useCase: options?.useCase,
    });
}
