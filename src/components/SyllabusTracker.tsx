"use client";

import React from 'react';
import { Topic, StudentMastery } from '@/lib/types';

interface SyllabusTrackerProps {
    topics: Topic[];
    mastery: StudentMastery[];
}

export default function SyllabusTracker({ topics, mastery }: SyllabusTrackerProps) {
    const getSubjectStats = (subject: string) => {
        const subjectTopics = topics.filter(t => t.subject === subject);
        const total = subjectTopics.length;
        if (total === 0) return { percent: 0, completed: 0, total: 0 };

        const completed = subjectTopics.filter(t => {
            const m = mastery.find(m => m.topicId === t.id);
            return m?.isCompleted;
        }).length;

        return {
            percent: Math.round((completed / total) * 100),
            completed,
            total
        };
    };

    return (
        <div className="bg-card p-6 rounded-3xl border border-border shadow-sm h-full">
            <h2 className="text-xl font-bold text-foreground mb-8">Syllabus Tracker</h2>

            <div className="space-y-10">
                {['Physics', 'Chemistry', 'Mathematics'].map((subject) => {
                    const stats = getSubjectStats(subject === 'Mathematics' ? 'Math' : subject);
                    return (
                        <div key={subject}>
                            <div className="flex justify-between items-center mb-3">
                                <span className="font-bold text-foreground">{subject}</span>
                                <span className="text-sm font-bold text-muted-foreground">{stats.percent}%</span>
                            </div>
                            <div className="w-full bg-secondary h-4 rounded-full overflow-hidden mb-2">
                                <div
                                    className={`h-full transition-all duration-700 ${subject === 'Physics' ? 'bg-blue-500' :
                                            subject === 'Chemistry' ? 'bg-orange-500' :
                                                'bg-purple-500'
                                        }`}
                                    style={{ width: `${stats.percent}%` }}
                                />
                            </div>
                            <p className="text-xs font-bold text-muted-foreground">
                                {stats.completed} of {stats.total} topics mastered
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
