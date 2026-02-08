import React from 'react';

interface AIAction {
    actionType: number;
    target: string;
    amount: string;
    timestamp: number;
    reasoning: string;
}

interface AIDecisionLogProps {
    actions: AIAction[];
    getActionTypeName: (type: number) => string;
}

const AIDecisionLog: React.FC<AIDecisionLogProps> = ({ actions, getActionTypeName }) => {
    const formatDate = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleString();
    };

    // Get only actions with reasoning
    const decisionsWithReasoning = actions.filter(a => a.reasoning && a.reasoning.length > 0);

    return (
        <div className="ai-decision-log">
            <h3>🧠 AI Decision Log</h3>
            <p className="subtitle">Transparency into AI decision-making</p>

            {decisionsWithReasoning.length === 0 ? (
                <div className="empty-state">
                    <div className="robot-icon">🤖</div>
                    <p>The AI agent is analyzing market conditions...</p>
                    <p className="subtext">Decisions will appear here with full reasoning</p>
                </div>
            ) : (
                <div className="decision-list">
                    {decisionsWithReasoning.slice(0, 5).map((action, index) => (
                        <div key={index} className="decision-item">
                            <div className="decision-header">
                                <span className="decision-action">{getActionTypeName(action.actionType)}</span>
                                <span className="decision-time">{formatDate(action.timestamp)}</span>
                            </div>
                            <div className="decision-reasoning">
                                "{action.reasoning}"
                            </div>
                            {action.amount !== '0.0' && (
                                <div className="decision-impact">
                                    Impact: {action.amount} BNB
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <div className="ai-disclaimer">
                <span>⚡</span> Powered by Claude AI • All decisions logged onchain
            </div>

            <style>{`
        .ai-decision-log {
          background: #1a1a2e;
          border-radius: 16px;
          padding: 1.5rem;
          border: 1px solid #30394a;
        }

        .ai-decision-log h3 {
          margin: 0;
          color: #fff;
        }

        .ai-decision-log .subtitle {
          margin: 0.25rem 0 1.5rem;
          color: #666;
          font-size: 0.9rem;
        }

        .empty-state {
          text-align: center;
          padding: 2rem 1rem;
        }

        .robot-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .empty-state p {
          margin: 0.5rem 0;
          color: #888;
        }

        .empty-state .subtext {
          font-size: 0.85rem;
          color: #666;
        }

        .decision-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          max-height: 300px;
          overflow-y: auto;
        }

        .decision-item {
          padding: 1rem;
          background: linear-gradient(135deg, rgba(240, 185, 11, 0.05), rgba(240, 185, 11, 0.02));
          border-radius: 8px;
          border-left: 3px solid #f0b90b;
        }

        .decision-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .decision-action {
          font-weight: 600;
          color: #f0b90b;
        }

        .decision-time {
          font-size: 0.8rem;
          color: #666;
        }

        .decision-reasoning {
          color: #ccc;
          font-style: italic;
          font-size: 0.9rem;
          line-height: 1.4;
        }

        .decision-impact {
          margin-top: 0.5rem;
          padding-top: 0.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 0.85rem;
          color: #888;
        }

        .ai-disclaimer {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #30394a;
          font-size: 0.8rem;
          color: #666;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
      `}</style>
        </div>
    );
};

export default AIDecisionLog;
