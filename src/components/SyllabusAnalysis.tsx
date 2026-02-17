"use client";

import React from 'react';
import { Topic, StudentMastery } from '@/lib/types';

interface SyllabusAnalysisProps {
    topics: Topic[];
    mastery: StudentMastery[];
}

export default function SyllabusAnalysis({ topics, mastery }: SyllabusAnalysisProps) {
    const totalTopics = topics.length;
    if (totalTopics === 0) return null;

    const mastered = topics.filter(t => {
        const m = mastery.find(m => m.topicId === t.id);
        return m?.isCompleted && m.currentTier >= 4;
    }).length;

    const inProgress = topics.filter(t => {
        const m = mastery.find(m => m.topicId === t.id);
        return m?.isCompleted && m.currentTier < 4;
    }).length;

    const notStarted = totalTopics - mastered - inProgress;

    const masteredPct = (mastered / totalTopics) * 100;
    const inProgressPct = (inProgress / totalTopics) * 100;

    // Weighted progress for the big number
    const overallProgress = Math.round(((mastered * 1 + inProgress * 0.5) / totalTopics) * 100);

    return (
        <div className="bg-card p-8 rounded-3xl border border-border shadow-sm">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">OVERALL READINESS</h2>
                    <div className="text-6xl font-black text-foreground">{overallProgress}%</div>
                </div>
            </div>

            <div className="w-full h-4 bg-secondary rounded-full overflow-hidden flex mb-6">
                <div
                    className="h-full bg-emerald-500 transition-all duration-1000 ease-out"
                    style={{ width: `${masteredPct}%` }}
                />
                <div
                    className="h-full bg-orange-400 transition-all duration-1000 ease-out"
                    style={{ width: `${inProgressPct}%` }}
                />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span className="text-xs font-bold text-muted-foreground">Mastered ({mastered})</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-400" />
                        <span className="text-xs font-bold text-muted-foreground">In Progress ({inProgress})</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700" />
                        <span className="text-xs font-bold text-muted-foreground">Not Started ({notStarted})</span>
                    </div>
                </div>

                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {mastered} / {totalTopics} MASTERED
                </div>
            </div>
        </div>
    );
}
