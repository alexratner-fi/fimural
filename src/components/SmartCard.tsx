import React, { useCallback, useState, useRef } from 'react';
import { useCanvasStore } from '../store/canvasStore';
import { SmartCard, Effort, EFFORT_POINTS } from '../types';
import { GripVertical, AlertCircle } from 'lucide-react';

interface SmartCardProps {
    card: SmartCard;
}

export function SmartCardComponent({ card }: SmartCardProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const cardRef = useRef<HTMLDivElement>(null);

    const {
        selectedCardIds,
        selectCard,
        moveCard,
        setEditingCard,
        currentLens,
        currentUserRole,
        activeTool,
        connectingFromCardId,
        setConnectingFrom,
        addConnector,
        votingMode,
        showHeatmap,
        placeVote,
        zoom,
        assignCardToMonth,
    } = useCanvasStore();

    const isSelected = selectedCardIds.includes(card.id);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (activeTool === 'connector') {
            e.stopPropagation();
            if (connectingFromCardId) {
                if (connectingFromCardId !== card.id) {
                    addConnector(connectingFromCardId, card.id, true);
                }
                setConnectingFrom(null);
            } else {
                setConnectingFrom(card.id);
            }
            return;
        }

        if (votingMode) {
            e.stopPropagation();
            placeVote(card.id);
            return;
        }

        e.stopPropagation();

        const rect = cardRef.current?.getBoundingClientRect();
        if (!rect) return;

        setDragOffset({
            x: e.clientX / zoom - card.position.x,
            y: e.clientY / zoom - card.position.y,
        });
        setIsDragging(true);
        selectCard(card.id, e.shiftKey);
    }, [activeTool, connectingFromCardId, card.id, votingMode, zoom, card.position, selectCard, placeVote, addConnector, setConnectingFrom]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging) return;

        const newX = e.clientX / zoom - dragOffset.x;
        const newY = e.clientY / zoom - dragOffset.y;

        moveCard(card.id, { x: newX, y: newY });

        // Check if in timeline zone
        const TIMELINE_HEIGHT = 200;
        if (newY < TIMELINE_HEIGHT) {
            // Calculate which month column
            const columnWidth = window.innerWidth / 3;
            let monthId: string | null = null;

            if (newX < columnWidth) {
                monthId = 'jan';
            } else if (newX < columnWidth * 2) {
                monthId = 'feb';
            } else {
                monthId = 'mar';
            }

            if (card.timelineMonth !== monthId) {
                assignCardToMonth(card.id, monthId);
            }
        } else if (card.timelineMonth !== null) {
            assignCardToMonth(card.id, null);
        }
    }, [isDragging, dragOffset, zoom, card.id, card.timelineMonth, moveCard, assignCardToMonth]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    // Add/remove global listeners for dragging
    React.useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    const handleDoubleClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (!votingMode) {
            setEditingCard(card.id);
        }
    }, [card.id, votingMode, setEditingCard]);

    // Calculate RICE score
    const riceScore = Math.round(
        (card.rice.reach * card.rice.impact * card.rice.confidence) / card.rice.effort
    );

    // Get vote heatmap class
    const getHeatmapClass = () => {
        if (!showHeatmap) return '';
        if (card.votes >= 4) return 'heatmap-high';
        if (card.votes >= 2) return 'heatmap-medium';
        if (card.votes >= 1) return 'heatmap-low';
        return '';
    };

    // Render lens-specific overlay
    const renderLensOverlay = () => {
        if (currentLens === 'engineering' && card.effort) {
            return (
                <div className="card-lens-engineering">
                    {EFFORT_POINTS[card.effort]} pts • {card.blockedBy.length} deps
                </div>
            );
        }
        if (currentLens === 'data') {
            return (
                <div className="card-lens-engineering" style={{ background: '#1e3a5f', color: '#7dd3fc' }}>
                    ~{Math.floor(Math.random() * 10000 + 1000)} MAU impacted
                </div>
            );
        }
        if (currentLens === 'design' && card.attachments.length > 0) {
            return (
                <div className="card-lens-engineering" style={{ background: '#5b21b6', color: '#e9d5ff' }}>
                    {card.attachments.length} Figma link(s)
                </div>
            );
        }
        return null;
    };

    return (
        <div
            ref={cardRef}
            className={`smart-card ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
            style={{
                left: card.position.x,
                top: card.position.y,
                cursor: activeTool === 'connector'
                    ? (connectingFromCardId === card.id ? 'crosshair' : 'pointer')
                    : votingMode ? 'pointer' : 'grab',
            }}
            onMouseDown={handleMouseDown}
            onDoubleClick={handleDoubleClick}
        >
            {/* Lens Overlay */}
            {renderLensOverlay()}

            {/* Heatmap Glow */}
            {showHeatmap && card.votes > 0 && (
                <div className={`heatmap-overlay ${getHeatmapClass()}`}>
                    <div className={`heatmap-glow ${getHeatmapClass()}`} />
                </div>
            )}

            {/* Vote Dots */}
            {card.votes > 0 && (
                <div className="card-votes">
                    {Array.from({ length: Math.min(card.votes, 5) }).map((_, i) => (
                        <div key={i} className="vote-dot" />
                    ))}
                </div>
            )}

            {/* Header */}
            <div className="card-header">
                <span className="card-title">{card.title}</span>
                <span className={`card-status ${card.status}`} />
            </div>

            {/* Body */}
            <div className="card-body">
                {currentLens === 'design' ? (
                    <div style={{
                        height: '60px',
                        background: 'linear-gradient(135deg, var(--color-bg-tertiary), var(--color-bg-secondary))',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        color: 'var(--color-text-tertiary)'
                    }}>
                        Figma Preview
                    </div>
                ) : (
                    <p className="card-description">{card.description || 'No description'}</p>
                )}
            </div>

            {/* Footer */}
            <div className="card-footer">
                {card.effort && (
                    <span className={`card-effort ${card.effort}`}>{card.effort}</span>
                )}
                {!card.effort && <span />}
                <div className="card-rice">
                    <span className="rice-score">RICE: {riceScore}</span>
                </div>
            </div>

            {/* Connector highlight */}
            {connectingFromCardId === card.id && (
                <div style={{
                    position: 'absolute',
                    inset: -4,
                    border: '2px dashed var(--color-accent-primary)',
                    borderRadius: '12px',
                    pointerEvents: 'none',
                    animation: 'pulse 1s infinite',
                }} />
            )}

            {/* Blocker warning */}
            {card.blockedBy.length > 0 && (
                <div style={{
                    position: 'absolute',
                    top: '-8px',
                    left: '-8px',
                    width: '20px',
                    height: '20px',
                    background: 'var(--color-warning)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <AlertCircle size={12} color="white" />
                </div>
            )}
        </div>
    );
}
