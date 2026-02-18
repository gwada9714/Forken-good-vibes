import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../../src/contexts/WalletContext';
import VaultDeposit from './components/VaultDeposit';
import VaultHistory from './components/VaultHistory';
import AIDecisionLog from './components/AIDecisionLog';

// Contract ABI (simplified)
const AI_VAULT_ABI = [
  'function deposit() external payable',
  'function withdraw(uint256 amount) external',
  'function getUserTokenBalance(address user, address token) external view returns (uint256)',
  'function totalValueLocked() external view returns (uint256)',
  'function getActionCount() external view returns (uint256)',
  'function getRecentActions(uint256 count) external view returns (tuple(uint8 actionType, address target, uint256 amount, uint256 timestamp, string reasoning)[])',
];

interface VaultStats {
  tvl: string;
  userBalance: string;
  actionCount: number;
}

interface AIAction {
  actionType: number;
  target: string;
  amount: string;
  timestamp: number;
  reasoning: string;
}

const AIVaultPage: React.FC = () => {
  const { address, isConnected, provider } = useWallet();
  const [stats, setStats] = useState<VaultStats>({ tvl: '0', userBalance: '0', actionCount: 0 });
  const [recentActions, setRecentActions] = useState<AIAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const vaultAddress = import.meta.env.VITE_AI_VAULT_ADDRESS || '';

  const loadVaultData = useCallback(async () => {
    if (!provider || !vaultAddress) {
      setLoading(false);
      return;
    }

    try {
      const contract = new ethers.Contract(vaultAddress, AI_VAULT_ABI, provider);

      // Get TVL
      const tvl = await contract.totalValueLocked();

      // Get user balance if connected
      let userBalance = ethers.parseEther('0');
      if (address) {
        userBalance = await contract.getUserTokenBalance(address, ethers.ZeroAddress);
      }

      // Get action count
      const actionCount = await contract.getActionCount();

      setStats({
        tvl: ethers.formatEther(tvl),
        userBalance: ethers.formatEther(userBalance),
        actionCount: Number(actionCount),
      });

      // Get recent actions
      if (actionCount > 0) {
        const actions = await contract.getRecentActions(Math.min(10, Number(actionCount)));
        setRecentActions(actions.map((a: any) => ({
          actionType: Number(a.actionType),
          target: a.target,
          amount: ethers.formatEther(a.amount),
          timestamp: Number(a.timestamp),
          reasoning: a.reasoning,
        })));
      }
    } catch (error) {
      console.error('Failed to load vault data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [provider, vaultAddress, address]);

  useEffect(() => {
    loadVaultData();
  }, [loadVaultData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadVaultData();
  };

  const getActionTypeName = (type: number): string => {
    const types = ['Stake', 'Unstake', 'Compound', 'Bridge'];
    return types[type] || 'Unknown';
  };

  if (!vaultAddress) {
    return (
      <div className="ai-vault-page">
        <div className="error-message">
          <h2>⚠️ Vault Not Configured</h2>
          <p>Please set VITE_AI_VAULT_ADDRESS in your environment variables.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-vault-page">
      {/* Header */}
      <header className="vault-header">
        <div className="header-content">
          <h1>🤖 ForKen AI Vault</h1>
          <p className="subtitle">Autonomous Treasury Management</p>
          <div className="hackathon-badge">
            BNB Good Vibes Only: OpenClaw Edition
          </div>
        </div>
        <button
          className="refresh-btn"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? '⏳' : '🔄'} Refresh
        </button>
      </header>

      {/* Stats Grid */}
      <section className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Value Locked</span>
          <span className="stat-value">{parseFloat(stats.tvl).toFixed(4)} BNB</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Your Balance</span>
          <span className="stat-value">
            {isConnected ? `${parseFloat(stats.userBalance).toFixed(4)} BNB` : 'Connect Wallet'}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">AI Actions Executed</span>
          <span className="stat-value">{stats.actionCount}</span>
        </div>
        <div className="stat-card status-card">
          <span className="stat-label">Agent Status</span>
          <span className="stat-value status-active">🟢 Active</span>
        </div>
      </section>

      {/* Main Content */}
      <div className="vault-content">
        {/* Deposit/Withdraw */}
        <VaultDeposit
          vaultAddress={vaultAddress}
          userBalance={stats.userBalance}
          onSuccess={loadVaultData}
        />

        {/* AI Decision Log */}
        <AIDecisionLog
          actions={recentActions}
          getActionTypeName={getActionTypeName}
        />

        {/* Action History */}
        <VaultHistory
          actions={recentActions}
          getActionTypeName={getActionTypeName}
        />
      </div>

      {/* How it Works */}
      <section className="how-it-works">
        <h2>🧠 How the AI Vault Works</h2>
        <div className="steps-grid">
          <div className="step">
            <span className="step-number">1</span>
            <h3>Deposit</h3>
            <p>Deposit BNB into the vault</p>
          </div>
          <div className="step">
            <span className="step-number">2</span>
            <h3>Analyze</h3>
            <p>AI analyzes market conditions</p>
          </div>
          <div className="step">
            <span className="step-number">3</span>
            <h3>Execute</h3>
            <p>Optimal strategies are executed onchain</p>
          </div>
          <div className="step">
            <span className="step-number">4</span>
            <h3>Earn</h3>
            <p>Automatically compound returns</p>
          </div>
        </div>
      </section>

      <style>{`
        .ai-vault-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .vault-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding: 2rem;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border-radius: 16px;
          border: 1px solid #30394a;
        }

        .header-content h1 {
          font-size: 2.5rem;
          margin: 0;
          background: linear-gradient(90deg, #f0b90b, #fcd535);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .subtitle {
          color: #888;
          margin: 0.5rem 0;
        }

        .hackathon-badge {
          display: inline-block;
          padding: 0.5rem 1rem;
          background: rgba(240, 185, 11, 0.1);
          border: 1px solid #f0b90b;
          border-radius: 20px;
          color: #f0b90b;
          font-size: 0.85rem;
          margin-top: 1rem;
        }

        .refresh-btn {
          padding: 0.75rem 1.5rem;
          background: #f0b90b;
          border: none;
          border-radius: 8px;
          color: #000;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .refresh-btn:hover:not(:disabled) {
          background: #fcd535;
          transform: translateY(-2px);
        }

        .refresh-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: #1a1a2e;
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid #30394a;
        }

        .stat-label {
          display: block;
          color: #888;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }

        .stat-value {
          display: block;
          font-size: 1.5rem;
          font-weight: 600;
          color: #fff;
        }

        .status-active {
          color: #4caf50;
        }

        .vault-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        @media (max-width: 768px) {
          .vault-content {
            grid-template-columns: 1fr;
          }
        }

        .how-it-works {
          background: #1a1a2e;
          border-radius: 16px;
          padding: 2rem;
          border: 1px solid #30394a;
        }

        .how-it-works h2 {
          text-align: center;
          margin-bottom: 2rem;
        }

        .steps-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }

        @media (max-width: 768px) {
          .steps-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .step {
          text-align: center;
          padding: 1.5rem;
        }

        .step-number {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: #f0b90b;
          color: #000;
          border-radius: 50%;
          font-weight: 700;
          margin-bottom: 1rem;
        }

        .step h3 {
          margin: 0.5rem 0;
          color: #fff;
        }

        .step p {
          margin: 0;
          color: #888;
          font-size: 0.9rem;
        }

        .error-message {
          text-align: center;
          padding: 4rem;
          background: #1a1a2e;
          border-radius: 16px;
          border: 1px solid #30394a;
        }

        .error-message h2 {
          color: #f0b90b;
        }
      `}</style>
    </div>
  );
};

export default AIVaultPage;
