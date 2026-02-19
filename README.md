# Forken — AI-Powered No-Code Token Factory on BNB Chain

> Deploy ERC-20 tokens on BNB Chain with AI-assisted token parameter suggestions.
> **BNB Good Vibes Only: OpenClaw Edition** | Track: Builders

![BSC](https://img.shields.io/badge/BSC-F0B90B?style=flat&logo=binance&logoColor=white)
![Solidity](https://img.shields.io/badge/Solidity-%5E0.8.24-363636?style=flat&logo=solidity)
![AI Powered](https://img.shields.io/badge/AI-Gemini_Free-blueviolet?style=flat)
![Tests](https://img.shields.io/badge/Tests-passing-brightgreen?style=flat)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat)

---

## Out of Scope

Liquidity provisioning, token launch, fundraising, airdrops, and any market-facing actions are **intentionally excluded** from this submission.

---

## Quick Test (3 steps)

```bash
# 1. Install & compile
npm install && npx hardhat compile

# 2. Run all tests
npx hardhat test

# 3. View verified contract on BSCScan (link below)
```

---

## On-Chain Proof

| Item                               | Details                                                                                                                                           |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Network**                  | **BSC Mainnet** (chainId: 56)                                                                                                               |
| **AITokenFactory**           | [`0xdaAD8d3679EAF994363b83D49c8159f98144b580`](https://bscscan.com/address/0xdaAD8d3679EAF994363b83D49c8159f98144b580#code) — Verified            |
| **Demo Token (FKD)**         | [`0x4f51bC9fc05a8C4D99FD8256d52695807514f881`](https://bscscan.com/address/0x4f51bC9fc05a8C4D99FD8256d52695807514f881)                             |
| **Deployer**                 | `0x79749eA6bF5580A10b9F4716d41270DF75F44F24`                                                                                                    |
| **AIVault (bonus)**          | [`0xdaAD8d3679EAF994363b83D49c8159f98144b580`](https://testnet.bscscan.com/address/0xdaAD8d3679EAF994363b83D49c8159f98144b580#code) — BSC Testnet |
| **StrategyExecutor (bonus)** | [`0x37d2F68F4DF00b588cC2d1D69426EbBC56910311`](https://testnet.bscscan.com/address/0x37d2F68F4DF00b588cC2d1D69426EbBC56910311#code) — BSC Testnet |

---

## What This Is

Forken Token Factory is a **minimal, reproducible no-code module** to deploy ERC-20 tokens on BNB Chain.

An AI assistant (Gemini API — **free tier**) analyzes a user's project description and suggests token parameters (name, symbol, supply, decimals) before deployment. The user always reviews, adjusts, and signs with their own wallet — the AI only suggests.

### How It Works

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  User Input  │────>│  Gemini API  │────>│  Validator   │────>│  On-Chain    │
│  "I want a   │     │  Suggests    │     │  Rule-based  │     │  Factory     │
│   token for  │     │  Token       │     │  Parameter   │     │  Deploys     │
│   my game"   │     │  Parameters  │     │  Checks      │     │  ERC-20      │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

1. **User describes** their project in natural language
2. **Gemini API analyzes** (`gemini-2.5-flash` — free tier) the description and suggests name, symbol, supply, decimals
3. **Rule-based validator** checks parameters (length, reserved symbols, suspicious patterns)
4. **User reviews** and approves or adjusts the parameters
5. **Factory deploys** the ERC-20 on BNB Chain
6. **Proof returned** — contract address + tx hash

### Key Principles

- **No agent private key** — user always signs
- **No fund management** — factory only creates tokens
- **Two-tier analysis** — Gemini API (free) for suggestions + rule-based validation for safety
- **On-chain verifiable** — everything visible on BSCScan

---

## AI Integration Details

The AI layer uses the **Gemini API** (Google — **free tier**) at two levels:

### 1. Gemini API — Token Parameter Suggestions (`ai-advisor/geminiAdvisor.ts`)

- Takes a natural language project description
- Calls `gemini-2.5-flash` via `@google/generative-ai` (free)
- Returns structured JSON: name, symbol, decimals, supply, reasoning, alternatives
- Used in the Token Factory flow (the main submission)

### 2. Gemini API — Frontend Token Advisor (`src/services/ai/geminiTokenAdvisor.ts`)

- Frontend service calling Gemini API directly (CORS supported, no proxy)
- Called from `AITokenCreatorPage.tsx` via the "Ask AI" button
- Pre-fills the token creation form with AI suggestions

### 3. Gemini API — DeFi Decision Engine (`ai-agent/decision-engine.ts`)

- Analyzes DeFi market conditions for the AI Vault (bonus module)
- Calls `gemini-2.5-flash` for stake/unstake/compound decisions
- Not part of the core Token Factory flow

### 4. Rule-Based Validator (`ai-advisor/tokenAnalyzer.ts`)

- Instant client-side parameter validation (no API call)
- Checks name/symbol length, suspicious patterns, reserved symbols, supply ranges
- Scores parameters 0-100 with actionable suggestions

### Demo

```bash
# Run the AI advisor demo (requires GOOGLE_AI_API_KEY in .env — free at https://aistudio.google.com/)
npm run demo:ai

# Or with a custom project description
node scripts/demo-ai-advisor.js "I want a token for my online gaming platform"
```

---

## Project Structure

```
good vibes/
├── contracts/
│   ├── AITokenFactory.sol     # Token Factory contract (main — BSC Mainnet)
│   ├── AIVault.sol            # AI Vault (bonus module — BSC Testnet)
│   └── StrategyExecutor.sol   # Strategy executor (bonus — BSC Testnet)
│
├── ai-advisor/                # AI advisory layer
│   ├── geminiAdvisor.ts       # Gemini API integration (token suggestions — FREE)
│   └── tokenAnalyzer.ts       # Rule-based validator + AI orchestrator
│
├── ai-agent/                  # AI Backend (Gemini API — vault module)
│   ├── index.ts               # Entry point
│   ├── decision-engine.ts     # Gemini integration (DeFi decisions)
│   ├── executor.ts            # On-chain transaction executor
│   └── risk-analyzer.ts       # Risk analysis
│
├── scripts/
│   ├── deploy-token-factory.js     # Deploy script
│   ├── demo-token.js               # Demo: create a token
│   ├── demo-ai-advisor.js          # Demo: Gemini API token suggestions (FREE)
│   └── create-demo-token-mainnet.js
│
├── test/
│   ├── AITokenFactory.test.js   # Token Factory tests
│   └── AIVault.test.js          # Vault tests
│
├── .env.example               # Environment template
├── deployment-token-factory.json  # Deployed addresses (Mainnet)
├── deployment.json            # Deployed addresses (Testnet bonus)
└── hardhat.config.cjs          # Hardhat configuration
```

---

## Quickstart

### Prerequisites

- Node.js 18+
- npm
- Google AI API key — **free** at [aistudio.google.com](https://aistudio.google.com/)

### Install & Compile

```bash
npm install
npx hardhat compile
```

### Run Tests

```bash
npx hardhat test
```

### Run AI Advisor Demo

```bash
cp .env.example .env
# Edit .env with your GOOGLE_AI_API_KEY (free at https://aistudio.google.com/)
npm run demo:ai
```

### Deploy to BSC Testnet

```bash
# Edit .env with your PRIVATE_KEY and BSCSCAN_API_KEY
npx hardhat run scripts/deploy-token-factory.js --network bscTestnet
```

### Create a Demo Token

```bash
npx hardhat run scripts/demo-token.js --network bscTestnet
```

---

## Tech Stack

- **Smart Contracts**: Solidity 0.8.24, OpenZeppelin 5.x
- **Framework**: Hardhat
- **AI**: Gemini API (Google — **FREE**) — `@google/generative-ai`
- **Blockchain**: BNB Smart Chain (BSC) — Mainnet + Testnet
- **Frontend**: React + TypeScript + Tailwind CSS + Framer Motion
- **Testing**: Chai + Hardhat Network

---

## Security

- OpenZeppelin contracts (battle-tested)
- Input validation (name, symbol length, supply > 0)
- Ownership assigned to user, NOT factory
- No admin backdoors
- Events emitted for transparency

---

## Contract Interface

```solidity
// Create a new ERC-20 token
function createToken(
    string memory name,      // e.g. "My Game Token"
    string memory symbol,    // e.g. "MGT"
    uint8 decimals,          // e.g. 18
    uint256 initialSupply    // e.g. 1000000 * 10^18
) external returns (address tokenAddress);

// View functions
function getUserTokens(address user) external view returns (address[] memory);
function getTokenCount() external view returns (uint256);
function getTokens(uint256 offset, uint256 limit) external view returns (address[] memory);
```

---

## License

MIT License — ForKen Team 2026

---

## Links

- **Live App**: https://forken-82beb.web.app/ai-token-creator (homepage — click the hackathon button to access AI Token Creator)
- **Hackathon**: [DoraHacks Good Vibes](https://dorahacks.io/hackathon/goodvibes/detail)
- **BNB Chain**: [bnbchain.org](https://www.bnbchain.org)
- **OpenClaw**: [GitHub](https://github.com/bnb-chain/good-vibes-only-openclaw-edition)
