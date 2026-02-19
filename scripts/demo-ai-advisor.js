/**
 * Demo: AI-Assisted Token Creation (Full Flow)
 *
 * This script demonstrates the complete Token Factory flow:
 * 1. User describes their project in natural language
 * 2. Gemini API (free) analyzes the description and suggests token parameters
 * 3. Rule-based analyzer validates the AI suggestions
 * 4. Parameters are ready for on-chain deployment
 *
 * Usage:
 *   node scripts/demo-ai-advisor.js
 *   node scripts/demo-ai-advisor.js "I want a token for my online gaming platform"
 *
 * Requires: GOOGLE_AI_API_KEY in .env (free at https://aistudio.google.com/)
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config();

// ============ Gemini Advisor (inline for demo, see ai-advisor/geminiAdvisor.ts for full module) ============

async function askGemini(projectDescription, options = {}) {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
        console.error('❌ GOOGLE_AI_API_KEY not set in .env');
        console.error('   Get a free key at: https://aistudio.google.com/');
        console.error('   Add it to .env: GOOGLE_AI_API_KEY=your_key_here');
        process.exit(1);
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = 'gemini-2.5-flash';

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
${projectDescription}`;

    if (options.targetAudience) {
        prompt += `\n\nTARGET AUDIENCE: ${options.targetAudience}`;
    }
    if (options.useCase) {
        prompt += `\n\nUSE CASE: ${options.useCase}`;
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

    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Extract JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error('No JSON found in Gemini response');
    }

    const suggestion = JSON.parse(jsonMatch[0]);

    return {
        suggestion: {
            name: String(suggestion.name),
            symbol: String(suggestion.symbol).toUpperCase(),
            decimals: Number(suggestion.decimals) || 18,
            initialSupply: String(suggestion.initialSupply),
            reasoning: String(suggestion.reasoning || ''),
            alternatives: suggestion.alternatives || [],
        },
        model: modelName,
        usage: response.usageMetadata ? {
            inputTokens: response.usageMetadata.promptTokenCount || 0,
            outputTokens: response.usageMetadata.candidatesTokenCount || 0,
        } : { inputTokens: 0, outputTokens: 0 },
    };
}

// ============ Rule-based Analyzer (mirrors ai-advisor/tokenAnalyzer.ts) ============

function analyzeTokenParams(params) {
    const suggestions = [];
    let score = 100;

    // Name analysis
    if (!params.name || params.name.trim().length === 0) {
        suggestions.push({ field: 'name', type: 'error', message: 'Token name is required' });
        score -= 30;
    } else {
        if (params.name.length < 3) {
            suggestions.push({ field: 'name', type: 'warning', message: 'Token name is very short.' });
            score -= 10;
        }
        if (params.name.length > 32) {
            suggestions.push({ field: 'name', type: 'warning', message: 'Token name is long. Some wallets may truncate it.' });
            score -= 5;
        }
        const suspiciousPatterns = ['scam', 'rug', 'moon', 'elon', '100x', '1000x'];
        const lowerName = params.name.toLowerCase();
        for (const pattern of suspiciousPatterns) {
            if (lowerName.includes(pattern)) {
                suggestions.push({ field: 'name', type: 'warning', message: `Name contains "${pattern}" which may trigger spam filters.` });
                score -= 15;
                break;
            }
        }
    }

    // Symbol analysis
    if (!params.symbol || params.symbol.trim().length === 0) {
        suggestions.push({ field: 'symbol', type: 'error', message: 'Token symbol is required' });
        score -= 30;
    } else {
        if (params.symbol.length < 2) {
            suggestions.push({ field: 'symbol', type: 'warning', message: 'Symbol is very short.' });
            score -= 5;
        }
        if (params.symbol.length > 11) {
            suggestions.push({ field: 'symbol', type: 'error', message: 'Symbol is too long (max 11 characters).' });
            score -= 20;
        }
        if (!/^[A-Z0-9]+$/.test(params.symbol)) {
            suggestions.push({ field: 'symbol', type: 'suggestion', message: 'Symbols are typically uppercase letters and numbers only.' });
            score -= 5;
        }
        const reserved = ['BTC', 'ETH', 'BNB', 'USDT', 'USDC', 'BUSD', 'DAI'];
        if (reserved.includes(params.symbol.toUpperCase())) {
            suggestions.push({ field: 'symbol', type: 'warning', message: `"${params.symbol}" is a well-known token symbol.` });
            score -= 10;
        }
    }

    // Decimals analysis
    if (params.decimals < 0 || params.decimals > 18) {
        suggestions.push({ field: 'decimals', type: 'error', message: 'Decimals must be between 0 and 18.' });
        score -= 20;
    }

    // Supply analysis
    const supply = parseFloat(params.initialSupply);
    if (isNaN(supply) || supply <= 0) {
        suggestions.push({ field: 'initialSupply', type: 'error', message: 'Initial supply must be a positive number.' });
        score -= 30;
    } else if (supply > 1e15) {
        suggestions.push({ field: 'initialSupply', type: 'warning', message: 'Very high supply (>1 quadrillion).' });
        score -= 5;
    }

    score = Math.max(0, Math.min(100, score));

    let summary;
    if (score >= 90) summary = 'Excellent parameters.';
    else if (score >= 70) summary = 'Good configuration with minor suggestions.';
    else if (score >= 50) summary = 'Some issues detected.';
    else summary = 'Critical issues found.';

    const hasErrors = suggestions.some(s => s.type === 'error');

    return { isValid: !hasErrors, suggestions, score, summary };
}

// ============ Format helpers ============

function formatSupply(supply) {
    const num = parseFloat(supply);
    if (isNaN(num)) return '0';
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toLocaleString();
}

// ============ Demo Scenarios ============

const DEMO_SCENARIOS = [
    {
        description: "I'm building an online multiplayer game and I need a token for in-game purchases, rewards, and trading between players.",
        targetAudience: "Gamers aged 18-35",
        useCase: "In-game currency and marketplace",
    },
    {
        description: "I want to create a community governance token for our DAO that manages a decentralized content platform.",
        targetAudience: "Content creators and curators",
        useCase: "Governance voting and staking",
    },
    {
        description: "I'm launching a loyalty program for my coffee shop chain and want customers to earn tokens with each purchase.",
        targetAudience: "Coffee shop customers, local community",
        useCase: "Loyalty rewards and discounts",
    },
];

// ============ Main ============

async function main() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║     Forken Token Factory — AI-Assisted Token Creation      ║');
    console.log('║     Gemini API Integration Demo (FREE)                     ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // Get project description from CLI args or use demo scenario
    const customDescription = process.argv.slice(2).join(' ');

    let scenario;
    if (customDescription) {
        scenario = { description: customDescription };
        console.log('Using your project description:\n');
    } else {
        // Pick a random demo scenario
        scenario = DEMO_SCENARIOS[Math.floor(Math.random() * DEMO_SCENARIOS.length)];
        console.log('Using demo scenario (pass your own as CLI argument):\n');
    }

    console.log('┌─────────────────────────────────────────────────┐');
    console.log('│  STEP 1: User Describes Their Project           │');
    console.log('└─────────────────────────────────────────────────┘');
    console.log(`\n  "${scenario.description}"`);
    if (scenario.targetAudience) console.log(`  Target: ${scenario.targetAudience}`);
    if (scenario.useCase) console.log(`  Use case: ${scenario.useCase}`);

    console.log('\n┌─────────────────────────────────────────────────┐');
    console.log('│  STEP 2: Gemini API Analyzes & Suggests (FREE)  │');
    console.log('└─────────────────────────────────────────────────┘\n');
    console.log('  Calling Gemini API...\n');

    const startTime = Date.now();
    const result = await askGemini(scenario.description, {
        targetAudience: scenario.targetAudience,
        useCase: scenario.useCase,
    });
    const elapsed = Date.now() - startTime;

    const { suggestion, model, usage } = result;

    console.log(`  Model: ${model} (FREE tier)`);
    console.log(`  Response time: ${elapsed}ms`);
    console.log(`  Tokens used: ${usage.inputTokens} in / ${usage.outputTokens} out\n`);

    console.log('  AI Suggestion:');
    console.log(`    Name:    ${suggestion.name}`);
    console.log(`    Symbol:  ${suggestion.symbol}`);
    console.log(`    Decimals: ${suggestion.decimals}`);
    console.log(`    Supply:  ${formatSupply(suggestion.initialSupply)} (${suggestion.initialSupply})`);
    console.log(`    Reason:  ${suggestion.reasoning}`);

    if (suggestion.alternatives && suggestion.alternatives.length > 0) {
        console.log('\n  Alternatives:');
        suggestion.alternatives.forEach((alt, i) => {
            console.log(`    ${i + 1}. ${alt.name} (${alt.symbol})`);
        });
    }

    console.log('\n┌─────────────────────────────────────────────────┐');
    console.log('│  STEP 3: Rule-Based Validation                  │');
    console.log('└─────────────────────────────────────────────────┘\n');

    const analysis = analyzeTokenParams({
        name: suggestion.name,
        symbol: suggestion.symbol,
        decimals: suggestion.decimals,
        initialSupply: suggestion.initialSupply,
    });

    console.log(`  Score: ${analysis.score}/100`);
    console.log(`  Valid: ${analysis.isValid ? 'YES' : 'NO'}`);
    console.log(`  Summary: ${analysis.summary}`);

    if (analysis.suggestions.length > 0) {
        console.log('\n  Validation Details:');
        analysis.suggestions.forEach(s => {
            const icon = s.type === 'error' ? '!' : s.type === 'warning' ? '~' : 'i';
            console.log(`    [${icon}] ${s.field}: ${s.message}`);
        });
    } else {
        console.log('\n  No issues found — parameters are clean.');
    }

    console.log('\n┌─────────────────────────────────────────────────┐');
    console.log('│  STEP 4: Ready for On-Chain Deployment          │');
    console.log('└─────────────────────────────────────────────────┘\n');

    if (analysis.isValid) {
        console.log('  Token parameters validated. Ready to call:');
        console.log('');
        console.log('    AITokenFactory.createToken(');
        console.log(`      "${suggestion.name}",`);
        console.log(`      "${suggestion.symbol}",`);
        console.log(`      ${suggestion.decimals},`);
        console.log(`      ${suggestion.initialSupply} * 10^${suggestion.decimals}`);
        console.log('    )');
        console.log('');
        console.log('  Factory: 0xdaAD8d3679EAF994363b83D49c8159f98144b580 (BSC Mainnet)');
        console.log('  The user signs the transaction — AI only advised.');
    } else {
        console.log('  Some parameters need adjustment before deployment.');
        console.log('  The user can modify the suggestions and re-validate.');
    }

    console.log('\n════════════════════════════════════════════════════════════');
    console.log('  Demo complete. Gemini API (FREE) was called in the Token');
    console.log('  Factory flow to generate token parameters from a project');
    console.log('  description.');
    console.log('════════════════════════════════════════════════════════════\n');
}

main().catch((error) => {
    console.error('Error:', error.message);
    process.exit(1);
});
