import React, { useCallback, useRef } from 'react';
import { useCanvasStore } from '../store/canvasStore';

export function DrawingLayer() {
    const svgRef = useRef<SVGSVGElement>(null);
    const {
        drawings,
        currentDrawing,
        isDrawing,
        activeTool,
        drawingColor,
        drawingWidth,
        startDrawing,
        continueDrawing,
        endDrawing,
        zoom,
        pan,
    } = useCanvasStore();

    const getCanvasPoint = useCallback((e: React.MouseEvent) => {
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return { x: 0, y: 0 };
        return {
            x: (e.clientX - rect.left) / zoom,
            y: (e.clientY - rect.top) / zoom,
        };
    }, [zoom]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (activeTool !== 'draw') return;
        const point = getCanvasPoint(e);
        startDrawing(point);
    }, [activeTool, getCanvasPoint, startDrawing]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDrawing || activeTool !== 'draw') return;
        const point = getCanvasPoint(e);
        continueDrawing(point);
    }, [isDrawing, activeTool, getCanvasPoint, continueDrawing]);

    const handleMouseUp = useCallback(() => {
        if (isDrawing) {
            endDrawing();
        }
    }, [isDrawing, endDrawing]);

    const pointsToPath = (points: { x: number; y: number }[]) => {
        if (points.length < 2) return '';
        const [first, ...rest] = points;
        return `M ${first.x} ${first.y} ${rest.map((p) => `L ${p.x} ${p.y}`).join(' ')}`;
    };

    return (
        <svg
            ref={svgRef}
            className={`drawing-layer ${activeTool === 'draw' ? 'active' : ''}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ overflow: 'visible' }}
        >
            {/* Existing drawings */}
            {drawings.map((drawing) => (
                <path
                    key={drawing.id}
                    className="drawing-path"
                    d={pointsToPath(drawing.points)}
                    stroke={drawing.color}
                    strokeWidth={drawing.width}
                />
            ))}

            {/* Current drawing in progress */}
            {isDrawing && currentDrawing.length > 1 && (
                <path
                    className="drawing-path"
                    d={pointsToPath(currentDrawing)}
                    stroke={drawingColor}
                    strokeWidth={drawingWidth}
                    opacity={0.8}
                />
            )}
        </svg>
    );
}
