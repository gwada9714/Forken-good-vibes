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

This is a real API call — see `ai-advisor/claudeAdvisor.ts` and the demo script `scripts/demo-ai-advisor.js`.

### Tech Stack

- Solidity 0.8.24 + OpenZeppelin 5.x
- Hardhat + ethers.js
- Claude API (Anthropic) — `@anthropic-ai/sdk`
- BSC Mainnet (chainId: 56)

## Track

**Builders** (primary)

## Links

- **GitHub**: https://github.com/gwada9714/Forken-good-vibes
- **Contract (Verified)**: https://bscscan.com/address/0xdaAD8d3679EAF994363b83D49c8159f98144b580#code
- **Demo Token**: https://bscscan.com/address/0x4f51bC9fc05a8C4D99FD8256d52695807514f881
- **Demo TX**: https://bscscan.com/tx/0x6f90f4871d44494493bb18ab9955889d0c128179e33e7b97a9cbc04799299815
- **Demo Video**: [TODO: add demo video link]

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
