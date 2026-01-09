import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useCanvasStore } from '../store/canvasStore';
import { StickyNote, Type, Square, MessageSquare, Clipboard, Undo2, Grid3X3, Download, Minus, Plus, Trash2, X, Vote, Lock, Unlock, LayoutGrid, Bold, Italic, AlignLeft, AlignCenter, AlignRight, Circle, Star, Smile, Heart, Zap, Flame, Cloud, Sun, Moon, Target, Coffee } from 'lucide-react';
import { ThemeContainer } from '../types';

const GRID_SIZE = 20;

interface ContextMenuState {
    visible: boolean;
    x: number;
    y: number;
    canvasX: number;
    canvasY: number;
}

const STICKY_COLORS = [
    { name: 'Yellow', value: '#fef08a' },
    { name: 'Pink', value: '#fbcfe8' },
    { name: 'Blue', value: '#bfdbfe' },
    { name: 'Green', value: '#bbf7d0' },
    { name: 'Orange', value: '#fed7aa' },
    { name: 'White', value: '#ffffff' }
];

const AREA_COLORS = [
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#10b981' },
    { name: 'Yellow', value: '#f59e0b' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Grey', value: '#6b7280' },
];

const TEXT_COLORS = [
    { name: 'Black', value: '#1f2937' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Green', value: '#10b981' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Grey', value: '#9ca3af' },
];

export function Canvas() {
    const canvasRef = useRef<HTMLDivElement>(null);
    const [contextMenu, setContextMenu] = useState<ContextMenuState>({ visible: false, x: 0, y: 0, canvasX: 0, canvasY: 0 });
    const [showGrid, setShowGrid] = useState(true);

    const {
        zoom,
        pan,
        setPan,
        setZoom,
        cards,
        addCard,
        moveCard,
        updateCard,
        deleteCard,
        selectedCardIds,
        selectedAreaIds,
        selectCard,
        selectMultipleCards,
        clearSelection,
        themeContainers,
        updateThemeContainer,
        removeThemeContainer,
        moveThemeContainer,
        selectArea,
        organizeArea,
        toggleAreaLock,
        currentLens,
        votingSession,
        placeVote,
        showHeatmap,
    } = useCanvasStore();

    const [selectionRect, setSelectionRect] = useState<{ startX: number; startY: number; currentX: number; currentY: number } | null>(null);

    // Filter cards by current board/team
    const boardCards = cards.filter(card => card.board === currentLens);

    // Smooth pan/zoom with requestAnimationFrame
    const targetPan = useRef(pan);
    const targetZoom = useRef(zoom);

    useEffect(() => {
        targetPan.current = pan;
        targetZoom.current = zoom;
    }, [pan, zoom]);

    // Handle keyboard events for deletion
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Only trigger if not typing in a textarea or input
            if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) {
                return;
            }

            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedCardIds.length > 0) {
                e.preventDefault();
                selectedCardIds.forEach(id => deleteCard(id));
                clearSelection();
            }

            // Duplicate with Cmd+D
            if ((e.metaKey || e.ctrlKey) && e.key === 'd' && selectedCardIds.length > 0) {
                e.preventDefault();
                const newIds: string[] = [];
                selectedCardIds.forEach(id => {
                    const card = cards.find(c => c.id === id);
                    if (card) {
                        const newCard = addCard({
                            ...card,
                            position: { x: card.position.x + 20, y: card.position.y + 20 },
                        });
                        newIds.push(newCard.id);
                    }
                });
                selectMultipleCards(newIds);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedCardIds, deleteCard, clearSelection]);

    // Handle wheel for smooth pan/zoom
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();

            if (e.ctrlKey || e.metaKey) {
                // Pinch zoom - smooth
                const rect = canvas.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;

                const delta = e.deltaY > 0 ? 0.97 : 1.03;
                const newZoom = Math.max(0.1, Math.min(4, targetZoom.current * delta));

                // Zoom towards mouse position
                const zoomRatio = newZoom / targetZoom.current;
                const newPanX = mouseX - (mouseX - targetPan.current.x) * zoomRatio;
                const newPanY = mouseY - (mouseY - targetPan.current.y) * zoomRatio;

                setZoom(newZoom);
                setPan({ x: newPanX, y: newPanY });
            } else {
                // Smooth pan with two-finger scroll
                setPan({
                    x: targetPan.current.x - e.deltaX * 0.8,
                    y: targetPan.current.y - e.deltaY * 0.8,
                });
            }
        };

        canvas.addEventListener('wheel', handleWheel, { passive: false });
        return () => canvas.removeEventListener('wheel', handleWheel);
    }, [setPan, setZoom]);

    // Right-click context menu
    const handleContextMenu = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const canvasX = (e.clientX - rect.left - pan.x) / zoom;
        const canvasY = (e.clientY - rect.top - pan.y) / zoom;

        setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            canvasX,
            canvasY,
        });
    }, [pan, zoom]);

    // Close context menu
    const closeContextMenu = useCallback(() => {
        setContextMenu(prev => ({ ...prev, visible: false }));
    }, []);

    // Context menu actions
    const addStickyNote = useCallback(() => {
        addCard({
            type: 'sticky',
            position: { x: contextMenu.canvasX - 75, y: contextMenu.canvasY - 50 }
        });
        closeContextMenu();
    }, [addCard, contextMenu, closeContextMenu]);

    const addHeading = useCallback(() => {
        addCard({
            type: 'text',
            position: { x: contextMenu.canvasX - 100, y: contextMenu.canvasY - 20 },
            title: 'Heading',
            fontSize: 32,
            width: 300,
            height: 60
        });
        closeContextMenu();
    }, [addCard, contextMenu, closeContextMenu]);

    const addTextBox = useCallback(() => {
        addCard({
            type: 'text',
            position: { x: contextMenu.canvasX - 100, y: contextMenu.canvasY - 50 },
            title: 'Enter text here...',
            fontSize: 16,
            width: 250,
            height: 100
        });
        closeContextMenu();
    }, [addCard, contextMenu, closeContextMenu]);

    const addArea = useCallback(() => {
        const currentLens = useCanvasStore.getState().currentLens;
        const newArea = {
            id: `area-${Date.now()}`,
            board: currentLens,
            label: 'New Area',
            cardIds: [],
            bounds: { x: contextMenu.canvasX - 200, y: contextMenu.canvasY - 150, width: 400, height: 300 },
            color: '#6366f1',
        };
        useCanvasStore.setState({ themeContainers: [...useCanvasStore.getState().themeContainers, newArea] });
        closeContextMenu();
    }, [contextMenu, closeContextMenu]);

    const addComment = useCallback(() => {
        addCard({
            position: { x: contextMenu.canvasX - 75, y: contextMenu.canvasY - 50 },
            title: '💬 Comment',
        });
        closeContextMenu();
    }, [addCard, contextMenu, closeContextMenu]);

    // Click anywhere to close menu and clear selection
    const handleClick = useCallback((e: React.MouseEvent) => {
        if (contextMenu.visible) {
            closeContextMenu();
            return;
        }
        // Click on background clears selection
        if ((e.target as HTMLElement) === canvasRef.current || (e.target as HTMLElement).tagName === 'svg') {
            clearSelection();
        }
    }, [contextMenu.visible, closeContextMenu, clearSelection]);

    // Handle Selection Marquee
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        // Only start marquee if clicking directly on canvas background or SVG grid
        if (e.button !== 0) return; // Only left click
        if (e.target !== canvasRef.current && (e.target as HTMLElement).tagName !== 'svg') return;

        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = (e.clientX - rect.left - pan.x) / zoom;
        const y = (e.clientY - rect.top - pan.y) / zoom;

        setSelectionRect({ startX: x, startY: y, currentX: x, currentY: y });
        clearSelection();
    }, [pan, zoom, clearSelection]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!selectionRect) return;

        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = (e.clientX - rect.left - pan.x) / zoom;
        const y = (e.clientY - rect.top - pan.y) / zoom;

        setSelectionRect(prev => prev ? { ...prev, currentX: x, currentY: y } : null);
    }, [selectionRect, pan, zoom]);

    const handleMouseUp = useCallback(() => {
        if (!selectionRect) return;

        // Calculate final rect
        const x1 = Math.min(selectionRect.startX, selectionRect.currentX);
        const y1 = Math.min(selectionRect.startY, selectionRect.currentY);
        const x2 = Math.max(selectionRect.startX, selectionRect.currentX);
        const y2 = Math.max(selectionRect.startY, selectionRect.currentY);

        // Find cards within rect
        const cardsInRect = boardCards.filter(card => {
            const cardX = card.position.x;
            const cardY = card.position.y;
            const cardW = card.width || 150;
            const cardH = card.height || 100;

            // Check if card overlaps with selection rect
            return cardX < x2 && cardX + cardW > x1 && cardY < y2 && cardY + cardH > y1;
        });

        if (cardsInRect.length > 0) {
            selectMultipleCards(cardsInRect.map(c => c.id));
        } else {
            clearSelection();
        }

        setSelectionRect(null);
    }, [selectionRect, boardCards, selectMultipleCards]);

    // Double-click to create sticky note
    const handleDoubleClick = useCallback((e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('.canvas-card')) return;
        if ((e.target as HTMLElement).closest('.context-menu')) return;

        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = (e.clientX - rect.left - pan.x) / zoom;
        const y = (e.clientY - rect.top - pan.y) / zoom;

        addCard({
            type: 'sticky',
            position: { x: x - 75, y: y - 50 }
        });
    }, [pan, zoom, addCard]);

    // Generate grid dots
    const gridDots = [];
    if (showGrid) {
        const gridSpacing = Math.max(GRID_SIZE * zoom, 8);
        const offsetX = ((pan.x % gridSpacing) + gridSpacing) % gridSpacing;
        const offsetY = ((pan.y % gridSpacing) + gridSpacing) % gridSpacing;

        for (let x = offsetX; x < window.innerWidth; x += gridSpacing) {
            for (let y = offsetY; y < window.innerHeight; y += gridSpacing) {
                gridDots.push(
                    <circle
                        key={`${Math.round(x)}-${Math.round(y)}`}
                        cx={x}
                        cy={y}
                        r={1.5}
                        fill="#d1d5db"
                    />
                );
            }
        }
    }

    return (
        <div
            ref={canvasRef}
            style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#fafafa',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'default',
            }}
            onDoubleClick={handleDoubleClick}
            onClick={handleClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onContextMenu={handleContextMenu}
        >
            {/* Grid */}
            {showGrid && (
                <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                    {gridDots}
                </svg>
            )}

            {/* Selection Marquee */}
            {selectionRect && (
                <div
                    style={{
                        position: 'absolute',
                        left: Math.min(selectionRect.startX, selectionRect.currentX) * zoom + pan.x,
                        top: Math.min(selectionRect.startY, selectionRect.currentY) * zoom + pan.y,
                        width: Math.abs(selectionRect.currentX - selectionRect.startX) * zoom,
                        height: Math.abs(selectionRect.currentY - selectionRect.startY) * zoom,
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid #3b82f6',
                        pointerEvents: 'none',
                        zIndex: 1000,
                    }}
                />
            )}

            {/* Canvas Content */}
            <div
                style={{
                    position: 'absolute',
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    transformOrigin: '0 0',
                    transition: 'none',
                }}
            >
                {/* Areas (Theme Containers) - filtered by board */}
                {themeContainers
                    .filter(container => container.board === currentLens)
                    .map((container) => (
                        <AreaContainer
                            key={container.id}
                            container={container}
                            zoom={zoom}
                            isSelected={selectedAreaIds.includes(container.id)}
                            onSelect={selectArea}
                            onClearSelection={clearSelection}
                            onUpdate={updateThemeContainer}
                            onMove={moveThemeContainer}
                            onDelete={removeThemeContainer}
                            onOrganize={organizeArea}
                            onToggleLock={toggleAreaLock}
                            allCards={boardCards}
                            onMoveCard={moveCard}
                        />
                    ))}

                {/* Canvas Elements (Sticky Notes & Text Boxes) - filtered by current board/team */}
                {boardCards.map((card) => (
                    <CanvasCardComponent
                        key={card.id}
                        card={card}
                        isSelected={selectedCardIds.includes(card.id)}
                        onSelect={selectCard}
                        onMove={moveCard}
                        onUpdate={updateCard}
                        onDelete={deleteCard}
                        zoom={zoom}
                        votingSession={votingSession}
                        onVote={placeVote}
                        showHeatmap={showHeatmap}
                    />
                ))}
            </div>

            {/* Context Menu */}
            {contextMenu.visible && (
                <div
                    className="context-menu"
                    style={{
                        position: 'fixed',
                        left: contextMenu.x,
                        top: contextMenu.y,
                        backgroundColor: 'white',
                        borderRadius: 12,
                        boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
                        padding: 8,
                        minWidth: 200,
                        zIndex: 1000,
                    }}
                >
                    <div style={{ padding: '4px 8px', fontSize: 11, color: '#9ca3af', fontWeight: 600, marginBottom: 4 }}>
                        ADD CONTENT
                    </div>
                    <ContextMenuItem icon={<StickyNote size={16} />} label="Sticky note" onClick={addStickyNote} />
                    <ContextMenuItem icon={<Type size={16} />} label="Heading" onClick={addHeading} />
                    <ContextMenuItem icon={<MessageSquare size={16} />} label="Text box" onClick={addTextBox} />
                    <ContextMenuItem icon={<Square size={16} />} label="Area" onClick={addArea} />
                    <ContextMenuItem icon={<MessageSquare size={16} />} label="Comment" onClick={addComment} />

                    <div style={{ height: 1, backgroundColor: '#e5e7eb', margin: '8px 0' }} />

                    <ContextMenuItem icon={<Clipboard size={16} />} label="Paste" shortcut="⌘V" onClick={closeContextMenu} />
                    <ContextMenuItem icon={<Undo2 size={16} />} label="Undo" shortcut="⌘Z" onClick={closeContextMenu} />

                    <div style={{ height: 1, backgroundColor: '#e5e7eb', margin: '8px 0' }} />

                    <ContextMenuItem
                        icon={<Grid3X3 size={16} />}
                        label="Show grid"
                        checked={showGrid}
                        onClick={() => { setShowGrid(!showGrid); closeContextMenu(); }}
                    />

                    <div style={{ height: 1, backgroundColor: '#e5e7eb', margin: '8px 0' }} />

                    <ContextMenuItem icon={<Download size={16} />} label="Download" shortcut="⌘E" onClick={closeContextMenu} />
                </div>
            )}
        </div>
    );
}

// Context Menu Item
function ContextMenuItem({ icon, label, shortcut, checked, onClick }: {
    icon: React.ReactNode;
    label: string;
    shortcut?: string;
    checked?: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                width: '100%',
                padding: '8px 12px',
                border: 'none',
                backgroundColor: checked ? '#f3f4f6' : 'transparent',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 14,
                color: '#374151',
                textAlign: 'left',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = checked ? '#f3f4f6' : 'transparent'}
        >
            <span style={{ color: '#6b7280' }}>{icon}</span>
            <span style={{ flex: 1 }}>{label}</span>
            {shortcut && <span style={{ color: '#9ca3af', fontSize: 12 }}>{shortcut}</span>}
            {checked !== undefined && checked && <span style={{ color: '#6b7280' }}>✓</span>}
        </button>
    );
}

// Area Container component with resize and rename support
interface AreaContainerProps {
    container: ThemeContainer;
    zoom: number;
    isSelected: boolean;
    onSelect: (id: string, addToSelection?: boolean) => void;
    onClearSelection: () => void;
    onUpdate: (id: string, updates: Partial<ThemeContainer>) => void;
    onMove: (id: string, position: { x: number; y: number }) => void;
    onDelete: (id: string) => void;
    onOrganize: (id: string) => void;
    onToggleLock: (id: string) => void;
    allCards: any[];
    onMoveCard: (id: string, position: { x: number; y: number }) => void;
}

function AreaContainer({
    container,
    zoom,
    isSelected,
    onSelect,
    onClearSelection,
    onUpdate,
    onMove,
    onDelete,
    onOrganize,
    onToggleLock,
    allCards,
    onMoveCard
}: AreaContainerProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isResizing, setIsResizing] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0, bounds: { x: 0, y: 0 } });
    const [label, setLabel] = useState(container.label);

    useEffect(() => {
        setLabel(container.label);
    }, [container.label]);

    const handleResizeStart = (e: React.MouseEvent, handle: string) => {
        e.stopPropagation();
        e.preventDefault();
        setIsResizing(handle);
        onSelect(container.id);
        setResizeStart({
            x: e.clientX,
            y: e.clientY,
            width: container.bounds.width,
            height: container.bounds.height,
            bounds: { x: container.bounds.x, y: container.bounds.y }
        });
    };

    const handleBlur = () => {
        setIsEditing(false);
        if (label.trim()) {
            onUpdate(container.id, { label: label });
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (isEditing) return;
        if ((e.target as HTMLElement).closest('.resize-handle')) return;
        if (container.isLocked) return;

        e.stopPropagation();
        onSelect(container.id);
        setIsDragging(true);
        setDragStart({
            x: e.clientX / zoom - container.bounds.x,
            y: e.clientY / zoom - container.bounds.y,
        });
    };

    // Drag effect
    useEffect(() => {
        if (!isDragging) return;

        const handleGlobalMouseMove = (e: MouseEvent) => {
            const newX = e.clientX / zoom - dragStart.x;
            const newY = e.clientY / zoom - dragStart.y;

            const deltaX = newX - container.bounds.x;
            const deltaY = newY - container.bounds.y;

            onMove(container.id, { x: newX, y: newY });

            // Move all cards that are inside this area
            allCards.forEach(card => {
                if (
                    card.position.x >= container.bounds.x &&
                    card.position.x <= container.bounds.x + container.bounds.width &&
                    card.position.y >= container.bounds.y &&
                    card.position.y <= container.bounds.y + container.bounds.height
                ) {
                    onMoveCard(card.id, {
                        x: card.position.x + deltaX,
                        y: card.position.y + deltaY
                    });
                }
            });
        };

        const handleGlobalMouseUp = () => {
            setIsDragging(false);
        };

        window.addEventListener('mousemove', handleGlobalMouseMove);
        window.addEventListener('mouseup', handleGlobalMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleGlobalMouseMove);
            window.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, [isDragging, dragStart, container.id, container.bounds, onMove, allCards, onMoveCard, zoom]);

    // Resize effect
    useEffect(() => {
        if (!isResizing) return;

        const handleGlobalMouseMove = (e: MouseEvent) => {
            const deltaX = (e.clientX - resizeStart.x) / zoom;
            const deltaY = (e.clientY - resizeStart.y) / zoom;

            let newWidth = resizeStart.width;
            let newHeight = resizeStart.height;
            let newX = resizeStart.bounds.x;
            let newY = resizeStart.bounds.y;

            if (isResizing.includes('e')) newWidth = Math.max(100, resizeStart.width + deltaX);
            if (isResizing.includes('w')) {
                newWidth = Math.max(100, resizeStart.width - deltaX);
                newX = resizeStart.bounds.x + (resizeStart.width - newWidth);
            }
            if (isResizing.includes('s')) newHeight = Math.max(80, resizeStart.height + deltaY);
            if (isResizing.includes('n')) {
                newHeight = Math.max(80, resizeStart.height - deltaY);
                newY = resizeStart.bounds.y + (resizeStart.height - newHeight);
            }

            onUpdate(container.id, {
                bounds: { x: newX, y: newY, width: newWidth, height: newHeight }
            });
        };

        const handleGlobalMouseUp = () => {
            setIsResizing(null);
        };

        if (container.isLocked) return;

        window.addEventListener('mousemove', handleGlobalMouseMove);
        window.addEventListener('mouseup', handleGlobalMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleGlobalMouseMove);
            window.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, [isResizing, resizeStart, container.id, onUpdate, zoom, container.isLocked]);

    const handleStyles: React.CSSProperties = {
        position: 'absolute',
        width: 14,
        height: 14,
        backgroundColor: 'white',
        border: `2px solid ${container.color}`,
        borderRadius: '50%',
        zIndex: 10,
    };

    return (
        <div
            className="area-container"
            onMouseDown={handleMouseDown}
            onClick={(e) => { e.stopPropagation(); onSelect(container.id, e.shiftKey || e.metaKey); }}
            style={{
                position: 'absolute',
                left: container.bounds.x,
                top: container.bounds.y,
                width: container.bounds.width,
                height: container.bounds.height,
                border: isSelected ? `3px solid ${container.color}` : `2px dashed ${container.color}`,
                borderRadius: 12,
                backgroundColor: isSelected
                    ? `color-mix(in srgb, ${container.color}, white 80%)`
                    : `color-mix(in srgb, ${container.color}, white 92%)`,
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                transition: isResizing ? 'none' : 'border 0.15s, background-color 0.15s',
            }}
        >
            {/* Label */}
            <div
                style={{
                    position: 'absolute',
                    top: -14,
                    left: 16,
                    padding: '4px 12px',
                    backgroundColor: 'white',
                    border: `1px solid ${container.color}`,
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 700,
                    color: container.color,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    cursor: 'text',
                    userSelect: 'none',
                    zIndex: 20,
                }}
                onDoubleClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
            >
                {isEditing ? (
                    <input
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        onBlur={handleBlur}
                        onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
                        autoFocus
                        style={{ border: 'none', outline: 'none', background: 'transparent', width: 'auto', minWidth: 60 }}
                    />
                ) : (
                    container.label
                )}
            </div>

            {/* Locked Badge */}
            {container.isLocked && (
                <div style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    color: container.color,
                    opacity: 0.6,
                    zIndex: 20
                }}>
                    <Lock size={14} />
                </div>
            )}

            {/* Selection/Toolbar for Area */}
            {isSelected && (
                <div
                    style={{
                        position: 'absolute',
                        top: -42,
                        right: 0,
                        backgroundColor: 'white',
                        borderRadius: 8,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px',
                        zIndex: 30,
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    {/* Locking */}
                    <button
                        onClick={() => onToggleLock(container.id)}
                        style={{ padding: 4, border: 'none', background: 'none', cursor: 'pointer', color: container.isLocked ? '#6366f1' : '#6b7280' }}
                        title={container.isLocked ? 'Unlock Area' : 'Lock Area'}
                    >
                        {container.isLocked ? <Lock size={16} /> : <Unlock size={16} />}
                    </button>

                    {!container.isLocked && (
                        <>
                            <div style={{ width: 1, height: 16, backgroundColor: '#e5e7eb', margin: '0 4px' }} />

                            {/* Organize */}
                            <button
                                onClick={() => onOrganize(container.id)}
                                style={{ padding: 4, border: 'none', background: 'none', cursor: 'pointer', color: '#6b7280' }}
                                title="Organize Grid"
                            >
                                <LayoutGrid size={16} />
                            </button>

                            <div style={{ width: 1, height: 16, backgroundColor: '#e5e7eb', margin: '0 4px' }} />

                            {/* Color Selector */}
                            <div style={{ display: 'flex', gap: 4, padding: '0 4px' }}>
                                {AREA_COLORS.map(c => (
                                    <button
                                        key={c.value}
                                        onClick={() => onUpdate(container.id, { color: c.value })}
                                        style={{
                                            width: 14,
                                            height: 14,
                                            borderRadius: '50%',
                                            backgroundColor: c.value,
                                            border: container.color === c.value ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                                            cursor: 'pointer',
                                            padding: 0
                                        }}
                                        title={c.name}
                                    />
                                ))}
                            </div>
                        </>
                    )}

                    <div style={{ width: 1, height: 16, backgroundColor: '#e5e7eb', margin: '0 4px' }} />

                    <button
                        onClick={() => onDelete(container.id)}
                        style={{ padding: 4, border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444' }}
                        title="Delete Area"
                    >
                        <Trash2 size={16} />
                    </button>
                    <button
                        onClick={() => onClearSelection()}
                        style={{ padding: 4, border: 'none', background: 'none', cursor: 'pointer', color: '#6b7280' }}
                        title="Deselect"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Resize handles */}
            {isSelected && !container.isLocked && (
                <>
                    <div className="resize-handle" style={{ ...handleStyles, top: -7, left: -7, cursor: 'nw-resize' }} onMouseDown={(e) => handleResizeStart(e, 'nw')} />
                    <div className="resize-handle" style={{ ...handleStyles, top: -7, right: -7, cursor: 'ne-resize' }} onMouseDown={(e) => handleResizeStart(e, 'ne')} />
                    <div className="resize-handle" style={{ ...handleStyles, bottom: -7, left: -7, cursor: 'sw-resize' }} onMouseDown={(e) => handleResizeStart(e, 'sw')} />
                    <div className="resize-handle" style={{ ...handleStyles, bottom: -7, right: -7, cursor: 'se-resize' }} onMouseDown={(e) => handleResizeStart(e, 'se')} />

                    <div className="resize-handle" style={{ ...handleStyles, top: -7, left: '50%', marginLeft: -7, cursor: 'n-resize' }} onMouseDown={(e) => handleResizeStart(e, 'n')} />
                    <div className="resize-handle" style={{ ...handleStyles, bottom: -7, left: '50%', marginLeft: -7, cursor: 's-resize' }} onMouseDown={(e) => handleResizeStart(e, 's')} />
                    <div className="resize-handle" style={{ ...handleStyles, left: -7, top: '50%', marginTop: -7, cursor: 'w-resize' }} onMouseDown={(e) => handleResizeStart(e, 'w')} />
                    <div className="resize-handle" style={{ ...handleStyles, right: -7, top: '50%', marginTop: -7, cursor: 'e-resize' }} onMouseDown={(e) => handleResizeStart(e, 'e')} />
                </>
            )}
        </div>
    );
}

// Canvas Card component (Sticky Notes & Text Boxes)
interface CanvasCardProps {
    card: {
        id: string;
        type: 'sticky' | 'text' | 'shape' | 'icon' | 'image' | 'framework';
        shapeType?: 'rectangle' | 'circle' | 'triangle' | 'star' | 'diamond';
        iconName?: string;
        imageUrl?: string;
        position: { x: number; y: number };
        width?: number;
        height?: number;
        fontSize?: number;
        color?: string;
        textAlign?: 'left' | 'center' | 'right';
        fontWeight?: string | number;
        fontStyle?: string;
        textColor?: string;
        votes: number;
        title: string
    };
    isSelected: boolean;
    onSelect: (id: string) => void;
    onMove: (id: string, position: { x: number; y: number }) => void;
    onUpdate: (id: string, updates: any) => void;
    onDelete: (id: string) => void;
    zoom: number;
    votingSession: { active: boolean; revealed: boolean; name: string };
    onVote: (id: string, remove?: boolean) => void;
    showHeatmap: boolean;
}

function CanvasCardComponent({ card, isSelected, onSelect, onMove, onUpdate, onDelete, zoom, votingSession, onVote, showHeatmap }: CanvasCardProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
    const [text, setText] = useState(card.title);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const width = card.width || 150;
    const height = card.height || 100;
    const fontSize = card.fontSize || 14;

    useEffect(() => {
        setText(card.title);
    }, [card.title]);

    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.select();
        }
    }, [isEditing]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (isEditing) return;
        e.stopPropagation();

        if (votingSession.active && !votingSession.revealed) {
            onVote(card.id, e.shiftKey);
            return;
        }

        onSelect(card.id);
        setIsDragging(true);
        setDragStart({
            x: e.clientX / zoom - card.position.x,
            y: e.clientY / zoom - card.position.y,
        });
    };

    const handleResizeStart = (e: React.MouseEvent, handle: string) => {
        e.stopPropagation();
        e.preventDefault();
        onSelect(card.id);
        setIsResizing(handle);
        setResizeStart({
            x: e.clientX,
            y: e.clientY,
            width: width,
            height: height,
        });
    };

    const handleDoubleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditing(true);
    };

    const handleBlur = () => {
        setIsEditing(false);
        if (text.trim()) {
            onUpdate(card.id, { title: text });
        } else {
            onDelete(card.id);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setText(card.title);
            setIsEditing(false);
        } else if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleBlur();

            // Mural behavior: Enter creates a new sticky below if we were editing
            const { addCard, setEditingCard } = useCanvasStore.getState();
            const newCard = addCard({
                type: 'sticky',
                position: { x: card.position.x, y: card.position.y + (card.height || 100) + 20 },
                color: card.color,
                title: ''
            });
            setTimeout(() => setEditingCard(newCard.id), 50);
        } else if (e.key === 'Tab') {
            e.preventDefault();
            handleBlur();

            // Mural behavior: Tab creates a new sticky to the right
            const { addCard, setEditingCard } = useCanvasStore.getState();
            const newCard = addCard({
                type: 'sticky',
                position: { x: card.position.x + (card.width || 150) + 20, y: card.position.y },
                color: card.color,
                title: ''
            });
            setTimeout(() => setEditingCard(newCard.id), 50);
        }
    };

    // Drag effect
    useEffect(() => {
        if (!isDragging) return;

        const handleGlobalMouseMove = (e: MouseEvent) => {
            onMove(card.id, {
                x: e.clientX / zoom - dragStart.x,
                y: e.clientY / zoom - dragStart.y,
            });
        };

        const handleGlobalMouseUp = () => {
            setIsDragging(false);
        };

        window.addEventListener('mousemove', handleGlobalMouseMove);
        window.addEventListener('mouseup', handleGlobalMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleGlobalMouseMove);
            window.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, [isDragging, dragStart, card.id, onMove, zoom]);

    // Resize effect
    useEffect(() => {
        if (!isResizing) return;

        const handleGlobalMouseMove = (e: MouseEvent) => {
            const deltaX = (e.clientX - resizeStart.x) / zoom;
            const deltaY = (e.clientY - resizeStart.y) / zoom;

            let newWidth = resizeStart.width;
            let newHeight = resizeStart.height;
            let newX = card.position.x;
            let newY = card.position.y;

            if (isResizing.includes('e')) newWidth = Math.max(80, resizeStart.width + deltaX);
            if (isResizing.includes('w')) {
                newWidth = Math.max(80, resizeStart.width - deltaX);
                newX = card.position.x + (resizeStart.width - newWidth);
            }
            if (isResizing.includes('s')) newHeight = Math.max(60, resizeStart.height + deltaY);
            if (isResizing.includes('n')) {
                newHeight = Math.max(60, resizeStart.height - deltaY);
                newY = card.position.y + (resizeStart.height - newHeight);
            }

            onUpdate(card.id, { width: newWidth, height: newHeight });
            if (newX !== card.position.x || newY !== card.position.y) {
                onMove(card.id, { x: newX, y: newY });
            }
        };

        const handleGlobalMouseUp = () => {
            setIsResizing(null);
        };

        window.addEventListener('mousemove', handleGlobalMouseMove);
        window.addEventListener('mouseup', handleGlobalMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleGlobalMouseMove);
            window.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, [isResizing, resizeStart, card.id, card.position, onUpdate, onMove, zoom]);

    const handleStyles: React.CSSProperties = {
        position: 'absolute',
        width: 12,
        height: 12,
        backgroundColor: 'white',
        border: '2px solid #3b82f6',
        borderRadius: '50%',
        zIndex: 10,
    };

    const isSticky = card.type === 'sticky';
    const isText = card.type === 'text';
    const isShape = card.type === 'shape';
    const isIcon = card.type === 'icon';
    const isImage = card.type === 'image';
    const isFramework = card.type === 'framework';

    const getShapePath = (type?: string) => {
        switch (type) {
            case 'circle': return 'circle(50% at 50% 50%)';
            case 'triangle': return 'polygon(50% 0%, 0% 100%, 100% 100%)';
            case 'star': return 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
            case 'diamond': return 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';
            default: return 'none';
        }
    };

    const IconMap: Record<string, any> = {
        Smile, Heart, Zap, Flame, Cloud, Sun, Moon, Target, Coffee, Star, Square, Circle, MessageSquare, Clipboard, Box: Square
    };

    const IconComp = isIcon ? IconMap[card.iconName || 'Smile'] : null;

    return (
        <div
            className={`canvas-card ${card.type} ${isSelected ? 'selected' : ''}`}
            style={{
                position: 'absolute',
                left: card.position.x,
                top: card.position.y,
                width: width,
                height: height,
                backgroundColor: (isSticky || isShape) ? (card.color || (isSticky ? '#fef08a' : '#e5e7eb')) : 'transparent',
                clipPath: isShape ? getShapePath(card.shapeType) : 'none',
                borderRadius: isSticky ? 4 : 0,
                boxShadow: isSelected
                    ? '0 0 0 2px #3b82f6, 0 8px 16px rgba(0,0,0,0.2)'
                    : showHeatmap && card.votes > 0
                        ? `0 0 0 ${Math.min(10, card.votes * 2)}px rgba(99, 102, 241, 0.3), 0 4px 8px rgba(0,0,0,0.1)`
                        : (isSticky || isShape) ? '0 4px 8px rgba(0,0,0,0.1)' : 'none',
                border: (isText || isIcon || isImage || isFramework) && isSelected ? '1px dashed #3b82f6' : 'none',
                cursor: isDragging ? 'grabbing' : isEditing ? 'text' : 'grab',
                userSelect: 'none',
                transform: isDragging && isSticky ? 'rotate(2deg) scale(1.02)' : 'none',
                transition: isDragging || isResizing ? 'none' : 'box-shadow 0.15s, transform 0.15s, background-color 0.15s',
                zIndex: isSelected ? 100 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: isSelected || isShape ? 'visible' : 'hidden'
            }}
            onMouseDown={handleMouseDown}
            onDoubleClick={handleDoubleClick}
        >
            {isImage && card.imageUrl && (
                <img
                    src={card.imageUrl}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none', borderRadius: 4 }}
                    alt=""
                />
            )}

            {isIcon && IconComp && (
                <IconComp size={Math.min(width, height) * 0.8} color={card.color || '#6366f1'} />
            )}

            {(isSticky || isText || isShape || isFramework) && (
                isEditing ? (
                    <textarea
                        ref={textareaRef}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        style={{
                            width: '100%',
                            height: '100%',
                            padding: isSticky ? 12 : 8,
                            border: 'none',
                            background: 'transparent',
                            resize: 'none',
                            fontSize: fontSize,
                            fontFamily: 'Inter, system-ui, sans-serif',
                            fontWeight: card.fontWeight || ((isText || isFramework) && fontSize > 24 ? 700 : 400),
                            fontStyle: card.fontStyle || 'normal',
                            color: card.textColor || (isSticky ? '#422006' : '#1f2937'),
                            outline: 'none',
                            textAlign: card.textAlign || (isSticky ? 'left' : (fontSize > 24 ? 'center' : 'left')),
                        }}
                    />
                ) : (
                    <div
                        style={{
                            width: '100%',
                            height: '100%',
                            padding: isSticky ? 12 : 8,
                            fontSize: fontSize,
                            fontWeight: card.fontWeight || ((isText || isFramework) && fontSize > 24 ? 700 : 400),
                            fontStyle: card.fontStyle || 'normal',
                            color: card.textColor || (isSticky ? '#422006' : '#1f2937'),
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: isSticky || isShape ? 'center' : (fontSize > 24 || card.textAlign === 'center' ? 'center' : 'flex-start'),
                            justifyContent: isSticky || isShape ? 'center' : (fontSize > 24 || card.textAlign === 'center' ? 'center' : 'flex-start'),
                            textAlign: card.textAlign || (isSticky || isShape ? 'center' : (fontSize > 24 ? 'center' : 'left')),
                        }}
                    >
                        {card.title || (isSticky ? 'Double-click' : isFramework ? card.title : '')}
                    </div>
                )
            )}

            {/* Voting Dots */}
            {((votingSession.active && card.votes > 0) || votingSession.revealed) && (
                <div style={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    display: 'flex',
                    flexWrap: 'wrap-reverse',
                    gap: '2px',
                    justifyContent: 'flex-end',
                    maxWidth: '120px',
                    zIndex: 110,
                    pointerEvents: 'none'
                }}>
                    {votingSession.revealed ? (
                        <div style={{
                            backgroundColor: '#6366f1',
                            color: 'white',
                            borderRadius: '12px',
                            padding: '2px 8px',
                            fontSize: '10px',
                            fontWeight: 700,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}>
                            <Vote size={10} /> {card.votes}
                        </div>
                    ) : (
                        Array.from({ length: card.votes }).map((_, i) => (
                            <div
                                key={i}
                                style={{
                                    width: '12px',
                                    height: '12px',
                                    backgroundColor: '#6366f1',
                                    borderRadius: '50%',
                                    border: '1.5px solid white',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                }}
                            />
                        ))
                    )}
                </div>
            )}

            {/* Formatting Toolbar - only show when selected */}
            {isSelected && !isEditing && (
                <div
                    style={{
                        position: 'absolute',
                        top: -48,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: 'white',
                        borderRadius: 8,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        padding: '4px 8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        zIndex: 100,
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={() => onUpdate(card.id, { fontSize: Math.max(8, fontSize - 2) })}
                        style={{ padding: 4, border: 'none', background: 'none', cursor: 'pointer', borderRadius: 4 }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'none'}
                        title="Decrease text size"
                    >
                        <Minus size={14} />
                    </button>
                    <span style={{ fontSize: 11, fontWeight: 600, minWidth: 24, textAlign: 'center' }}>{fontSize}</span>
                    <button
                        onClick={() => onUpdate(card.id, { fontSize: Math.min(72, fontSize + 2) })}
                        style={{ padding: 4, border: 'none', background: 'none', cursor: 'pointer', borderRadius: 4 }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'none'}
                        title="Increase text size"
                    >
                        <Plus size={14} />
                    </button>
                    <div style={{ width: 1, height: 16, backgroundColor: '#e5e7eb', margin: '0 4px' }} />

                    {/* Color Palette */}
                    {isSticky && STICKY_COLORS.map(c => (
                        <button
                            key={c.value}
                            onClick={() => onUpdate(card.id, { color: c.value })}
                            style={{
                                width: 16,
                                height: 16,
                                borderRadius: '50%',
                                backgroundColor: c.value,
                                border: card.color === c.value ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                                cursor: 'pointer',
                                padding: 0
                            }}
                            title={c.name}
                        />
                    ))}
                    {isSticky && <div style={{ width: 1, height: 16, backgroundColor: '#e5e7eb', margin: '0 4px' }} />}

                    {/* Text Formatting Controls */}
                    {!isSticky && (
                        <>
                            <button
                                onClick={() => onUpdate(card.id, { fontWeight: card.fontWeight === 'bold' ? 'normal' : 'bold' })}
                                style={{ padding: 4, border: 'none', background: card.fontWeight === 'bold' ? '#f3f4f6' : 'none', cursor: 'pointer', borderRadius: 4 }}
                                title="Bold"
                            >
                                <Bold size={14} color={card.fontWeight === 'bold' ? '#3b82f6' : '#6b7280'} />
                            </button>
                            <button
                                onClick={() => onUpdate(card.id, { fontStyle: card.fontStyle === 'italic' ? 'normal' : 'italic' })}
                                style={{ padding: 4, border: 'none', background: card.fontStyle === 'italic' ? '#f3f4f6' : 'none', cursor: 'pointer', borderRadius: 4 }}
                                title="Italic"
                            >
                                <Italic size={14} color={card.fontStyle === 'italic' ? '#3b82f6' : '#6b7280'} />
                            </button>

                            <div style={{ width: 1, height: 16, backgroundColor: '#e5e7eb', margin: '0 4px' }} />

                            <button
                                onClick={() => onUpdate(card.id, { textAlign: 'left' })}
                                style={{ padding: 4, border: 'none', background: card.textAlign === 'left' ? '#f3f4f6' : 'none', cursor: 'pointer', borderRadius: 4 }}
                                title="Align Left"
                            >
                                <AlignLeft size={14} color={card.textAlign === 'left' ? '#3b82f6' : '#6b7280'} />
                            </button>
                            <button
                                onClick={() => onUpdate(card.id, { textAlign: 'center' })}
                                style={{ padding: 4, border: 'none', background: card.textAlign === 'center' ? '#f3f4f6' : 'none', cursor: 'pointer', borderRadius: 4 }}
                                title="Align Center"
                            >
                                <AlignCenter size={14} color={card.textAlign === 'center' ? '#3b82f6' : '#6b7280'} />
                            </button>
                            <button
                                onClick={() => onUpdate(card.id, { textAlign: 'right' })}
                                style={{ padding: 4, border: 'none', background: card.textAlign === 'right' ? '#f3f4f6' : 'none', cursor: 'pointer', borderRadius: 4 }}
                                title="Align Right"
                            >
                                <AlignRight size={14} color={card.textAlign === 'right' ? '#3b82f6' : '#6b7280'} />
                            </button>

                            <div style={{ width: 1, height: 16, backgroundColor: '#e5e7eb', margin: '0 4px' }} />

                            {TEXT_COLORS.map(c => (
                                <button
                                    key={c.value}
                                    onClick={() => onUpdate(card.id, { textColor: c.value })}
                                    style={{
                                        width: 14,
                                        height: 14,
                                        borderRadius: '50%',
                                        backgroundColor: c.value,
                                        border: card.textColor === c.value ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                                        cursor: 'pointer',
                                        padding: 0
                                    }}
                                    title={c.name}
                                />
                            ))}
                            <div style={{ width: 1, height: 16, backgroundColor: '#e5e7eb', margin: '0 4px' }} />
                        </>
                    )}

                    <button
                        onClick={() => onDelete(card.id)}
                        style={{ padding: 4, border: 'none', background: 'none', cursor: 'pointer', borderRadius: 4, color: '#ef4444' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'none'}
                        title="Delete note"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            )}

            {/* Resize handles - only show when selected */}
            {isSelected && !isEditing && (
                <>
                    {/* Corner handles */}
                    <div style={{ ...handleStyles, top: -6, left: -6, cursor: 'nw-resize' }} onMouseDown={(e) => handleResizeStart(e, 'nw')} />
                    <div style={{ ...handleStyles, top: -6, right: -6, cursor: 'ne-resize' }} onMouseDown={(e) => handleResizeStart(e, 'ne')} />
                    <div style={{ ...handleStyles, bottom: -6, left: -6, cursor: 'sw-resize' }} onMouseDown={(e) => handleResizeStart(e, 'sw')} />
                    <div style={{ ...handleStyles, bottom: -6, right: -6, cursor: 'se-resize' }} onMouseDown={(e) => handleResizeStart(e, 'se')} />

                    {/* Edge handles */}
                    <div style={{ ...handleStyles, top: -6, left: '50%', marginLeft: -6, cursor: 'n-resize' }} onMouseDown={(e) => handleResizeStart(e, 'n')} />
                    <div style={{ ...handleStyles, bottom: -6, left: '50%', marginLeft: -6, cursor: 's-resize' }} onMouseDown={(e) => handleResizeStart(e, 's')} />
                    <div style={{ ...handleStyles, left: -6, top: '50%', marginTop: -6, cursor: 'w-resize' }} onMouseDown={(e) => handleResizeStart(e, 'w')} />
                    <div style={{ ...handleStyles, right: -6, top: '50%', marginTop: -6, cursor: 'e-resize' }} onMouseDown={(e) => handleResizeStart(e, 'e')} />
                </>
            )}
        </div>
    );
}
