# 🤖 ForKen AI Vault

> Agent IA Autonome de Gestion de Trésorerie Crypto  
> **BNB Good Vibes Only: OpenClaw Edition** | Track: Agent

![BSC](https://img.shields.io/badge/BSC-F0B90B?style=flat&logo=binance&logoColor=white)
![opBNB](https://img.shields.io/badge/opBNB-F0B90B?style=flat&logo=binance&logoColor=white)
![Solidity](https://img.shields.io/badge/Solidity-%5E0.8.20-363636?style=flat&logo=solidity)
![AI Powered](https://img.shields.io/badge/AI-Claude-blueviolet?style=flat)
![Tests](https://img.shields.io/badge/Tests-15%2F15%20passing-brightgreen?style=flat)

---

## 🧑‍⚖️ For Judges — Quick Test (3 steps)

```bash
# 1. Install & compile
npm install && npx hardhat compile

# 2. Run tests (15/15 should pass)
npx hardhat test

# 3. View verified contracts on BSCScan
```

| Contract | BSCScan (Verified ✅) |
|---|---|
| AIVault | [0x0629...2D4](https://testnet.bscscan.com/address/0x06296556F72B3cF73405Cd4165D78a4e3109A2D4#code) |
| StrategyExecutor | [0x270a...a78](https://testnet.bscscan.com/address/0x270a3bb9E7b0963C742B37d8cf5e353504380a78#code) |
| AITokenFactory | [0x7673...ef4](https://testnet.bscscan.com/address/0x7673410C98221b76853A98c027dBe150e4443ef4#code) |

> **No API keys needed** to compile and run tests. The contracts are already deployed and verified on BSC Testnet.

## 📋 Description

ForKen AI Vault est un **agent IA autonome** qui optimise automatiquement vos positions DeFi sur BNB Chain. L'agent analyse les marchés, prend des décisions intelligentes et exécute des transactions onchain sans intervention humaine.

### ✨ Fonctionnalités

| Feature | Description |
|---------|-------------|
| 🎯 **Staking automatique** | Dépose vers les pools avec le meilleur APY |
| 🔄 **Compound automatique** | Réinvestit les rewards automatiquement |
| ⚠️ **Analyse de risque** | Détecte les signaux de risque et protège |
| 🌉 **Bridge cross-chain** | Optimise les yields entre BSC et opBNB |
| 🔒 **Protection MEV** | Transactions protégées |

---

## 🚀 Quick Start

### Prérequis

- Node.js 18+
- npm ou yarn  
- Wallet avec BNB pour gas
- (Optionnel) Clé API Anthropic pour l'agent IA

### 1. Installation

```bash
cd "good vibes"
npm install
```

### 2. Configuration

```bash
cp .env.example .env
```

Éditez `.env` avec vos valeurs :
```env
PRIVATE_KEY=your_deployer_private_key
ANTHROPIC_API_KEY=your_claude_api_key
AI_AGENT_PRIVATE_KEY=your_agent_wallet_key
```

### 3. Compilation

```bash
npx hardhat compile
```

### 4. Tests

```bash
npx hardhat test
```

### 5. Déploiement

```bash
# Testnet BSC
npx hardhat run scripts/deploy.js --network bscTestnet

# Mainnet BSC
npx hardhat run scripts/deploy.js --network bsc
```

### 6. Lancer l'agent IA

```bash
cd ai-agent
npm install
npm start
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FORKEN AI VAULT                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   │
│  │   Frontend   │───▶│  AI Agent    │───▶│Smart Contract│   │
│  │   (React)    │    │ (Claude AI)  │    │  (Solidity)  │   │
│  └──────────────┘    └──────────────┘    └──────────────┘   │
│         │                   │                    │           │
│         ▼                   ▼                    ▼           │
│  Dashboard avec       Analyse +            Exécution        │
│  dépôt/retrait       décisions            onchain           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Structure du Projet

```
good vibes/
├── contracts/              # Smart contracts Solidity
│   ├── AIVault.sol         # Contrat principal
│   ├── StrategyExecutor.sol # Exécution des stratégies
│   └── interfaces/
│       ├── IForKenStaking.sol
│       └── IForKenBridge.sol
│
├── ai-agent/               # Backend IA (TypeScript)
│   ├── index.ts            # Entry point + scheduler
│   ├── decision-engine.ts  # Moteur de décision (Claude API)
│   ├── risk-analyzer.ts    # Analyse de risque
│   └── executor.ts         # Exécution onchain
│
├── frontend/               # Interface React
│   ├── AIVaultPage.tsx     # Page principale
│   ├── components/
│   │   ├── VaultDeposit.tsx
│   │   ├── VaultHistory.tsx
│   │   └── AIDecisionLog.tsx
│   └── hooks/
│       └── useAIVault.ts
│
├── scripts/                # Scripts de déploiement
│   └── deploy.js
│
├── test/                   # Tests
│   └── AIVault.test.js
│
└── hardhat.config.js       # Configuration Hardhat
```

---

## 🔗 Contrats Déployés

| Réseau | Contrat | Adresse |
|--------|---------|---------|
| BSC Testnet | AIVault | [`0x0629...2D4`](https://testnet.bscscan.com/address/0x06296556F72B3cF73405Cd4165D78a4e3109A2D4#code) ✅ Verified |
| BSC Testnet | StrategyExecutor | [`0x270a...a78`](https://testnet.bscscan.com/address/0x270a3bb9E7b0963C742B37d8cf5e353504380a78#code) ✅ Verified |
| BSC Testnet | AITokenFactory | [`0x7673...ef4`](https://testnet.bscscan.com/address/0x7673410C98221b76853A98c027dBe150e4443ef4#code) ✅ Verified |

---

## 🛠️ Stack Technique

- **Smart Contracts**: Solidity 0.8.19, Hardhat, OpenZeppelin
- **AI Engine**: Claude API (Anthropic)
- **Frontend**: React, TypeScript, ethers.js
- **Blockchain**: BNB Smart Chain, opBNB

---

## 🧠 Comment l'IA Fonctionne

1. **Collecte de données** : L'agent récupère les APY des pools, TVL, et métriques de risque
2. **Analyse Claude** : Les données sont envoyées à Claude pour analyse
3. **Décision** : Claude retourne une décision (stake/unstake/compound/bridge)
4. **Exécution** : L'agent exécute la transaction onchain
5. **Logging** : Le raisonnement est stocké onchain pour transparence

### Exemple de décision IA

```json
{
  "action": "stake",
  "poolId": 2,
  "amount": "1.5",
  "reasoning": "Pool 2 offers 25% APY with moderate risk (5/10). Current position is underallocated. Gas costs are minimal compared to expected 30-day yield.",
  "confidence": 85
}
```

---

## 🔒 Sécurité

- ✅ Contrats audités avec OpenZeppelin
- ✅ Reentrancy guards sur toutes les fonctions
- ✅ Pausable en cas d'urgence
- ✅ Agent wallet séparé du owner
- ✅ Limite de confiance pour exécution (>60%)

---

## 📜 License

MIT License - ForKen Team 2026

---

## 🔗 Liens

- **Hackathon**: [DoraHacks Good Vibes](https://dorahacks.io/hackathon/goodvibes/detail)
- **Discord**: [BNB Chain #vibe-coding](https://discord.com/channels/789402563035660308/1463806329104760942)
- **GitHub BNB**: [good-vibes-only-openclaw-edition](https://github.com/bnb-chain/good-vibes-only-openclaw-edition)
