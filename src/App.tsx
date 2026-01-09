import React from 'react';
import { Canvas } from './components/Canvas';
import { Toolbar } from './components/Toolbar';
import { FeedbackInbox } from './components/FeedbackInbox';
import { VotingOverlay } from './components/VotingOverlay';
import { Minimap } from './components/Minimap';
import { Sidebar } from './components/Sidebar';
import { useCanvasStore } from './store/canvasStore';
import { syncToYjs, updateLocalCursor } from './store/collaboration';
import { RemoteCursors } from './components/RemoteCursors';
import './styles/index.css';

export default function App() {
    const { votingSession } = useCanvasStore();

    // Sync store to Yjs on any change
    React.useEffect(() => {
        const unsubscribe = useCanvasStore.subscribe((state) => {
            syncToYjs(state);
        });
        return unsubscribe;
    }, []);

    // Track local cursor for multiplayer
    React.useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            updateLocalCursor(
                { x: e.clientX, y: e.clientY },
                { name: 'You', color: '#6366f1' }
            );
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Main application layout with sidebar, canvas, and overlays
    return (
        <div className="app-container">
            <Toolbar />
            <div className="main-layout" style={{ display: 'flex', flexDirection: 'row' }}>
                <Sidebar />
                <FeedbackInbox />
                <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
                    <Canvas />
                    <RemoteCursors />
                </div>
                <Minimap />
            </div>
            {votingSession.active && <VotingOverlay />}
        </div>
    );
}
