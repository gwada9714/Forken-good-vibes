import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Claude AI Advisor for Token Creation
 *
 * Takes a natural language project description and uses Claude API
 * to suggest optimal token parameters (name, symbol, supply, decimals).
 *
 * This module makes a REAL API call to Claude.
 * The user reviews suggestions and decides — Claude only advises.
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

export interface ClaudeAdvisorResponse {
    success: boolean;
    suggestion?: TokenSuggestion;
    error?: string;
    model: string;
    usage?: {
        inputTokens: number;
        outputTokens: number;
    };
}

export class ClaudeAdvisor {
    private anthropic: Anthropic;
    private model: string;

    constructor(apiKey?: string) {
        const key = apiKey || process.env.ANTHROPIC_API_KEY;
        if (!key) {
            throw new Error(
                'ANTHROPIC_API_KEY not set. Provide it as constructor argument or in .env file.'
            );
        }

        this.anthropic = new Anthropic({ apiKey: key });
        this.model = 'claude-sonnet-4-20250514';
    }

    /**
     * Analyze a project description and suggest token parameters
     */
    async suggestTokenParams(project: ProjectDescription): Promise<ClaudeAdvisorResponse> {
        const prompt = this.buildPrompt(project);

        try {
            const response = await this.anthropic.messages.create({
                model: this.model,
                max_tokens: 1024,
                messages: [
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
            });

            const content = response.content[0];
            if (content.type !== 'text') {
                throw new Error('Unexpected response type from Claude');
            }

            const suggestion = this.parseResponse(content.text);

            return {
                success: true,
                suggestion,
                model: this.model,
                usage: {
                    inputTokens: response.usage.input_tokens,
                    outputTokens: response.usage.output_tokens,
                },
            };
        } catch (error: any) {
            console.error('Claude API call failed:', error.message);
            return {
                success: false,
                error: error.message,
                model: this.model,
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
        // Extract JSON from response (Claude may add text around it)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No JSON found in Claude response');
        }

        const parsed = JSON.parse(jsonMatch[0]);

        // Validate required fields
        if (!parsed.name || !parsed.symbol || !parsed.initialSupply) {
            throw new Error('Claude response missing required fields');
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
): Promise<ClaudeAdvisorResponse> {
    const advisor = new ClaudeAdvisor();
    return advisor.suggestTokenParams({
        description,
        targetAudience: options?.targetAudience,
        useCase: options?.useCase,
    });
}
