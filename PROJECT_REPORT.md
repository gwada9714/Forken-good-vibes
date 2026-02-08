# ForKen AI Vault - Rapport de Projet Complet

> **BNB Good Vibes Only: OpenClaw Edition**  
> Track: Agent | Date: 7 Février 2026

---

## 1. Vue d'Ensemble

### 1.1 Concept
ForKen AI Vault est un **agent IA autonome de gestion de trésorerie crypto** qui optimise automatiquement les positions DeFi sur BNB Chain. L'agent utilise Claude (Anthropic) pour analyser les marchés, prendre des décisions intelligentes et exécuter des transactions onchain sans intervention humaine.

### 1.2 Objectif Hackathon
Développer une solution pour le track **Agent** du hackathon BNB Good Vibes Only, démontrant l'utilisation de l'IA pour automatiser la gestion d'actifs crypto avec transparence onchain.

### 1.3 Résumé Technique
| Composant | Technologie |
|-----------|-------------|
| Smart Contracts | Solidity 0.8.24, OpenZeppelin v5 |
| Backend IA | TypeScript, Claude API |
| Frontend | React, ethers.js v6 |
| Blockchain | BSC Testnet (Chain ID: 97) |
| Framework | Hardhat 2.19+ |

---

## 2. Architecture Système

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FORKEN AI VAULT                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────┐     ┌────────────────┐     ┌────────────────┐   │
│  │    Frontend    │────▶│   AI Agent     │────▶│ Smart Contract │   │
│  │    (React)     │     │  (Claude API)  │     │   (Solidity)   │   │
│  └────────────────┘     └────────────────┘     └────────────────┘   │
│          │                      │                      │             │
│          ▼                      ▼                      ▼             │
│   Dashboard avec          Analyse des           Exécution des       │
│   dépôt/retrait          marchés + IA          stratégies onchain   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    FLUX DE DONNÉES                            │   │
│  │                                                                │   │
│  │  1. Utilisateur dépose BNB dans AIVault                       │   │
│  │  2. Agent collecte données (APY, TVL, risques)                │   │
│  │  3. Claude analyse et décide (stake/unstake/compound/bridge)  │   │
│  │  4. Agent exécute via StrategyExecutor                        │   │
│  │  5. Raisonnement enregistré onchain pour transparence         │   │
│  │                                                                │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Smart Contracts

### 3.1 AIVault.sol (310 lignes)
**Rôle**: Contrat principal de gestion de trésorerie

**Fonctionnalités**:
- `deposit()` - Dépôt de BNB natif
- `depositToken()` - Dépôt de tokens ERC20
- `withdraw()` / `withdrawToken()` - Retraits
- `executeStrategy()` - Exécution des décisions IA (onlyAgent)
- `getRecentActions()` - Historique des actions

**Sécurité**:
- ReentrancyGuard (protection réentrance)
- Ownable (gestion propriétaire)
- Pausable (pause d'urgence)
- Modifier `onlyAgent` pour protection

**Événements**:
```solidity
event Deposited(address indexed user, address indexed token, uint256 amount);
event Withdrawn(address indexed user, address indexed token, uint256 amount);
event AIActionExecuted(uint8 indexed actionType, address target, uint256 amount, string reasoning);
event AgentUpdated(address indexed oldAgent, address indexed newAgent);
```

### 3.2 StrategyExecutor.sol (264 lignes)
**Rôle**: Exécution des stratégies DeFi

**Fonctionnalités**:
- `stakeToPool()` - Staking vers pools ForKen
- `unstakeFromPool()` - Retrait de staking
- `compound()` - Réinvestissement des rewards
- `bridgeToChain()` - Bridge cross-chain
- `executeCustomStrategy()` - Stratégies personnalisées

### 3.3 Interfaces
- `IForKenStaking.sol` - Interface pour le staking ForKen existant
- `IForKenBridge.sol` - Interface pour le bridge ForKen existant

### 3.4 Adresses Déployées (BSC Testnet)
| Contrat | Adresse |
|---------|---------|
| AIVault | `0x06296556F72B3cF73405Cd4165D78a4e3109A2D4` |
| StrategyExecutor | `0x270a3bb9E7b0963C742B37d8cf5e353504380a78` |

---

## 4. Backend IA

### 4.1 decision-engine.ts
**Rôle**: Moteur de décision utilisant Claude API

**Processus**:
1. Collecte du contexte marché (pools, APY, TVL, risques)
2. Construction du prompt structuré
3. Appel à Claude API avec analyse
4. Parsing de la réponse JSON
5. Retour de la décision structurée

**Format de décision**:
```typescript
interface Decision {
  action: 'stake' | 'unstake' | 'compound' | 'bridge' | 'hold';
  poolId?: number;
  amount?: string;
  targetChainId?: number;
  reasoning: string;
  confidence: number; // 0-100
}
```

### 4.2 risk-analyzer.ts
**Rôle**: Analyse des risques en temps réel

**Seuils surveillés**:
| Métrique | Warning | Critical |
|----------|---------|----------|
| TVL Drop (24h) | -15% | -30% |
| APY Drop | -20% | -50% |
| Pool Utilization | 80% | 95% |

### 4.3 executor.ts
**Rôle**: Exécution onchain des décisions

**Fonctionnalités**:
- Encodage des appels de fonction
- Estimation du gas
- Envoi des transactions signées
- Attente de confirmation
- Gestion des erreurs

### 4.4 index.ts
**Rôle**: Orchestrateur et scheduler

**Cycle d'analyse** (configurable, défaut: 1 heure):
1. Récupération des métriques des pools
2. Analyse des risques
3. Si risque critique → action immédiate
4. Sinon → décision IA
5. Si confidence > 60% → exécution
6. Logging des résultats

---

## 5. Frontend

### 5.1 AIVaultPage.tsx (12KB)
**Composants**:
- Header avec stats globales (TVL, actions count)
- Formulaire dépôt/retrait
- Historique des actions IA
- Log des décisions avec raisonnement

**Design**: Thème BNB Chain (couleurs or #F0B90B sur noir #0B0E11)

### 5.2 VaultDeposit.tsx
- Input montant avec validation
- Boutons Deposit/Withdraw
- Affichage balance utilisateur
- Gestion états (loading, success, error)

### 5.3 VaultHistory.tsx
- Liste des actions récentes
- Icônes par type d'action
- Timestamps formatés
- Liens vers transactions

### 5.4 AIDecisionLog.tsx
- Affichage du raisonnement IA
- Score de confiance visuel
- Transparence totale des décisions

### 5.5 useAIVault.ts (Hook React)
- Connection au contrat
- Lecture des balances
- Subscription aux événements
- Gestion des transactions

---

## 6. Tests

### 6.1 Couverture
```
  AIVault
    Deployment
      ✔ Should set the right owner
      ✔ Should set the right AI agent
      ✔ Should have BNB as supported token
    Deposits
      ✔ Should accept BNB deposits
      ✔ Should reject zero deposits
      ✔ Should track multiple deposits
    Withdrawals
      ✔ Should allow withdrawals
      ✔ Should reject withdrawals exceeding balance
    AI Agent Actions
      ✔ Should only allow AI agent to execute strategies
      ✔ Should allow AI agent to execute strategies
    Admin Functions
      ✔ Should allow owner to update AI agent
      ✔ Should not allow non-owner to update AI agent
      ✔ Should allow owner to pause/unpause
    Action History
      ✔ Should track action history
      ✔ Should return recent actions

  15 passing (2s)
```

### 6.2 Mocks
`MockForKenStaking.sol` - Simule le contrat de staking pour les tests

---

## 7. Configuration

### 7.1 Variables d'Environnement
```env
# Blockchain
PRIVATE_KEY=<deployer_private_key>
BSC_TESTNET_RPC=https://data-seed-prebsc-1-s1.binance.org:8545/

# IA
ANTHROPIC_API_KEY=<claude_api_key>
AI_AGENT_PRIVATE_KEY=<agent_wallet_key>

# Paramètres Agent
MIN_APY_DIFF=100        # Différence APY minimum (basis points)
MAX_POOL_ALLOCATION=10  # Max BNB par pool
RISK_TOLERANCE=5        # 1-10
CHECK_INTERVAL=3600     # Secondes entre analyses
```

### 7.2 Hardhat Config
- Solidity 0.8.24 avec optimizer (200 runs)
- Networks: bscTestnet, bsc, opbnbTestnet, opbnb
- Paths isolés pour éviter conflits avec projet parent

---

## 8. Sécurité

### 8.1 Mesures Implémentées
| Mesure | Description |
|--------|-------------|
| ReentrancyGuard | Protection contre les attaques de réentrance |
| Ownable | Fonctions admin protégées |
| Pausable | Arrêt d'urgence possible |
| onlyAgent | Seul l'agent autorisé peut exécuter |
| Confidence threshold | Exécution seulement si confiance > 60% |
| Wallet séparé | Agent utilise un wallet distinct du owner |

### 8.2 Recommandations Production
- Audit de sécurité avant mainnet
- Multi-sig pour ownership
- Timelock pour changements critiques
- Rate limiting sur les actions

---

## 9. Métriques du Projet

| Métrique | Valeur |
|----------|--------|
| Lignes de code Solidity | ~580 |
| Lignes de code TypeScript | ~1500 |
| Lignes de code React/TSX | ~1000 |
| Fichiers créés | 20+ |
| Tests unitaires | 15 |
| Temps de développement | ~2 heures |
| Contrats déployés | 2 |

---

## 10. Liens et Ressources

### 10.1 Contrats BSCScan
- [AIVault](https://testnet.bscscan.com/address/0x06296556F72B3cF73405Cd4165D78a4e3109A2D4)
- [StrategyExecutor](https://testnet.bscscan.com/address/0x270a3bb9E7b0963C742B37d8cf5e353504380a78)

### 10.2 Hackathon
- [DoraHacks Good Vibes](https://dorahacks.io/hackathon/goodvibes/detail)
- Deadline: 19 Février 2026

### 10.3 Documentation Projet
- `README.md` - Guide d'installation et utilisation
- `AI_BUILD_LOG.md` - Journal de développement IA
- `HACKATHON_PLAN.md` - Plan initial
- `STRATEGIC_ANALYSIS.md` - Analyse des tracks

---

## 11. Conclusion

ForKen AI Vault démontre une intégration réussie de l'IA dans la DeFi avec:

1. **Autonomie** - L'agent prend des décisions sans intervention humaine
2. **Transparence** - Chaque décision est enregistrée onchain avec son raisonnement
3. **Sécurité** - Multiples couches de protection
4. **Extensibilité** - Architecture modulaire pour ajouter de nouvelles stratégies

Le projet est prêt pour la soumission au hackathon avec une preuve onchain sur BSC Testnet.

---

*Rapport généré le 7 Février 2026 | ForKen Team*
