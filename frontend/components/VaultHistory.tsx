import React from 'react';

interface AIAction {
    actionType: number;
    target: string;
    amount: string;
    timestamp: number;
    reasoning: string;
}

interface VaultHistoryProps {
    actions: AIAction[];
    getActionTypeName: (type: number) => string;
}

const VaultHistory: React.FC<VaultHistoryProps> = ({ actions, getActionTypeName }) => {
    const formatDate = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleString();
    };

    const getActionIcon = (type: number) => {
        const icons = ['📥', '📤', '🔄', '🌉'];
        return icons[type] || '❓';
    };

    const getActionColor = (type: number) => {
        const colors = ['#4caf50', '#ff9800', '#2196f3', '#9c27b0'];
        return colors[type] || '#888';
    };

    return (
        <div className="vault-history-card">
            <h3>📜 Action History</h3>

            {actions.length === 0 ? (
                <div className="empty-state">
                    <p>No actions yet. The AI agent will start executing strategies once there are deposited funds.</p>
                </div>
            ) : (
                <div className="history-list">
                    {actions.map((action, index) => (
                        <div key={index} className="history-item">
                            <div className="action-icon" style={{ color: getActionColor(action.actionType) }}>
                                {getActionIcon(action.actionType)}
                            </div>
                            <div className="action-details">
                                <div className="action-header">
                                    <span className="action-type" style={{ color: getActionColor(action.actionType) }}>
                                        {getActionTypeName(action.actionType)}
                                    </span>
                                    <span className="action-time">{formatDate(action.timestamp)}</span>
                                </div>
                                {action.amount !== '0.0' && (
                                    <div className="action-amount">{action.amount} BNB</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style>{`
        .vault-history-card {
          background: #1a1a2e;
          border-radius: 16px;
          padding: 1.5rem;
          border: 1px solid #30394a;
          grid-column: span 2;
        }

        @media (max-width: 768px) {
          .vault-history-card {
            grid-column: span 1;
          }
        }

        .vault-history-card h3 {
          margin: 0 0 1.5rem 0;
          color: #fff;
        }

        .empty-state {
          text-align: center;
          padding: 2rem;
          color: #888;
        }

        .history-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          max-height: 400px;
          overflow-y: auto;
        }

        .history-item {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          background: #0d0d15;
          border-radius: 8px;
          border: 1px solid #30394a;
        }

        .action-icon {
          font-size: 1.5rem;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
        }

        .action-details {
          flex: 1;
        }

        .action-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.25rem;
        }

        .action-type {
          font-weight: 600;
        }

        .action-time {
          font-size: 0.8rem;
          color: #666;
        }

        .action-amount {
          font-size: 0.9rem;
          color: #888;
        }
      `}</style>
        </div>
    );
};

export default VaultHistory;
