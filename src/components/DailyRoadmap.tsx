"use client";

import React from 'react';
import { TimeSlot } from '@/lib/scheduler';
import { Info, CheckCircle2 } from 'lucide-react';

interface DailyRoadmapProps {
    slots: TimeSlot[];
    onToggleComplete: (topicId: string) => void;
    onStartFocus: (topicId: string) => void;
}

export default function DailyRoadmap({ slots, onToggleComplete, onStartFocus }: DailyRoadmapProps) {
    if (slots.length === 0) {
        return (
            <div className="p-8 text-center text-muted-foreground bg-card rounded-3xl border border-border shadow-sm">
                No tasks scheduled. Add topics to get started!
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {slots.map((slot, index) => (
                <div
                    key={`${slot.topicId}-${index}`}
                    className={`flex items-center justify-between p-4 bg-card rounded-3xl border border-border hover:shadow-md transition-all group ${slot.isCompleted ? 'opacity-60' : ''}`}
                >
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground w-28">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {slot.startTime} - {slot.endTime}
                        </div>

                        <div className="flex items-center gap-4">
                            <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${slot.subject === 'Physics' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                    slot.subject === 'Chemistry' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                        'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                }`}>
                                {slot.subject}
                            </span>
                            <h3 className={`font-bold text-foreground transition-all ${slot.isCompleted ? 'line-through' : ''}`}>
                                {slot.topicName}
                            </h3>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => onStartFocus(slot.topicId)}
                            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <Info className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => onToggleComplete(slot.topicId)}
                            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${slot.isCompleted
                                    ? 'bg-primary border-primary text-white'
                                    : 'border-border bg-secondary hover:border-primary/50'
                                }`}
                        >
                            {slot.isCompleted && <CheckCircle2 className="w-4 h-4 fill-white stroke-primary" />}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
