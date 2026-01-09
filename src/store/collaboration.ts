import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { IndexeddbPersistence } from 'y-indexeddb';
import { useCanvasStore } from './canvasStore';

// Initialize Yjs doc
const ydoc = new Y.Doc();

// Room ID from URL or default
const roomName = new URLSearchParams(window.location.search).get('room') || 'fimural-room-default';

// 1. Local Persistence (so the board saves when you close the tab)
new IndexeddbPersistence(roomName, ydoc);

// 2. Connectivity (so you connect to users on other computers)
const provider = new WebrtcProvider(roomName, ydoc, {
    // These signaling servers help different computers find each other
    signaling: [
        'wss://y-webrtc-signaling-eu.herokuapp.com',
        'wss://y-webrtc-signaling-us.herokuapp.com'
    ].concat(window.location.hostname === 'localhost' ? ['ws://localhost:4444'] : [])
});

// Shared maps
const sharedCards = ydoc.getMap('cards');
const sharedAreas = ydoc.getMap('areas');
const awareness = provider.awareness;

// Sync from Yjs to Zustand
sharedCards.observe(() => {
    const cards = Array.from(sharedCards.values()) as any[];
    useCanvasStore.setState({ cards });
});

sharedAreas.observe(() => {
    const themeContainers = Array.from(sharedAreas.values()) as any[];
    useCanvasStore.setState({ themeContainers });
});

// Middleware for Zustand to sync to Yjs
export const syncToYjs = (state: any) => {
    // Only sync if they actually changed (avoid infinite loops)
    // In a production app we would do deep comparison or use a transaction

    // Sync cards
    state.cards?.forEach((card: any) => {
        if (JSON.stringify(sharedCards.get(card.id)) !== JSON.stringify(card)) {
            sharedCards.set(card.id, card);
        }
    });

    // Sync areas
    state.themeContainers?.forEach((area: any) => {
        if (JSON.stringify(sharedAreas.get(area.id)) !== JSON.stringify(area)) {
            sharedAreas.set(area.id, area);
        }
    });
};

// Awareness (Cursors)
awareness.on('change', () => {
    const states = Array.from(awareness.getStates().entries());
    const cursors = states
        .filter(([id, state]) => id !== awareness.clientID && state.user && state.cursor)
        .map(([id, state]: any) => ({
            id: id.toString(),
            name: state.user.name,
            color: state.user.color,
            position: state.cursor
        }));

    useCanvasStore.setState({ cursors });
});

export const updateLocalCursor = (position: { x: number; y: number }, user: { name: string, color: string }) => {
    awareness.setLocalStateField('cursor', position);
    awareness.setLocalStateField('user', user);
};

export const getShareLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('room', roomName);
    return url.toString();
};
