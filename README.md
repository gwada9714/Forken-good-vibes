# Forken — AI-Powered No-Code Token Factory on BNB Chain

> Deploy ERC-20 tokens on BNB Chain with AI-assisted tokenomics.
> **BNB Good Vibes Only: OpenClaw Edition** | Track: Builders

![BSC](https://img.shields.io/badge/BSC-F0B90B?style=flat&logo=binance&logoColor=white)
![Solidity](https://img.shields.io/badge/Solidity-%5E0.8.20-363636?style=flat&logo=solidity)
![AI Powered](https://img.shields.io/badge/AI-Claude-blueviolet?style=flat)
![Tests](https://img.shields.io/badge/Tests-passing-brightgreen?style=flat)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat)

---

## ⚠️ Out of Scope

Liquidity provisioning, token launch, fundraising, airdrops, and any market-facing actions are **intentionally excluded** from this submission.

---

## 🧑‍⚖️ Quick Test (3 steps)

```bash
# 1. Install & compile
npm install && npx hardhat compile

# 2. Run all tests
npx hardhat test

# 3. View verified contract on BSCScan ↓
```

---

## 🔗 On-Chain Proof

| Item | Details |
|---|---|
| **Network** | **BSC Mainnet** (chainId: 56) |
| **Token Factory** | [`0xdaAD...580`](https://bscscan.com/address/0xdaAD8d3679EAF994363b83D49c8159f98144b580#code) ✅ Verified |
| **Demo Token (FKD)** | [`0x4f51...881`](https://bscscan.com/address/0x4f51bC9fc05a8C4D99FD8256d52695807514f881) |
| **Demo TX** | [`0x6f90...9815`](https://bscscan.com/tx/0x6f90f4871d44494493bb18ab9955889d0c128179e33e7b97a9cbc04799299815) |
| **Deployer** | `0x79749eA6bF5580A10b9F4716d41270DF75F44F24` |

---

## 📋 What This Is

Forken Token Factory is a **minimal, reproducible no-code module** to deploy ERC-20 tokens on BNB Chain.

An AI agent (Claude) analyzes your project and suggests optimal tokenomics before deployment. The user always signs with their own wallet — the AI only advises.

### How It Works

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  User Input  │────▶│  Claude AI   │────▶│  On-Chain    │
│  "I want a   │     │  Analyzes &  │     │  Factory     │
│   token for  │     │  Suggests    │     │  Deploys     │
│   my game"   │     │  Tokenomics  │     │  ERC-20      │
└──────────────┘     └──────────────┘     └──────────────┘
                                                │
                                                ▼
                                          Contract Address
                                          + TX Hash
```

1. **User describes** their project in natural language
2. **Claude AI analyzes** and suggests name, symbol, supply, decimals
3. **User reviews** and approves the parameters
4. **Factory deploys** the ERC-20 on BNB Chain
5. **Proof returned** — contract address + tx hash

### Key Principles
- ✅ **No agent private key** — user always signs
- ✅ **No fund management** — factory only creates tokens
- ✅ **Deterministic output** — same input = same token config
- ✅ **On-chain verifiable** — everything visible on BSCScan

---

## 📁 Project Structure

```
good vibes/
├── contracts/
│   ├── AITokenFactory.sol     # Token Factory contract (main)
│   ├── AIVault.sol            # AI Vault (bonus module)
│   └── StrategyExecutor.sol   # Strategy executor (bonus)
│
├── ai-agent/                  # AI Backend (Claude API)
│   ├── index.ts               # Entry point
│   ├── decision-engine.ts     # Claude integration
│   └── risk-analyzer.ts       # Risk analysis
│
├── scripts/
│   ├── deploy-token-factory.js  # Deploy script
│   ├── demo-token.js           # Demo: create a token
│   └── create-demo-token-mainnet.js  # Mainnet demo
│
├── ai-advisor/
│   └── tokenAnalyzer.ts       # AI parameter analyzer (client-side)
│
├── test/
│   ├── AITokenFactory.test.js   # Token Factory tests
│   └── AIVault.test.js          # Vault tests
│
├── .env.example               # Environment template
├── deployment-token-factory.json  # Deployed addresses
└── hardhat.config.cjs          # Hardhat configuration
```

---

## 🚀 Quickstart

### Prerequisites
- Node.js 18+
- npm

### Install & Compile

```bash
npm install
npx hardhat compile
```

### Run Tests

```bash
npx hardhat test
```

### Deploy to BSC Testnet

```bash
cp .env.example .env
# Edit .env with your PRIVATE_KEY and BSCSCAN_API_KEY
npx hardhat run scripts/deploy-token-factory.js --network bscTestnet
```

### Create a Demo Token

```bash
npx hardhat run scripts/demo-token.js --network bscTestnet
```

---

## 🛠️ Tech Stack

- **Smart Contracts**: Solidity 0.8.24, OpenZeppelin 5.x
- **Framework**: Hardhat
- **AI Engine**: Claude API (Anthropic)
- **Blockchain**: BNB Smart Chain (BSC)
- **Testing**: Chai + Hardhat Network

---

## 🔒 Security

- ✅ OpenZeppelin contracts (battle-tested)
- ✅ Input validation (name, symbol length, supply > 0)
- ✅ Ownership assigned to user, NOT factory
- ✅ No admin backdoors
- ✅ Events emitted for transparency

---

## 📊 Contract Interface

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

## 📜 License

MIT License — ForKen Team 2026

---

## 🔗 Links

- **Hackathon**: [DoraHacks Good Vibes](https://dorahacks.io/hackathon/goodvibes/detail)
- **BNB Chain**: [bnbchain.org](https://www.bnbchain.org)
- **OpenClaw**: [GitHub](https://github.com/bnb-chain/good-vibes-only-openclaw-edition)
