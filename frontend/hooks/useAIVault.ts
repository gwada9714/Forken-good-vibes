import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../../../../src/contexts/WalletContext';

const AI_VAULT_ABI = [
    'function deposit() external payable',
    'function withdraw(uint256 amount) external',
    'function getUserTokenBalance(address user, address token) external view returns (uint256)',
    'function totalValueLocked() external view returns (uint256)',
    'function getActionCount() external view returns (uint256)',
    'function getRecentActions(uint256 count) external view returns (tuple(uint8 actionType, address target, uint256 amount, uint256 timestamp, string reasoning)[])',
    'event Deposited(address indexed user, address indexed token, uint256 amount)',
    'event Withdrawn(address indexed user, address indexed token, uint256 amount)',
    'event AIActionExecuted(uint8 indexed actionType, address target, uint256 amount, string reasoning)',
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

export function useAIVault(vaultAddress: string) {
    const { address, isConnected, provider } = useWallet();
    const [stats, setStats] = useState<VaultStats>({ tvl: '0', userBalance: '0', actionCount: 0 });
    const [recentActions, setRecentActions] = useState<AIAction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadVaultData = useCallback(async () => {
        if (!provider || !vaultAddress) {
            setLoading(false);
            return;
        }

        try {
            setError(null);
            const contract = new ethers.Contract(vaultAddress, AI_VAULT_ABI, provider);

            const tvl = await contract.totalValueLocked();

            let userBalance = ethers.parseEther('0');
            if (address) {
                userBalance = await contract.getUserTokenBalance(address, ethers.ZeroAddress);
            }

            const actionCount = await contract.getActionCount();

            setStats({
                tvl: ethers.formatEther(tvl),
                userBalance: ethers.formatEther(userBalance),
                actionCount: Number(actionCount),
            });

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
        } catch (err: any) {
            console.error('Failed to load vault data:', err);
            setError(err.message || 'Failed to load vault data');
        } finally {
            setLoading(false);
        }
    }, [provider, vaultAddress, address]);

    const deposit = useCallback(async (amount: string) => {
        if (!provider || !vaultAddress) throw new Error('Not connected');

        const signer = await provider.getSigner();
        const contract = new ethers.Contract(vaultAddress, AI_VAULT_ABI, signer);

        const tx = await contract.deposit({
            value: ethers.parseEther(amount),
        });

        await tx.wait();
        await loadVaultData();

        return tx.hash;
    }, [provider, vaultAddress, loadVaultData]);

    const withdraw = useCallback(async (amount: string) => {
        if (!provider || !vaultAddress) throw new Error('Not connected');

        const signer = await provider.getSigner();
        const contract = new ethers.Contract(vaultAddress, AI_VAULT_ABI, signer);

        const tx = await contract.withdraw(ethers.parseEther(amount));
        await tx.wait();
        await loadVaultData();

        return tx.hash;
    }, [provider, vaultAddress, loadVaultData]);

    useEffect(() => {
        loadVaultData();
    }, [loadVaultData]);

    // Subscribe to events
    useEffect(() => {
        if (!provider || !vaultAddress) return;

        const contract = new ethers.Contract(vaultAddress, AI_VAULT_ABI, provider);

        const onDeposited = () => loadVaultData();
        const onWithdrawn = () => loadVaultData();
        const onAIAction = () => loadVaultData();

        contract.on('Deposited', onDeposited);
        contract.on('Withdrawn', onWithdrawn);
        contract.on('AIActionExecuted', onAIAction);

        return () => {
            contract.off('Deposited', onDeposited);
            contract.off('Withdrawn', onWithdrawn);
            contract.off('AIActionExecuted', onAIAction);
        };
    }, [provider, vaultAddress, loadVaultData]);

    return {
        stats,
        recentActions,
        loading,
        error,
        deposit,
        withdraw,
        refresh: loadVaultData,
    };
}

export default useAIVault;
