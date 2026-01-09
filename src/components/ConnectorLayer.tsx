import React, { useMemo } from 'react';
import { useCanvasStore } from '../store/canvasStore';

export function ConnectorLayer() {
    const { cards, connectors, isBlockerViolation } = useCanvasStore();

    const paths = useMemo(() => {
        return connectors.map((connector) => {
            const fromCard = cards.find((c) => c.id === connector.fromCardId);
            const toCard = cards.find((c) => c.id === connector.toCardId);

            if (!fromCard || !toCard) return null;

            const CARD_WIDTH = 240;
            const CARD_HEIGHT = 120;

            // Calculate center points
            const fromX = fromCard.position.x + CARD_WIDTH / 2;
            const fromY = fromCard.position.y + CARD_HEIGHT / 2;
            const toX = toCard.position.x + CARD_WIDTH / 2;
            const toY = toCard.position.y + CARD_HEIGHT / 2;

            // Calculate edge connection points
            const dx = toX - fromX;
            const dy = toY - fromY;
            const angle = Math.atan2(dy, dx);

            // Start from edge of from card
            const startX = fromX + Math.cos(angle) * (CARD_WIDTH / 2);
            const startY = fromY + Math.sin(angle) * (CARD_HEIGHT / 2);

            // End at edge of to card
            const endX = toX - Math.cos(angle) * (CARD_WIDTH / 2);
            const endY = toY - Math.sin(angle) * (CARD_HEIGHT / 2);

            // Control points for bezier curve
            const midX = (startX + endX) / 2;
            const midY = (startY + endY) / 2;
            const curvature = 0.3;
            const perpX = -dy * curvature;
            const perpY = dx * curvature;

            const pathD = `M ${startX} ${startY} Q ${midX + perpX} ${midY + perpY} ${endX} ${endY}`;

            // Arrow head
            const arrowSize = 10;
            const arrowAngle = Math.atan2(endY - (midY + perpY), endX - (midX + perpX));
            const arrow1X = endX - arrowSize * Math.cos(arrowAngle - Math.PI / 6);
            const arrow1Y = endY - arrowSize * Math.sin(arrowAngle - Math.PI / 6);
            const arrow2X = endX - arrowSize * Math.cos(arrowAngle + Math.PI / 6);
            const arrow2Y = endY - arrowSize * Math.sin(arrowAngle + Math.PI / 6);

            const isInvalid = isBlockerViolation(connector);

            return {
                id: connector.id,
                pathD,
                arrowPoints: `${endX},${endY} ${arrow1X},${arrow1Y} ${arrow2X},${arrow2Y}`,
                isBlocker: connector.isBlocker,
                isInvalid,
            };
        }).filter(Boolean);
    }, [cards, connectors, isBlockerViolation]);

    return (
        <svg className="connector-svg" style={{ overflow: 'visible' }}>
            <defs>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {paths.map((path) => path && (
                <g key={path.id}>
                    <path
                        className={`connector-path ${path.isBlocker ? 'blocker' : ''} ${path.isInvalid ? 'invalid' : ''}`}
                        d={path.pathD}
                        filter={path.isInvalid ? 'url(#glow)' : undefined}
                    />
                    <polygon
                        className={`connector-arrow ${path.isBlocker ? 'blocker' : ''} ${path.isInvalid ? 'invalid' : ''}`}
                        points={path.arrowPoints}
                    />
                </g>
            ))}
        </svg>
    );
}
