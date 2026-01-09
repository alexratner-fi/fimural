import { useState } from 'react';
import { useCanvasStore } from '../store/canvasStore';
import {
    StickyNote,
    Type,
    Square,
    ArrowUpRight,
    Smile,
    Image as ImageIcon,
    Layout,
    Pencil,
    Search,
    Circle,
    Triangle,
    Star,
    Diamond,
    Heart,
    Zap,
    Flame,
    Cloud,
    Sun,
    Moon,
    Target,
    Coffee,
    MessageSquare,
    Clipboard
} from 'lucide-react';

type SidebarCategory = 'sticky' | 'text' | 'shape' | 'connector' | 'icon' | 'image' | 'framework' | 'draw' | null;

export function Sidebar() {
    const [activeCategory, setActiveCategory] = useState<SidebarCategory>(null);
    const { addCard, setActiveTool, setEditingCard } = useCanvasStore();

    const categories = [
        { id: 'sticky' as const, icon: StickyNote, label: 'Sticky notes' },
        { id: 'text' as const, icon: Type, label: 'Text' },
        { id: 'shape' as const, icon: Square, label: 'Shapes' },
        { id: 'connector' as const, icon: ArrowUpRight, label: 'Connectors' },
        { id: 'icon' as const, icon: Smile, label: 'Icons' },
        { id: 'framework' as const, icon: Layout, label: 'Frameworks' },
        { id: 'image' as const, icon: ImageIcon, label: 'Images' },
        { id: 'draw' as const, icon: Pencil, label: 'Draw' },
    ];

    const handleAddElement = (type: any, extra: any = {}) => {
        const newCard = addCard({
            type,
            position: { x: window.innerWidth / 2 - 100, y: window.innerHeight / 2 - 50 },
            ...extra
        });
        if (type === 'sticky' || type === 'text') {
            setEditingCard(newCard.id);
        }
        setActiveCategory(null);
    };

    return (
        <div style={{ display: 'flex', height: '100%', pointerEvents: 'auto' }}>
            {/* Primary Sidebar */}
            <div style={{
                width: 60,
                backgroundColor: 'white',
                borderRight: '1px solid #e5e7eb',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '12px 0',
                gap: 8,
                zIndex: 100,
                boxShadow: '2px 0 8px rgba(0,0,0,0.05)'
            }}>
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => {
                            if (cat.id === 'draw' || cat.id === 'connector') {
                                setActiveTool(cat.id as any);
                                setActiveCategory(null);
                            } else {
                                setActiveCategory(activeCategory === cat.id ? null : cat.id);
                            }
                        }}
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 8,
                            border: 'none',
                            backgroundColor: activeCategory === cat.id ? '#f3f4f6' : 'transparent',
                            color: activeCategory === cat.id ? '#6366f1' : '#6b7280',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s',
                            position: 'relative'
                        }}
                        title={cat.label}
                        onMouseEnter={(e) => {
                            if (activeCategory !== cat.id) e.currentTarget.style.backgroundColor = '#f9fafb';
                        }}
                        onMouseLeave={(e) => {
                            if (activeCategory !== cat.id) e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                    >
                        <cat.icon size={20} />
                        {activeCategory === cat.id && (
                            <div style={{
                                position: 'absolute',
                                left: 0,
                                top: 4,
                                bottom: 4,
                                width: 3,
                                backgroundColor: '#6366f1',
                                borderRadius: '0 4px 4px 0'
                            }} />
                        )}
                    </button>
                ))}
            </div>

            {/* Secondary Panel (Fly-out) */}
            {activeCategory && (
                <div style={{
                    width: 250,
                    backgroundColor: 'white',
                    borderRight: '1px solid #e5e7eb',
                    padding: 20,
                    zIndex: 90,
                    boxShadow: '4px 0 12px rgba(0,0,0,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                    animation: 'slideIn 0.2s ease-out'
                }}>
                    <style>{`
                        @keyframes slideIn {
                            from { transform: translateX(-20px); opacity: 0; }
                            to { transform: translateX(0); opacity: 1; }
                        }
                    `}</style>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#1f2937' }}>
                            {categories.find(c => c.id === activeCategory)?.label}
                        </h3>
                    </div>

                    {activeCategory === 'sticky' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            {[
                                { color: '#fef08a', label: 'Yellow' },
                                { color: '#bbf7d0', label: 'Green' },
                                { color: '#bfdbfe', label: 'Blue' },
                                { color: '#fed7aa', label: 'Orange' },
                                { color: '#ddd6fe', label: 'Purple' },
                                { color: '#fecaca', label: 'Pink' },
                            ].map((s) => (
                                <button
                                    key={s.color}
                                    onClick={() => handleAddElement('sticky', { color: s.color })}
                                    style={{
                                        aspectRatio: '1/1',
                                        backgroundColor: s.color,
                                        border: '1px solid rgba(0,0,0,0.05)',
                                        borderRadius: 4,
                                        cursor: 'pointer',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                        transition: 'transform 0.1s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                />
                            ))}
                        </div>
                    )}

                    {activeCategory === 'text' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <button
                                onClick={() => handleAddElement('text', { fontSize: 32, fontWeight: 'bold' })}
                                style={{ textAlign: 'left', padding: '12px', border: '1px solid #e5e7eb', borderRadius: 8, background: 'white', cursor: 'pointer', fontSize: 24, fontWeight: 'bold' }}
                            >
                                Title
                            </button>
                            <button
                                onClick={() => handleAddElement('text', { fontSize: 20, fontWeight: 600 })}
                                style={{ textAlign: 'left', padding: '10px', border: '1px solid #e5e7eb', borderRadius: 8, background: 'white', cursor: 'pointer', fontSize: 18, fontWeight: 600 }}
                            >
                                Heading
                            </button>
                            <button
                                onClick={() => handleAddElement('text', { fontSize: 14 })}
                                style={{ textAlign: 'left', padding: '8px', border: '1px solid #e5e7eb', borderRadius: 8, background: 'white', cursor: 'pointer', fontSize: 14 }}
                            >
                                Body text
                            </button>
                        </div>
                    )}

                    {activeCategory === 'shape' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                            {[
                                { type: 'rectangle', icon: Square },
                                { type: 'circle', icon: Circle },
                                { type: 'triangle', icon: Triangle },
                                { type: 'star', icon: Star },
                                { type: 'diamond', icon: Diamond },
                            ].map((s) => (
                                <button
                                    key={s.type}
                                    onClick={() => handleAddElement('shape', { shapeType: s.type, width: 100, height: 100 })}
                                    style={{
                                        aspectRatio: '1/1',
                                        backgroundColor: '#f9fafb',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: 8,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#374151'
                                    }}
                                    title={s.type}
                                >
                                    <s.icon size={24} />
                                </button>
                            ))}
                        </div>
                    )}

                    {activeCategory === 'icon' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div style={{ position: 'relative' }}>
                                <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                                <input
                                    placeholder="Search icons..."
                                    style={{ width: '100%', padding: '8px 8px 8px 32px', borderRadius: 6, border: '1px solid #e5e7eb', fontSize: 13 }}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                                {[
                                    { name: 'Smile', icon: Smile },
                                    { name: 'Heart', icon: Heart },
                                    { name: 'Star', icon: Star },
                                    { name: 'Zap', icon: Zap },
                                    { name: 'Flame', icon: Flame },
                                    { name: 'Cloud', icon: Cloud },
                                    { name: 'Sun', icon: Sun },
                                    { name: 'Moon', icon: Moon },
                                    { name: 'Target', icon: Target },
                                    { name: 'Coffee', icon: Coffee },
                                    { name: 'MessageSquare', icon: MessageSquare },
                                    { name: 'Clipboard', icon: Clipboard }
                                ].map(i => (
                                    <button
                                        key={i.name}
                                        onClick={() => handleAddElement('icon', { iconName: i.name, width: 48, height: 48 })}
                                        style={{ aspectRatio: '1/1', border: 'none', background: '#f3f4f6', borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}
                                    >
                                        <i.icon size={20} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeCategory === 'image' && (
                        <div style={{ textAlign: 'center', padding: '20px 0', border: '2px dashed #e5e7eb', borderRadius: 12 }}>
                            <ImageIcon size={32} style={{ color: '#9ca3af', marginBottom: 12 }} />
                            <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 12px 0' }}>Drag & drop images or</p>
                            <button
                                onClick={() => handleAddElement('image', { imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400', width: 200, height: 150 })}
                                className="btn btn-secondary"
                                style={{ fontSize: 12, padding: '6px 12px' }}
                            >
                                Import from web
                            </button>
                        </div>
                    )}

                    {activeCategory === 'framework' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {[
                                { name: '2x2 Matrix', desc: 'Prioritize by impact/effort' },
                                { name: 'User Persona', desc: 'Define your target user' },
                                { name: 'Customer Journey', desc: 'Map out user experience' }
                            ].map(f => (
                                <button
                                    key={f.name}
                                    onClick={() => handleAddElement('framework', { title: f.name, width: 400, height: 300 })}
                                    style={{ textAlign: 'left', padding: '12px', border: '1px solid #e5e7eb', borderRadius: 8, background: 'white', cursor: 'pointer' }}
                                >
                                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{f.name}</div>
                                    <div style={{ fontSize: 11, color: '#6b7280' }}>{f.desc}</div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
