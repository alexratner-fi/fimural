import React, { useMemo } from 'react';
import { useCanvasStore } from '../store/canvasStore';

const MINIMAP_WIDTH = 180;
const MINIMAP_HEIGHT = 120;
const WORLD_WIDTH = 3000;
const WORLD_HEIGHT = 2000;

export function Minimap() {
    const { cards, zoom, pan } = useCanvasStore();

    const scale = useMemo(() => ({
        x: MINIMAP_WIDTH / WORLD_WIDTH,
        y: MINIMAP_HEIGHT / WORLD_HEIGHT,
    }), []);

    // Calculate viewport rectangle
    const viewport = useMemo(() => {
        const viewWidth = window.innerWidth / zoom;
        const viewHeight = window.innerHeight / zoom;
        const viewX = -pan.x / zoom;
        const viewY = -pan.y / zoom;

        return {
            x: viewX * scale.x,
            y: viewY * scale.y,
            width: viewWidth * scale.x,
            height: viewHeight * scale.y,
        };
    }, [zoom, pan, scale]);

    // Map cards to minimap
    const minimapCards = useMemo(() => {
        return cards.map((card) => ({
            id: card.id,
            x: card.position.x * scale.x,
            y: card.position.y * scale.y,
            width: 240 * scale.x,
            height: 120 * scale.y,
        }));
    }, [cards, scale]);

    return (
        <div className="minimap">
            <div className="minimap-content">
                {/* Timeline zone indicator */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 200 * scale.y,
                        background: 'var(--color-bg-tertiary)',
                        borderBottom: '1px solid var(--color-border-default)',
                    }}
                />

                {/* Cards */}
                {minimapCards.map((card) => (
                    <div
                        key={card.id}
                        className="minimap-card"
                        style={{
                            left: card.x,
                            top: card.y,
                            width: Math.max(card.width, 3),
                            height: Math.max(card.height, 2),
                        }}
                    />
                ))}

                {/* Viewport indicator */}
                <div
                    className="minimap-viewport"
                    style={{
                        left: Math.max(0, viewport.x),
                        top: Math.max(0, viewport.y),
                        width: Math.min(viewport.width, MINIMAP_WIDTH - viewport.x),
                        height: Math.min(viewport.height, MINIMAP_HEIGHT - viewport.y),
                    }}
                />
            </div>
        </div>
    );
}
