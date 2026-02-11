# DoraHacks Submission

## Title

Forken — AI-Powered No-Code Token Factory on BNB Chain

## One-liner

No-code ERC-20 deployment on BNB Chain with AI-assisted token parameter suggestions (Claude API), rule-based validation, and on-chain proof.

## Description

Forken Token Factory is a minimal, reproducible no-code module to deploy ERC-20 tokens on BNB Chain.

An AI assistant (Claude API) analyzes project descriptions in natural language and suggests token parameters (name, symbol, supply, decimals) before deployment. A rule-based validator then checks the suggestions for safety (length, reserved symbols, suspicious patterns). The user always reviews, adjusts, and signs with their own wallet — the AI only suggests.

This submission focuses on safe token deployment and on-chain verifiability (contract address + tx hash).

**Liquidity provisioning, token launch, fundraising, and any market-facing actions are intentionally out of scope for this submission.**

### Key Features

- Claude API integration for token parameter suggestions from natural language descriptions
- Rule-based parameter validation (score 0-100, actionable suggestions)
- No-code ERC-20 deployment on BSC
- On-chain proof: verified contract + tx hash
- User owns the token (not the factory or any agent)
- Fully reproducible: `npm install && npx hardhat test && deploy`

### AI Integration

The Token Factory flow calls the Claude API (`claude-sonnet-4-20250514` via `@anthropic-ai/sdk`) to:
1. Accept a project description in natural language
2. Return structured token parameters (name, symbol, decimals, supply) with reasoning
3. Provide alternative name/symbol suggestions

This is a real API call present in two execution paths:
- **Backend**: `ai-advisor/claudeAdvisor.ts` + demo script `scripts/demo-ai-advisor.js`
- **Frontend**: `src/services/ai/claudeTokenAdvisor.ts` → called from `AITokenCreatorPage.tsx` via "Ask AI" button (Vite proxy to Anthropic API)

### Tech Stack

- Solidity 0.8.24 + OpenZeppelin 5.x
- Hardhat + ethers.js
- Claude API (Anthropic) — `@anthropic-ai/sdk`
- React + TypeScript + Tailwind CSS + Framer Motion
- BSC Mainnet (chainId: 56)

## Track

**Builders** (primary)

## On-Chain Proof

| Item | Link |
|---|---|
| **Token Factory (Verified)** | https://bscscan.com/address/0xdaAD8d3679EAF994363b83D49c8159f98144b580#code |
| **Demo Token (FKD)** | https://bscscan.com/address/0x4f51bC9fc05a8C4D99FD8256d52695807514f881 |
| **Demo TX** | https://bscscan.com/tx/0x6f90f4871d44494493bb18ab9955889d0c128179e33e7b97a9cbc04799299815 |
| **Deployer** | `0x79749eA6bF5580A10b9F4716d41270DF75F44F24` |
| **Network** | BSC Mainnet (chainId: 56) |

## Links

- **GitHub (hackathon repo)**: https://github.com/gwada9714/Forken-good-vibes
- **GitHub (main Forken app)**: https://github.com/gwada9714/Forken
- **AI Build Log**: [AI_BUILD_LOG.md](./AI_BUILD_LOG.md) — 12 sessions documented with AI contributions
- **Demo Video**: [TODO: add demo video link]
- **Live App**: [TODO: add deployed frontend URL if applicable]

## Reproducibility

```bash
# Clone and install
git clone https://github.com/gwada9714/Forken-good-vibes.git
cd Forken-good-vibes
npm install

# Compile and run tests (32 tests)
npx hardhat compile
npx hardhat test

# Run AI advisor demo (requires ANTHROPIC_API_KEY in .env)
cp .env.example .env
# Edit .env with your ANTHROPIC_API_KEY
npm run demo:ai

# Or with a custom project description
node scripts/demo-ai-advisor.js "I want a token for my gaming platform"
```

## Anti-Disqualification Statement

Liquidity provisioning, token launch, fundraising, airdrops, and any market-facing actions are intentionally out of scope for this submission. This project creates ERC-20 tokens only — no pools, no swaps, no liquidity transactions.

## Build-in-Public Tweet (Optional)

```
Built Forken Token Factory for @BNBChain #GoodVibesOnly hackathon

AI-assisted no-code ERC-20 deployment on BSC.
- Describe your project in natural language
- Claude API suggests token parameters
- Review, adjust, deploy with on-chain proof

No liquidity. No launch. Builder tool only.

#VibingOnBNB #OpenClaw
```
