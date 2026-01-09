import React from 'react';
import { useCanvasStore } from '../store/canvasStore';
import { StickyNote, ChevronRight } from 'lucide-react';

export function FeedbackInbox() {
    const { sidebarOpen, cards, selectCard, currentLens } = useCanvasStore();

    const boardCards = cards.filter(card => card.board === currentLens);

    const handleCardClick = (cardId: string) => {
        selectCard(cardId);
        // Pan to card location could be added here
    };

    return (
        <aside className={`sidebar ${!sidebarOpen ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <StickyNote size={18} />
                    <span className="sidebar-title">{currentLens.charAt(0).toUpperCase() + currentLens.slice(1)} Notes</span>
                </div>
                <span style={{
                    padding: '2px 8px',
                    background: 'var(--color-accent-primary)',
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 600,
                }}>
                    {boardCards.length}
                </span>
            </div>

            <div className="sidebar-content">
                {boardCards.length === 0 ? (
                    <div className="empty-state">
                        <StickyNote size={32} style={{ opacity: 0.3, marginBottom: '12px' }} />
                        <h3 className="empty-state-title">No notes yet</h3>
                        <p className="empty-state-description">
                            Double-click on the canvas to create a sticky note for this team
                        </p>
                    </div>
                ) : (
                    boardCards.map((card) => (
                        <div
                            key={card.id}
                            className="feedback-item"
                            onClick={() => handleCardClick(card.id)}
                            style={{
                                backgroundColor: '#fef9c3',
                                borderColor: '#fde047',
                                cursor: 'pointer',
                            }}
                        >
                            <p className="feedback-text" style={{ color: '#713f12' }}>
                                {card.title || 'Empty note'}
                            </p>
                            <div className="feedback-meta" style={{ justifyContent: 'flex-end' }}>
                                <ChevronRight size={14} style={{ color: '#a16207' }} />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </aside>
    );
}
