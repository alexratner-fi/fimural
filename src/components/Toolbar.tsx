import React from 'react';
import { useCanvasStore } from '../store/canvasStore';
import {
    MousePointer2,
    Pencil,
    Square,
    ArrowUpRight,
    Sun,
    Moon,
    Vote,
    PanelLeftClose,
    PanelLeft,
    Eye,
    Code2,
    BarChart3,
    Palette,
    Plus,
    Type,
    Sparkles,
    Share2,
    FileText,
    Slack,
    X,
    Grid3X3
} from 'lucide-react';
import { Lens } from '../types';
import { getShareLink } from '../store/collaboration';

import { v4 as uuidv4 } from 'uuid';

export function Toolbar() {
    const {
        activeTool,
        setActiveTool,
        theme,
        toggleTheme,
        currentLens,
        setCurrentLens,
        sidebarOpen,
        toggleSidebar,
        votingSession,
        votingDotsRemaining,
        startVoting,
        endVoting,
        revealVotes,
        addCard,
        setEditingCard
    } = useCanvasStore();

    const [aiAssistantOpen, setAiAssistantOpen] = React.useState(false);

    const tools = [
        { id: 'select' as const, icon: MousePointer2, label: 'Select' },
        { id: 'draw' as const, icon: Pencil, label: 'Draw' },
        { id: 'shape' as const, icon: Square, label: 'Shape' },
        { id: 'connector' as const, icon: ArrowUpRight, label: 'Connector' },
    ];

    const lenses: { id: Lens; icon: React.ElementType; label: string }[] = [
        { id: 'default', icon: Eye, label: 'Default' },
        { id: 'engineering', icon: Code2, label: 'Engineering' },
        { id: 'data', icon: BarChart3, label: 'Data' },
        { id: 'design', icon: Palette, label: 'Design' },
    ];

    // Add a new sticky note at center of viewport
    const handleAddSticky = () => {
        const newCard = addCard({
            type: 'sticky',
            position: { x: 400, y: 300 },
            title: 'New Sticky',
        });
        setEditingCard(newCard.id);
    };

    const handleAddText = () => {
        const newCard = addCard({
            type: 'text',
            position: { x: 400, y: 300 },
            title: 'Text Box',
            fontSize: 16,
            width: 200,
            height: 80
        });
        setEditingCard(newCard.id);
    };

    return (
        <header className="toolbar">
            <div className="toolbar-section">
                {/* Logo */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginRight: '8px'
                }}>
                    <div style={{
                        width: '28px',
                        height: '28px',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <span style={{ color: 'white', fontWeight: 700, fontSize: '12px' }}>Fi</span>
                    </div>
                    <span style={{
                        fontWeight: 600,
                        fontSize: '16px',
                        color: 'var(--color-text-primary)'
                    }}>FiMural</span>
                </div>

                <div className="toolbar-divider" />

                {/* Sidebar Toggle */}
                <button
                    className="tool-button"
                    onClick={toggleSidebar}
                    title={sidebarOpen ? 'Hide Inbox' : 'Show Inbox'}
                >
                    {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
                </button>

                <div className="toolbar-divider" />

                {/* Add Sticky Button */}
                <button
                    className="btn btn-primary"
                    onClick={handleAddSticky}
                    style={{
                        padding: '6px 12px',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}
                    title="Add Sticky Note"
                >
                    <Plus size={14} />
                    Add Sticky
                </button>

                <button
                    className="btn btn-secondary"
                    onClick={handleAddText}
                    style={{
                        padding: '6px 12px',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        marginLeft: '8px'
                    }}
                    title="Add Text Box"
                >
                    <Type size={14} />
                    Text
                </button>

                <div className="toolbar-divider" />

                <button
                    className="tool-button"
                    onClick={() => {
                        const link = getShareLink();
                        navigator.clipboard.writeText(link);
                        alert('Collaboration link copied to clipboard!');
                    }}
                    title="Share Board"
                >
                    <Share2 size={18} />
                </button>

                <div className="toolbar-divider" />

                <button
                    className={`tool-button ${aiAssistantOpen ? 'active' : ''}`}
                    onClick={() => setAiAssistantOpen(!aiAssistantOpen)}
                    style={{ color: '#8b5cf6' }}
                    title="AI Insights Assistant"
                >
                    <Sparkles size={18} />
                </button>

                <div className="toolbar-divider" />

                {/* Tool Selection */}
                {tools.map((tool) => (
                    <button
                        key={tool.id}
                        className={`tool-button ${activeTool === tool.id ? 'active' : ''}`}
                        onClick={() => setActiveTool(tool.id)}
                        title={tool.label}
                    >
                        <tool.icon size={18} />
                    </button>
                ))}
            </div>

            <div className="toolbar-section">
                {/* Lens Toggle */}
                <div className="lens-toggle">
                    {lenses.map((lens) => (
                        <button
                            key={lens.id}
                            className={`lens-option ${currentLens === lens.id ? 'active' : ''}`}
                            onClick={() => setCurrentLens(lens.id)}
                            title={`${lens.label} Lens`}
                        >
                            <lens.icon size={14} style={{ marginRight: '4px' }} />
                            {lens.label}
                        </button>
                    ))}
                </div>

                <div className="toolbar-divider" />

                {!votingSession.active ? (
                    <button
                        className="tool-button"
                        onClick={() => startVoting('Standard Session', 5)}
                        title="Start Voting"
                    >
                        <Vote size={18} />
                    </button>
                ) : (
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <div style={{ fontSize: '11px', color: '#6366f1', fontWeight: 600, marginRight: '8px' }}>
                            {votingDotsRemaining} votes left
                        </div>
                        {!votingSession.revealed ? (
                            <button
                                className="btn btn-primary"
                                onClick={revealVotes}
                                style={{ padding: '6px 12px', fontSize: '12px' }}
                            >
                                Reveal
                            </button>
                        ) : (
                            <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 600, marginRight: '8px' }}>
                                Results Revealed
                            </div>
                        )}
                        <button
                            className="btn btn-secondary"
                            onClick={endVoting}
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                            End
                        </button>
                    </div>
                )}

                <div className="toolbar-divider" />

                {/* Theme Toggle */}
                <button
                    className="theme-toggle"
                    onClick={toggleTheme}
                    title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                >
                    {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                </button>
            </div>

            {/* AI Insights Assistant - Overlay Panel */}
            <AIInsightsAssistant
                isOpen={aiAssistantOpen}
                onClose={() => setAiAssistantOpen(false)}
            />
        </header>
    );
}

function AIInsightsAssistant({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { cards, themeContainers, currentLens, aiAnalysis, setAIAnalysis } = useCanvasStore();
    const boardCards = cards.filter(c => c.board === currentLens);
    const boardAreas = themeContainers.filter(a => a.board === currentLens);

    const autoCluster = () => {
        setAIAnalysis({ isAnalyzing: true });

        setTimeout(() => {
            // Find cards not in any area or group them 
            const unorganizedCards = boardCards.slice(0, 6); // Just take a few for demo
            if (unorganizedCards.length < 2) {
                setAIAnalysis({ isAnalyzing: false });
                return;
            }

            const newAreaId = uuidv4();
            const xs = unorganizedCards.map(c => c.position.x);
            const ys = unorganizedCards.map(c => c.position.y);

            const newArea = {
                id: newAreaId,
                board: currentLens,
                label: '💡 AI Group: ' + (unorganizedCards[0].title.split(' ')[0] || 'New Theme'),
                cardIds: unorganizedCards.map(c => c.id),
                bounds: {
                    x: Math.min(...xs) - 40,
                    y: Math.min(...ys) - 60,
                    width: Math.max(...xs) - Math.min(...xs) + 200,
                    height: Math.max(...ys) - Math.min(...ys) + 160
                },
                color: '#8b5cf6'
            };

            useCanvasStore.setState(state => ({
                themeContainers: [...state.themeContainers, newArea]
            }));

            setAIAnalysis({ isAnalyzing: false, lastSummary: 'I\'ve automatically grouped similar ideas into a new "AI Group" area for you!' });
        }, 1200);
    };

    const generateSummary = () => {
        setAIAnalysis({ isAnalyzing: true });

        // Simulation of AI processing
        setTimeout(() => {
            const themes = boardAreas.map(a => a.label).join(', ') || 'General Ideas';
            const topIdeas = boardCards
                .sort((a, b) => (b.votes || 0) - (a.votes || 0))
                .slice(0, 3)
                .map(c => c.title)
                .join('\n• ');

            const summary = `### 🚀 Board Strategy: ${currentLens.toUpperCase()}\n\n` +
                `**Main Themes:** ${themes}\n\n` +
                `**Top Voted Priorities:**\n• ${topIdeas}\n\n` +
                `**PM Insight:** Based on the current layout, the team is heavily focused on ${boardAreas[0]?.label || 'core features'}. Recommend aligning on timeline for ${boardCards[0]?.title || 'the main initiative'}.`;

            setAIAnalysis({ lastSummary: summary, isAnalyzing: false });
        }, 1500);
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 60,
            right: 20,
            width: 360,
            maxHeight: 'calc(100vh - 100px)',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(12px)',
            borderRadius: 16,
            boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
        }}>
            {/* Header */}
            <div style={{
                padding: '16px 20px',
                background: 'linear-gradient(135deg, #6366f1, #8978ff)',
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Sparkles size={18} />
                    <span style={{ fontWeight: 600 }}>AI PM Assistant</span>
                </div>
                <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                    <X size={18} />
                </button>
            </div>

            {/* Content */}
            <div style={{ padding: 20, overflowY: 'auto', flex: 1 }}>
                {!aiAnalysis.lastSummary && !aiAnalysis.isAnalyzing ? (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div style={{ fontSize: 32, marginBottom: 16 }}>🧠</div>
                        <h4 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>Synthesize Board</h4>
                        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>
                            I'll analyze all sticky notes, areas, and votes to generate a strategy summary.
                        </p>
                        <button
                            className="btn btn-primary"
                            onClick={generateSummary}
                            style={{ width: '100%', borderRadius: 8, marginBottom: 10 }}
                        >
                            Generate Insight
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={autoCluster}
                            style={{ width: '100%', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}
                        >
                            <Grid3X3 size={14} /> Smart Cluster
                        </button>
                    </div>
                ) : aiAnalysis.isAnalyzing ? (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <div className="spinning" style={{ fontSize: 24, marginBottom: 12 }}>✨</div>
                        <span style={{ fontSize: 14, color: '#6366f1', fontWeight: 500 }}>Analyzing board patterns...</span>
                    </div>
                ) : (
                    <div className="ai-result">
                        <div style={{
                            fontSize: 13,
                            color: '#374151',
                            lineHeight: 1.6,
                            whiteSpace: 'pre-wrap',
                            backgroundColor: '#f8fafc',
                            padding: 16,
                            borderRadius: 12,
                            border: '1px solid #e2e8f0',
                            marginBottom: 20
                        }}>
                            {aiAnalysis.lastSummary}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            <button className="btn btn-secondary" style={{ fontSize: 12, padding: '8px', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                                <Slack size={14} /> Send to Slack
                            </button>
                            <button className="btn btn-secondary" style={{ fontSize: 12, padding: '8px', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                                <FileText size={14} /> Draft PRD
                            </button>
                            <button className="btn btn-secondary" style={{ fontSize: 12, padding: '8px', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', gridColumn: 'span 2' }}>
                                <Share2 size={14} /> Share Exec Report
                            </button>
                        </div>

                        <button
                            onClick={generateSummary}
                            style={{
                                marginTop: 16,
                                width: '100%',
                                background: 'none',
                                border: 'none',
                                color: '#6366f1',
                                fontSize: 12,
                                cursor: 'pointer',
                                textDecoration: 'underline'
                            }}
                        >
                            Regenerate Analysis
                        </button>
                    </div>
                )}
            </div>

            <div style={{ padding: '12px 20px', backgroundColor: '#f1f5f9', fontSize: 11, color: '#64748b', textAlign: 'center' }}>
                AI tools tailored for Product Managers • FiMural AI v1.0
            </div>
        </div>
    );
}
