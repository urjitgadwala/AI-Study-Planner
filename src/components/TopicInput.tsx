"use client";

import React, { useState } from 'react';
import { Topic } from '@/lib/types';

interface TopicInputProps {
    onTopicsAdded: (newTopics: Topic[]) => void;
    onCancel: () => void;
}

export default function TopicInput({ onTopicsAdded, onCancel }: TopicInputProps) {
    const [subject, setSubject] = useState<'Physics' | 'Chemistry' | 'Math'>('Physics');
    const [inputText, setInputText] = useState('');

    const handleAdd = () => {
        const lines = inputText.split('\n').filter(line => line.trim() !== '');
        if (lines.length === 0) return;

        const newTopics: Topic[] = lines.map(line => ({
            id: `u_${Math.random().toString(36).substr(2, 9)}`,
            name: line.trim(),
            subject: subject,
            weightage: 5, // Default weightage
            parentSubject: subject
        }));

        onTopicsAdded(newTopics);
        setInputText('');
    };

    return (
        <div className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-2xl font-black text-slate-800 mb-2">Import Syllabus</h2>
            <p className="text-sm text-slate-500 mb-6">Paste your topics list below (one per line) to bulk import.</p>

            <div className="mb-6">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Target Subject</label>
                <div className="flex gap-2">
                    {(['Physics', 'Chemistry', 'Math'] as const).map((s) => (
                        <button
                            key={s}
                            onClick={() => setSubject(s)}
                            className={`flex-1 py-3 rounded-xl font-bold transition-all ${subject === s
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mb-6">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Topic List</label>
                <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="e.g.&#10;Units and Dimensions&#10;Kinematics&#10;Laws of Motion"
                    className="w-full h-48 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300"
                />
            </div>

            <div className="flex gap-4">
                <button
                    onClick={onCancel}
                    className="flex-1 py-4 px-6 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold transition-all"
                >
                    Cancel
                </button>
                <button
                    onClick={handleAdd}
                    disabled={!inputText.trim()}
                    className="flex-1 py-4 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:cursor-not-allowed text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all"
                >
                    Add Topics
                </button>
            </div>
        </div>
    );
}
