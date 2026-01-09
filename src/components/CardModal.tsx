import React, { useState, useEffect } from 'react';
import { useCanvasStore } from '../store/canvasStore';
import { X } from 'lucide-react';
import { Status, Effort } from '../types';

interface CardModalProps {
    cardId: string;
    onClose: () => void;
}

export function CardModal({ cardId, onClose }: CardModalProps) {
    const { getCardById, updateCard, deleteCard, currentUserRole } = useCanvasStore();
    const card = getCardById(cardId);

    const [title, setTitle] = useState(card?.title || '');
    const [description, setDescription] = useState(card?.description || '');
    const [status, setStatus] = useState<Status>(card?.status || 'draft');
    const [source, setSource] = useState(card?.source || '');
    const [effort, setEffort] = useState<Effort | null>(card?.effort || null);
    const [rice, setRice] = useState(card?.rice || { reach: 5, impact: 5, confidence: 5, effort: 5 });

    useEffect(() => {
        if (card) {
            setTitle(card.title);
            setDescription(card.description);
            setStatus(card.status);
            setSource(card.source);
            setEffort(card.effort);
            setRice(card.rice);
        }
    }, [card]);

    if (!card) return null;

    const handleSave = () => {
        updateCard(cardId, {
            title,
            description,
            status,
            source,
            effort,
            rice,
        });
        onClose();
    };

    const handleDelete = () => {
        deleteCard(cardId);
        onClose();
    };

    const canEditEffort = currentUserRole === 'engineering' || currentUserRole === 'pm';

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Edit Card</h2>
                    <button className="modal-close" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="form-group">
                        <label className="form-label">Title</label>
                        <input
                            type="text"
                            className="form-input"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter title..."
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                            className="form-input form-textarea"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter description..."
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label className="form-label">Status</label>
                            <select
                                className="form-input form-select"
                                value={status}
                                onChange={(e) => setStatus(e.target.value as Status)}
                            >
                                <option value="draft">Draft</option>
                                <option value="investigating">Investigating</option>
                                <option value="committed">Committed</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Source</label>
                            <input
                                type="text"
                                className="form-input"
                                value={source}
                                onChange={(e) => setSource(e.target.value)}
                                placeholder="e.g., Slack, Salesforce"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            Effort Estimate
                            {!canEditEffort && (
                                <span style={{
                                    fontSize: '11px',
                                    color: 'var(--color-text-tertiary)',
                                    marginLeft: '8px'
                                }}>
                                    (Engineering only)
                                </span>
                            )}
                        </label>
                        <div className="effort-toggle">
                            {(['S', 'M', 'L', 'XL'] as Effort[]).map((size) => (
                                <button
                                    key={size}
                                    className={`effort-option ${effort === size ? 'selected' : ''} ${!canEditEffort ? 'disabled' : ''}`}
                                    onClick={() => canEditEffort && setEffort(size)}
                                    disabled={!canEditEffort}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">RICE Score</label>
                        <div className="rice-sliders">
                            {(['reach', 'impact', 'confidence', 'effort'] as const).map((key) => (
                                <div key={key} className="rice-slider-group">
                                    <div className="rice-slider-label">
                                        <span className="rice-slider-name">
                                            {key.charAt(0).toUpperCase() + key.slice(1)}
                                        </span>
                                        <span className="rice-slider-value">{rice[key]}</span>
                                    </div>
                                    <input
                                        type="range"
                                        className="rice-slider"
                                        min="1"
                                        max="10"
                                        value={rice[key]}
                                        onChange={(e) => setRice({ ...rice, [key]: Number(e.target.value) })}
                                    />
                                </div>
                            ))}
                        </div>
                        <div style={{
                            marginTop: '12px',
                            padding: '8px 12px',
                            background: 'var(--color-bg-tertiary)',
                            borderRadius: '6px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                                Calculated Score
                            </span>
                            <span style={{
                                fontSize: '16px',
                                fontWeight: 600,
                                color: 'var(--color-accent-primary)'
                            }}>
                                {Math.round((rice.reach * rice.impact * rice.confidence) / rice.effort)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn btn-danger" onClick={handleDelete}>
                        Delete
                    </button>
                    <div style={{ flex: 1 }} />
                    <button className="btn btn-secondary" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="btn btn-primary" onClick={handleSave}>
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
