"use client";

import React, { useState, useEffect } from 'react';
import { Topic } from '@/lib/types';
import { Trash2, X, AlertTriangle, CheckSquare, Square } from 'lucide-react';
import { db } from '@/lib/db';

interface TopicDeleteModalProps {
    topics: Topic[];
    onTopicsDeleted: () => void;
    onCancel: () => void;
    userId: string;
}

export default function TopicDeleteModal({ topics, onTopicsDeleted, onCancel, userId }: TopicDeleteModalProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Auto-select all user topics by default for convenience if they want to prune? 
    // No, better to be safe and let them select.

    const toggleTopic = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleDelete = () => {
        if (selectedIds.length === 0) return;

        if (confirm(`Are you sure you want to delete ${selectedIds.length} topics?`)) {
            selectedIds.forEach(id => db.deleteTopic(id, userId));
            onTopicsDeleted();
        }
    };

    return (
        <div className="bg-card p-8 rounded-3xl shadow-2xl border border-border animate-in fade-in slide-in-from-bottom-4 duration-300 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-black text-foreground">Delete Topics</h2>
                <button onClick={onCancel} className="p-2 hover:bg-secondary rounded-xl transition-all">
                    <X className="w-5 h-5" />
                </button>
            </div>
            <p className="text-sm text-muted-foreground mb-6">Select topics you want to remove from your syllabus.</p>

            <div className="flex-grow overflow-y-auto custom-scrollbar mb-6 space-y-2 pr-2">
                {topics.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                        No topics found.
                    </div>
                ) : (
                    topics.map((topic) => (
                        <button
                            key={topic.id}
                            onClick={() => toggleTopic(topic.id)}
                            className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${selectedIds.includes(topic.id)
                                    ? 'bg-red-500/5 border-red-500/30 text-red-600 dark:text-red-400'
                                    : 'bg-secondary/30 border-border text-foreground hover:bg-secondary/50'
                                }`}
                        >
                            <div className="flex items-center gap-3 text-left">
                                {selectedIds.includes(topic.id) ? (
                                    <CheckSquare className="w-5 h-5 flex-shrink-0" />
                                ) : (
                                    <Square className="w-5 h-5 flex-shrink-0" />
                                )}
                                <div>
                                    <span className="font-bold block">{topic.name}</span>
                                    <span className="text-[10px] font-bold opacity-60 uppercase">{topic.subject}</span>
                                </div>
                            </div>
                            {topic.id.startsWith('u_') && (
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded uppercase">User</span>
                            )}
                        </button>
                    ))
                )}
            </div>

            <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-2xl mb-6 flex gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed font-medium">
                    Warning: Deleting topics is permanent. Any mastery data associated with these topics will be hidden or lost.
                </p>
            </div>

            <div className="flex gap-4">
                <button
                    onClick={onCancel}
                    className="flex-1 py-4 px-6 bg-secondary hover:bg-secondary/80 text-foreground rounded-2xl font-bold transition-all border border-border"
                >
                    Cancel
                </button>
                <button
                    onClick={handleDelete}
                    disabled={selectedIds.length === 0}
                    className="flex-1 py-4 px-6 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-bold shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2"
                >
                    <Trash2 className="w-5 h-5" />
                    Delete {selectedIds.length > 0 ? selectedIds.length : ''} Topics
                </button>
            </div>
        </div>
    );
}
