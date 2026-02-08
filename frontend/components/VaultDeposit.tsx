import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../../../../src/contexts/WalletContext';

interface VaultDepositProps {
    vaultAddress: string;
    userBalance: string;
    onSuccess: () => void;
}

const AI_VAULT_ABI = [
    'function deposit() external payable',
    'function withdraw(uint256 amount) external',
];

const VaultDeposit: React.FC<VaultDepositProps> = ({ vaultAddress, userBalance, onSuccess }) => {
    const { address, isConnected, provider } = useWallet();
    const [amount, setAmount] = useState('');
    const [isDepositing, setIsDepositing] = useState(false);
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleDeposit = async () => {
        if (!provider || !amount || parseFloat(amount) <= 0) return;

        setError(null);
        setSuccess(null);
        setIsDepositing(true);

        try {
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(vaultAddress, AI_VAULT_ABI, signer);

            const tx = await contract.deposit({
                value: ethers.parseEther(amount),
            });

            await tx.wait();
            setSuccess(`Successfully deposited ${amount} BNB`);
            setAmount('');
            onSuccess();
        } catch (err: any) {
            setError(err.message || 'Deposit failed');
        } finally {
            setIsDepositing(false);
        }
    };

    const handleWithdraw = async () => {
        if (!provider || !amount || parseFloat(amount) <= 0) return;

        setError(null);
        setSuccess(null);
        setIsWithdrawing(true);

        try {
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(vaultAddress, AI_VAULT_ABI, signer);

            const tx = await contract.withdraw(ethers.parseEther(amount));
            await tx.wait();

            setSuccess(`Successfully withdrew ${amount} BNB`);
            setAmount('');
            onSuccess();
        } catch (err: any) {
            setError(err.message || 'Withdrawal failed');
        } finally {
            setIsWithdrawing(false);
        }
    };

    const setMaxWithdraw = () => {
        setAmount(userBalance);
    };

    if (!isConnected) {
        return (
            <div className="vault-deposit-card">
                <h3>💰 Deposit / Withdraw</h3>
                <div className="connect-prompt">
                    <p>Connect your wallet to manage your vault position</p>
                </div>
                <style>{styles}</style>
            </div>
        );
    }

    return (
        <div className="vault-deposit-card">
            <h3>💰 Deposit / Withdraw</h3>

            <div className="balance-display">
                <span>Your Vault Balance:</span>
                <strong>{parseFloat(userBalance).toFixed(4)} BNB</strong>
            </div>

            <div className="input-group">
                <input
                    type="number"
                    placeholder="Amount in BNB"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0"
                    step="0.01"
                />
                <button className="max-btn" onClick={setMaxWithdraw}>MAX</button>
            </div>

            <div className="button-group">
                <button
                    className="deposit-btn"
                    onClick={handleDeposit}
                    disabled={isDepositing || !amount || parseFloat(amount) <= 0}
                >
                    {isDepositing ? '⏳ Depositing...' : '📥 Deposit'}
                </button>
                <button
                    className="withdraw-btn"
                    onClick={handleWithdraw}
                    disabled={isWithdrawing || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > parseFloat(userBalance)}
                >
                    {isWithdrawing ? '⏳ Withdrawing...' : '📤 Withdraw'}
                </button>
            </div>

            {error && <div className="error-msg">❌ {error}</div>}
            {success && <div className="success-msg">✅ {success}</div>}

            <div className="info-text">
                <p>💡 Deposited funds are managed by the AI agent to optimize yields</p>
            </div>

            <style>{styles}</style>
        </div>
    );
};

const styles = `
  .vault-deposit-card {
    background: #1a1a2e;
    border-radius: 16px;
    padding: 1.5rem;
    border: 1px solid #30394a;
  }

  .vault-deposit-card h3 {
    margin: 0 0 1.5rem 0;
    color: #fff;
  }

  .balance-display {
    display: flex;
    justify-content: space-between;
    padding: 1rem;
    background: rgba(240, 185, 11, 0.1);
    border-radius: 8px;
    margin-bottom: 1rem;
  }

  .balance-display span {
    color: #888;
  }

  .balance-display strong {
    color: #f0b90b;
  }

  .input-group {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .input-group input {
    flex: 1;
    padding: 0.75rem 1rem;
    background: #0d0d15;
    border: 1px solid #30394a;
    border-radius: 8px;
    color: #fff;
    font-size: 1rem;
  }

  .input-group input:focus {
    outline: none;
    border-color: #f0b90b;
  }

  .max-btn {
    padding: 0.75rem 1rem;
    background: #30394a;
    border: none;
    border-radius: 8px;
    color: #f0b90b;
    cursor: pointer;
    font-weight: 600;
  }

  .max-btn:hover {
    background: #3d4654;
  }

  .button-group {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }

  .deposit-btn, .withdraw-btn {
    padding: 1rem;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .deposit-btn {
    background: #f0b90b;
    color: #000;
  }

  .deposit-btn:hover:not(:disabled) {
    background: #fcd535;
  }

  .withdraw-btn {
    background: #30394a;
    color: #fff;
  }

  .withdraw-btn:hover:not(:disabled) {
    background: #3d4654;
  }

  .deposit-btn:disabled, .withdraw-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .error-msg {
    margin-top: 1rem;
    padding: 0.75rem;
    background: rgba(255, 68, 68, 0.1);
    border: 1px solid #ff4444;
    border-radius: 8px;
    color: #ff4444;
    font-size: 0.9rem;
  }

  .success-msg {
    margin-top: 1rem;
    padding: 0.75rem;
    background: rgba(76, 175, 80, 0.1);
    border: 1px solid #4caf50;
    border-radius: 8px;
    color: #4caf50;
    font-size: 0.9rem;
  }

  .info-text {
    margin-top: 1rem;
    padding: 0.75rem;
    background: rgba(100, 100, 255, 0.1);
    border-radius: 8px;
  }

  .info-text p {
    margin: 0;
    color: #888;
    font-size: 0.85rem;
  }

  .connect-prompt {
    text-align: center;
    padding: 2rem;
    color: #888;
  }
`;

export default VaultDeposit;
