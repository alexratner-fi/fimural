import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import {
    SmartCard,
    Connector,
    Drawing,
    ThemeContainer,
    Cursor,
    TimelineMonth,
    FeedbackItem,
    Lens,
    UserRole,
    EFFORT_POINTS
} from '../types';

// Initial timeline months (Q1)
const INITIAL_TIMELINE: TimelineMonth[] = [
    { id: 'jan', name: 'January', maxVelocity: 50, currentVelocity: 0 },
    { id: 'feb', name: 'February', maxVelocity: 50, currentVelocity: 0 },
    { id: 'mar', name: 'March', maxVelocity: 50, currentVelocity: 0 },
];

// Sample feedback for inbox
const SAMPLE_FEEDBACK: FeedbackItem[] = [
    { id: '1', text: 'Users are asking for dark mode support in the mobile app', source: 'Slack', timestamp: Date.now() - 3600000 },
    { id: '2', text: 'Enterprise customer requesting SSO integration with Okta', source: 'Salesforce', timestamp: Date.now() - 7200000 },
    { id: '3', text: 'Multiple reports of slow loading times on dashboard page', source: 'Zendesk', timestamp: Date.now() - 10800000 },
    { id: '4', text: 'Feature request: Export data to CSV format', source: 'Email', timestamp: Date.now() - 14400000 },
    { id: '5', text: 'Need ability to set custom notification preferences', source: 'Slack', timestamp: Date.now() - 18000000 },
    { id: '6', text: 'Customers want bulk editing for multiple items', source: 'Intercom', timestamp: Date.now() - 21600000 },
    { id: '7', text: 'Request for API webhooks for real-time updates', source: 'Salesforce', timestamp: Date.now() - 25200000 },
    { id: '8', text: 'Mobile app crashes when uploading large files', source: 'Zendesk', timestamp: Date.now() - 28800000 },
];

interface CanvasStore {
    // Canvas viewport state
    zoom: number;
    pan: { x: number; y: number };

    // Data state
    cards: SmartCard[];
    connectors: Connector[];
    drawings: Drawing[];
    themeContainers: ThemeContainer[];
    cursors: Cursor[];
    timeline: TimelineMonth[];
    feedbackInbox: FeedbackItem[];

    // UI state
    selectedCardIds: string[];
    selectedAreaIds: string[];
    activeTool: 'select' | 'draw' | 'shape' | 'connector';
    currentLens: Lens;
    currentUserRole: UserRole;
    theme: 'light' | 'dark';
    sidebarOpen: boolean;
    // Voting state
    votingSession: {
        active: boolean;
        name: string;
        votesPerPerson: number;
        revealed: boolean;
    };
    votingDotsRemaining: number;
    showHeatmap: boolean;
    aiAnalysis: {
        lastSummary: string | null;
        isAnalyzing: boolean;
        lastReport: string | null;
    };

    // Modal state
    editingCardId: string | null;

    // Drawing state
    isDrawing: boolean;
    currentDrawing: { x: number; y: number }[];
    drawingColor: string;
    drawingWidth: number;

    // Connector drawing state
    connectingFromCardId: string | null;

    // Actions - Viewport
    setZoom: (zoom: number) => void;
    setPan: (pan: { x: number; y: number }) => void;

    // Actions - Cards
    addCard: (card: Partial<SmartCard>) => SmartCard;
    updateCard: (id: string, updates: Partial<SmartCard>) => void;
    deleteCard: (id: string) => void;
    moveCard: (id: string, position: { x: number; y: number }) => void;
    selectCard: (id: string, addToSelection?: boolean) => void;
    selectMultipleCards: (ids: string[]) => void;
    clearSelection: () => void;

    // Actions - Connectors
    addConnector: (fromCardId: string, toCardId: string, isBlocker?: boolean) => void;
    removeConnector: (id: string) => void;

    // Actions - Drawings
    startDrawing: (point: { x: number; y: number }) => void;
    continueDrawing: (point: { x: number; y: number }) => void;
    endDrawing: () => void;

    // Actions - Theme Containers
    createThemeContainer: (cardIds: string[], label: string) => void;
    updateThemeContainer: (id: string, updates: Partial<ThemeContainer>) => void;
    removeThemeContainer: (id: string) => void;
    moveThemeContainer: (id: string, position: { x: number; y: number }) => void;
    selectArea: (id: string, addToSelection?: boolean) => void;
    organizeArea: (id: string) => void;
    toggleAreaLock: (id: string) => void;

    // Actions - Timeline
    assignCardToMonth: (cardId: string, monthId: string | null) => void;
    setMonthMaxVelocity: (monthId: string, maxVelocity: number) => void;

    // Actions - Feedback Inbox
    removeFeedback: (id: string) => void;
    createCardFromFeedback: (feedbackId: string, position: { x: number; y: number }) => void;

    // Actions - Voting
    startVoting: (name: string, votesLimit: number) => void;
    endVoting: () => void;
    placeVote: (cardId: string, remove?: boolean) => void;
    revealVotes: () => void;

    // Actions - UI
    setActiveTool: (tool: 'select' | 'draw' | 'shape' | 'connector') => void;
    setCurrentLens: (lens: Lens) => void;
    setCurrentUserRole: (role: UserRole) => void;
    toggleTheme: () => void;
    toggleSidebar: () => void;
    setEditingCard: (id: string | null) => void;
    setConnectingFrom: (cardId: string | null) => void;
    setDrawingColor: (color: string) => void;
    setDrawingWidth: (width: number) => void;

    // Actions - Cursors (simulated multiplayer)
    updateCursor: (cursor: Cursor) => void;
    removeCursor: (id: string) => void;

    // Computed helpers
    getCardById: (id: string) => SmartCard | undefined;
    getConnectorsForCard: (cardId: string) => Connector[];
    getMonthVelocity: (monthId: string) => number;
    isBlockerViolation: (connector: Connector) => boolean;
    setAIAnalysis: (updates: Partial<CanvasStore['aiAnalysis']>) => void;
}

export const useCanvasStore = create<CanvasStore>((set, get) => ({
    // Initial state
    zoom: 1,
    pan: { x: 0, y: 0 },
    cards: [],
    connectors: [],
    drawings: [],
    themeContainers: [],
    cursors: [],
    timeline: INITIAL_TIMELINE,
    feedbackInbox: SAMPLE_FEEDBACK,
    selectedCardIds: [],
    selectedAreaIds: [],
    activeTool: 'select',
    currentLens: 'default',
    currentUserRole: 'pm',
    theme: 'light',
    sidebarOpen: true,
    aiAnalysis: {
        lastSummary: null,
        isAnalyzing: false,
        lastReport: null,
    },
    votingSession: {
        active: false,
        name: 'Voting Session',
        votesPerPerson: 5,
        revealed: false,
    },
    votingDotsRemaining: 5,
    showHeatmap: false,
    editingCardId: null,
    isDrawing: false,
    currentDrawing: [],
    drawingColor: '#6366f1',
    drawingWidth: 2,
    connectingFromCardId: null,

    // Viewport actions
    setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(3, zoom)) }),
    setPan: (pan) => set({ pan }),

    // Card actions
    addCard: (cardData) => {
        const currentLens = get().currentLens;
        const newCard: SmartCard = {
            id: uuidv4(),
            type: cardData.type || 'sticky',
            shapeType: cardData.shapeType,
            iconName: cardData.iconName,
            imageUrl: cardData.imageUrl,
            board: cardData.board || currentLens,  // Assign to current board/team
            position: cardData.position || { x: 100, y: 100 },
            width: cardData.width || 150,
            height: cardData.height || 100,
            fontSize: cardData.fontSize || 14,
            color: cardData.color || (cardData.type === 'text' || cardData.type === 'image' || cardData.type === 'icon' ? 'transparent' : '#fef08a'),
            textAlign: cardData.textAlign || 'left',
            fontWeight: cardData.fontWeight || (cardData.type === 'text' && (cardData.fontSize || 14) > 24 ? 'bold' : 'normal'),
            fontStyle: cardData.fontStyle || 'normal',
            textColor: cardData.textColor || (cardData.type === 'sticky' ? '#422006' : '#1f2937'),
            title: cardData.title || (cardData.type === 'text' ? 'Type here...' : cardData.type === 'sticky' ? 'New Sticky' : ''),
            description: cardData.description || '',
            status: cardData.status || 'draft',
            source: cardData.source || '',
            effort: cardData.effort || null,
            rice: cardData.rice || { reach: 5, impact: 5, confidence: 5, effort: 5 },
            attachments: cardData.attachments || [],
            blockedBy: cardData.blockedBy || [],
            timelineMonth: cardData.timelineMonth || null,
            votes: 0,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        set((state) => ({ cards: [...state.cards, newCard] }));
        return newCard;
    },

    updateCard: (id, updates) => {
        set((state) => ({
            cards: state.cards.map((card) =>
                card.id === id ? { ...card, ...updates, updatedAt: Date.now() } : card
            ),
        }));
        // Recalculate timeline velocities if effort changed
        if (updates.effort !== undefined || updates.timelineMonth !== undefined) {
            const card = get().cards.find(c => c.id === id);
            if (card?.timelineMonth) {
                get().assignCardToMonth(id, card.timelineMonth);
            }
        }
    },

    deleteCard: (id) => {
        set((state) => ({
            cards: state.cards.filter((card) => card.id !== id),
            connectors: state.connectors.filter(
                (c) => c.fromCardId !== id && c.toCardId !== id
            ),
            selectedCardIds: state.selectedCardIds.filter((cid) => cid !== id),
        }));
    },

    moveCard: (id, position) => {
        set((state) => ({
            cards: state.cards.map((card) =>
                card.id === id ? { ...card, position } : card
            ),
        }));
    },

    selectCard: (id, addToSelection = false) => {
        set((state) => ({
            selectedCardIds: addToSelection
                ? state.selectedCardIds.includes(id)
                    ? state.selectedCardIds.filter((cid) => cid !== id)
                    : [...state.selectedCardIds, id]
                : [id],
        }));
    },

    selectMultipleCards: (ids: string[]) => set({ selectedCardIds: ids }),

    clearSelection: () => set({ selectedCardIds: [], selectedAreaIds: [] }),

    // Connector actions
    addConnector: (fromCardId, toCardId, isBlocker = false) => {
        const newConnector: Connector = {
            id: uuidv4(),
            fromCardId,
            toCardId,
            isBlocker,
        };
        set((state) => {
            // Update blockedBy on the target card
            const updatedCards = isBlocker
                ? state.cards.map((card) =>
                    card.id === toCardId
                        ? { ...card, blockedBy: [...card.blockedBy, fromCardId] }
                        : card
                )
                : state.cards;
            return {
                connectors: [...state.connectors, newConnector],
                cards: updatedCards,
            };
        });
    },

    removeConnector: (id) => {
        const connector = get().connectors.find((c) => c.id === id);
        set((state) => {
            const updatedCards = connector?.isBlocker
                ? state.cards.map((card) =>
                    card.id === connector.toCardId
                        ? { ...card, blockedBy: card.blockedBy.filter((bid) => bid !== connector.fromCardId) }
                        : card
                )
                : state.cards;
            return {
                connectors: state.connectors.filter((c) => c.id !== id),
                cards: updatedCards,
            };
        });
    },

    // Drawing actions
    startDrawing: (point) => {
        set({ isDrawing: true, currentDrawing: [point] });
    },

    continueDrawing: (point) => {
        set((state) => ({
            currentDrawing: [...state.currentDrawing, point],
        }));
    },

    endDrawing: () => {
        const { currentDrawing, drawingColor, drawingWidth } = get();
        if (currentDrawing.length > 1) {
            const newDrawing: Drawing = {
                id: uuidv4(),
                points: currentDrawing,
                color: drawingColor,
                width: drawingWidth,
            };
            set((state) => ({
                drawings: [...state.drawings, newDrawing],
                isDrawing: false,
                currentDrawing: [],
            }));
        } else {
            set({ isDrawing: false, currentDrawing: [] });
        }
    },

    // Theme Container actions
    createThemeContainer: (cardIds, label) => {
        const cards = get().cards.filter((c) => cardIds.includes(c.id));
        if (cards.length < 2) return;

        const xs = cards.map((c) => c.position.x);
        const ys = cards.map((c) => c.position.y);
        const padding = 20;
        const cardWidth = 240;
        const cardHeight = 120;

        const bounds = {
            x: Math.min(...xs) - padding,
            y: Math.min(...ys) - padding,
            width: Math.max(...xs) - Math.min(...xs) + cardWidth + padding * 2,
            height: Math.max(...ys) - Math.min(...ys) + cardHeight + padding * 2,
        };

        const newContainer: ThemeContainer = {
            id: uuidv4(),
            board: get().currentLens,
            label,
            cardIds,
            bounds,
            color: '#6366f1',
        };

        set((state) => ({
            themeContainers: [...state.themeContainers, newContainer],
        }));
    },

    removeThemeContainer: (id) => {
        set((state) => ({
            themeContainers: state.themeContainers.filter((tc) => tc.id !== id),
            selectedAreaIds: state.selectedAreaIds.filter((aid) => aid !== id),
        }));
    },

    updateThemeContainer: (id, updates) => {
        set((state) => ({
            themeContainers: state.themeContainers.map((tc) =>
                tc.id === id ? { ...tc, ...updates } : tc
            ),
        }));
    },

    selectArea: (id: string, addToSelection = false) => {
        set((state) => {
            if (addToSelection) {
                return {
                    selectedAreaIds: state.selectedAreaIds.includes(id)
                        ? state.selectedAreaIds
                        : [...state.selectedAreaIds, id],
                    selectedCardIds: state.selectedCardIds, // Keep card selection
                };
            }
            return {
                selectedAreaIds: [id],
                selectedCardIds: [], // Clear card selection when selecting an area alone
            };
        });
    },

    moveThemeContainer: (id, position) => {
        set((state) => ({
            themeContainers: state.themeContainers.map((tc) =>
                tc.id === id ? { ...tc, bounds: { ...tc.bounds, x: position.x, y: position.y } } : tc
            ),
        }));
    },

    organizeArea: (id) => {
        const state = get();
        const area = state.themeContainers.find(tc => tc.id === id);
        if (!area) return;

        const cardsInArea = state.cards.filter(card =>
            card.position.x >= area.bounds.x &&
            card.position.x <= area.bounds.x + area.bounds.width &&
            card.position.y >= area.bounds.y &&
            card.position.y <= area.bounds.y + area.bounds.height
        );

        if (cardsInArea.length === 0) return;

        const padding = 20;
        const startX = area.bounds.x + padding;
        const startY = area.bounds.y + 40; // Space for label
        const spacing = 10;
        const cardWidth = 150;
        const cardHeight = 100;

        const cols = Math.floor((area.bounds.width - padding * 2) / (cardWidth + spacing));

        set((state) => ({
            cards: state.cards.map(card => {
                const index = cardsInArea.findIndex(c => c.id === card.id);
                if (index !== -1) {
                    const row = Math.floor(index / cols);
                    const col = index % cols;
                    return {
                        ...card,
                        position: {
                            x: startX + col * (cardWidth + spacing),
                            y: startY + row * (cardHeight + spacing)
                        }
                    };
                }
                return card;
            })
        }));
    },

    toggleAreaLock: (id) => {
        set((state) => ({
            themeContainers: state.themeContainers.map(tc =>
                tc.id === id ? { ...tc, isLocked: !tc.isLocked } : tc
            )
        }));
    },

    // Timeline actions
    assignCardToMonth: (cardId, monthId) => {
        const cards = get().cards;
        const card = cards.find((c) => c.id === cardId);
        if (!card) return;

        // Update card month assignment
        set((state) => {
            const updatedCards = state.cards.map((c) =>
                c.id === cardId ? { ...c, timelineMonth: monthId } : c
            );

            // Recalculate all timeline velocities
            const updatedTimeline = state.timeline.map((month) => {
                const monthCards = updatedCards.filter((c) => c.timelineMonth === month.id);
                const velocity = monthCards.reduce((sum, c) => {
                    return sum + (c.effort ? EFFORT_POINTS[c.effort] : 0);
                }, 0);
                return { ...month, currentVelocity: velocity };
            });

            return { cards: updatedCards, timeline: updatedTimeline };
        });
    },

    setMonthMaxVelocity: (monthId, maxVelocity) => {
        set((state) => ({
            timeline: state.timeline.map((month) =>
                month.id === monthId ? { ...month, maxVelocity } : month
            ),
        }));
    },

    // Feedback Inbox actions
    removeFeedback: (id) => {
        set((state) => ({
            feedbackInbox: state.feedbackInbox.filter((f) => f.id !== id),
        }));
    },

    createCardFromFeedback: (feedbackId, position) => {
        const feedback = get().feedbackInbox.find((f) => f.id === feedbackId);
        if (!feedback) return;

        get().addCard({
            position,
            title: feedback.text.slice(0, 50) + (feedback.text.length > 50 ? '...' : ''),
            description: feedback.text,
            source: feedback.source,
            status: 'draft',
        });

        get().removeFeedback(feedbackId);
    },

    // Voting actions
    startVoting: (name, votesLimit) => {
        set({
            votingSession: {
                active: true,
                name: name || 'Voting Session',
                votesPerPerson: votesLimit,
                revealed: false,
            },
            votingDotsRemaining: votesLimit,
            showHeatmap: false,
        });
        // Reset all votes
        set((state) => ({
            cards: state.cards.map((card) => ({ ...card, votes: 0 })),
        }));
    },

    endVoting: () => {
        set((state) => ({
            votingSession: {
                ...state.votingSession,
                active: false,
            }
        }));
    },

    placeVote: (cardId, remove = false) => {
        const { votingDotsRemaining, votingSession } = get();
        if (!votingSession.active) return;
        if (!remove && votingDotsRemaining <= 0) return;

        set((state) => ({
            cards: state.cards.map((card) =>
                card.id === cardId
                    ? { ...card, votes: remove ? Math.max(0, card.votes - 1) : card.votes + 1 }
                    : card
            ),
            votingDotsRemaining: remove ? state.votingDotsRemaining + 1 : state.votingDotsRemaining - 1,
        }));
    },

    revealVotes: () => {
        set((state) => ({
            votingSession: {
                ...state.votingSession,
                revealed: true,
            },
            showHeatmap: true
        }));
    },

    // UI actions
    setActiveTool: (tool) => set({ activeTool: tool, connectingFromCardId: null }),
    setCurrentLens: (lens) => set({ currentLens: lens }),
    setCurrentUserRole: (role) => set({ currentUserRole: role }),

    toggleTheme: () => {
        set((state) => {
            const newTheme = state.theme === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            return { theme: newTheme };
        });
    },

    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setEditingCard: (id) => set({ editingCardId: id }),
    setConnectingFrom: (cardId) => set({ connectingFromCardId: cardId }),
    setDrawingColor: (color) => set({ drawingColor: color }),
    setDrawingWidth: (width) => set({ drawingWidth: width }),

    // Cursor actions
    updateCursor: (cursor) => {
        set((state) => {
            const existing = state.cursors.findIndex((c) => c.id === cursor.id);
            if (existing >= 0) {
                const updated = [...state.cursors];
                updated[existing] = cursor;
                return { cursors: updated };
            }
            return { cursors: [...state.cursors, cursor] };
        });
    },

    removeCursor: (id) => {
        set((state) => ({
            cursors: state.cursors.filter((c) => c.id !== id),
        }));
    },

    // Computed helpers
    getCardById: (id) => get().cards.find((c) => c.id === id),

    getConnectorsForCard: (cardId) =>
        get().connectors.filter(
            (c) => c.fromCardId === cardId || c.toCardId === cardId
        ),

    getMonthVelocity: (monthId) => {
        const month = get().timeline.find((m) => m.id === monthId);
        return month?.currentVelocity || 0;
    },

    isBlockerViolation: (connector) => {
        if (!connector.isBlocker) return false;

        const cards = get().cards;
        const fromCard = cards.find((c) => c.id === connector.fromCardId);
        const toCard = cards.find((c) => c.id === connector.toCardId);

        if (!fromCard?.timelineMonth || !toCard?.timelineMonth) return false;

        const timeline = get().timeline;
        const fromIndex = timeline.findIndex((m) => m.id === fromCard.timelineMonth);
        const toIndex = timeline.findIndex((m) => m.id === toCard.timelineMonth);

        // Violation if dependent card is scheduled before or same as blocker
        return toIndex <= fromIndex;
    },

    setAIAnalysis: (updates) => {
        set((state) => ({
            aiAnalysis: { ...state.aiAnalysis, ...updates }
        }));
    },
}));

// Initialize theme on load
if (typeof window !== 'undefined') {
    document.documentElement.setAttribute('data-theme', 'light');
}
