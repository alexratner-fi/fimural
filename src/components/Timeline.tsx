import React from 'react';
import { useCanvasStore } from '../store/canvasStore';

const TIMELINE_HEIGHT = 200;

export function TimelineGrid() {
    const { timeline, cards } = useCanvasStore();

    return (
        <div
            className="timeline-grid"
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100vw',
                height: TIMELINE_HEIGHT,
            }}
        >
            {timeline.map((month) => {
                const monthCards = cards.filter(c => c.timelineMonth === month.id);
                const capacityPercent = (month.currentVelocity / month.maxVelocity) * 100;
                const isOverCapacity = month.currentVelocity > month.maxVelocity;

                return (
                    <div
                        key={month.id}
                        className={`timeline-column ${isOverCapacity ? 'over-capacity' : ''}`}
                    >
                        <div className="timeline-header">
                            <span className="timeline-month">{month.name}</span>
                            <div className="timeline-capacity">
                                <div className="capacity-bar">
                                    <div
                                        className={`capacity-fill ${capacityPercent > 100 ? 'danger' :
                                            capacityPercent > 80 ? 'warning' : ''
                                            }`}
                                        style={{ width: `${Math.min(capacityPercent, 100)}%` }}
                                    />
                                </div>
                                <span className="capacity-text">
                                    {month.currentVelocity} / {month.maxVelocity} pts
                                </span>
                            </div>
                        </div>

                        <div className="timeline-cards">
                            {monthCards.length === 0 && (
                                <div style={{
                                    padding: '16px',
                                    textAlign: 'center',
                                    color: 'var(--color-text-tertiary)',
                                    fontSize: '12px',
                                    border: '2px dashed var(--color-border-default)',
                                    borderRadius: '8px',
                                }}>
                                    Drop cards here
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
