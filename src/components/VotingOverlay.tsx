import React from 'react';
import { useCanvasStore } from '../store/canvasStore';

export function VotingOverlay() {
    const { votingMode, votingDotsRemaining, showHeatmap } = useCanvasStore();

    if (!votingMode) return null;

    return (
        <>
            {/* Semi-transparent backdrop when not revealed */}
            {!showHeatmap && (
                <div
                    className="voting-overlay"
                    style={{
                        backgroundColor: 'transparent',
                        backdropFilter: 'none',
                    }}
                />
            )}

            {/* Voting panel */}
            <div className="voting-panel">
                <span style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--color-text-primary)'
                }}>
                    {showHeatmap ? 'Voting Results' : 'Place Your Votes'}
                </span>

                {!showHeatmap && (
                    <>
                        <div className="voting-dots">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`voting-dot ${i >= votingDotsRemaining ? 'used' : ''}`}
                                />
                            ))}
                        </div>
                        <span style={{
                            fontSize: '12px',
                            color: 'var(--color-text-secondary)'
                        }}>
                            {votingDotsRemaining} remaining
                        </span>
                    </>
                )}

                {showHeatmap && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <div style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.5), transparent)'
                            }} />
                            <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Low</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <div style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.7), transparent)'
                            }} />
                            <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Medium</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <div style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.9), transparent)'
                            }} />
                            <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>High</span>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
