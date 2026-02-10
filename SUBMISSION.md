# DoraHacks Submission

## Title

Forken — AI-Powered No-Code Token Factory on BNB Chain

## One-liner

No-code ERC-20 deployment on BNB Chain with AI-assisted tokenomics, clear on-chain proof, and builder-first UX.

## Description

Forken Token Factory is a minimal, reproducible no-code module to deploy ERC-20 tokens on BNB Chain.

An AI agent (Claude) analyzes project descriptions and suggests optimal tokenomics (name, symbol, supply, decimals) before deployment. The user always signs with their own wallet — the AI only advises.

This submission focuses on safe token deployment and on-chain verifiability (contract address + tx hash).

**Liquidity provisioning, token launch, fundraising, and any market-facing actions are intentionally out of scope for this submission.**

### Key Features

- AI-assisted tokenomics analysis (Claude API)
- No-code ERC-20 deployment on BSC
- On-chain proof: verified contract + tx hash
- User owns the token (not the factory or any agent)
- Fully reproducible: `npm install && npx hardhat test && deploy`

### Tech Stack

- Solidity 0.8.20 + OpenZeppelin 5.x
- Hardhat + ethers.js
- Claude API (Anthropic) for AI decisions
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
🔨 Built Forken Token Factory for @BNBChain #GoodVibesOnly hackathon

AI-assisted no-code ERC-20 deployment on BSC.
→ Claude analyzes your project
→ Suggests optimal tokenomics
→ Deploys with on-chain proof

No liquidity. No launch. Builder tool only.

#VibingOnBNB #OpenClaw
```
