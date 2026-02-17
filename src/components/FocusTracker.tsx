"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Topic, FocusLog } from '@/lib/types';

interface FocusTrackerProps {
    topic: Topic;
    durationMinutes: number;
    onComplete: (log: FocusLog) => void;
    onCancel: () => void;
}

export default function FocusTracker({ topic, durationMinutes, onComplete, onCancel }: FocusTrackerProps) {
    const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60);
    const [isActive, setIsActive] = useState(true);
    const [distractions, setDistractions] = useState(0);
    const [isDistracted, setIsDistracted] = useState(false);
    const startTimeRef = useRef(new Date().toISOString());
    const distractionTimerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isActive && secondsLeft > 0) {
            timer = setInterval(() => {
                setSecondsLeft(prev => prev - 1);
            }, 1000);
        } else if (secondsLeft === 0) {
            handleComplete();
        }
        return () => clearInterval(timer);
    }, [isActive, secondsLeft]);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                setDistractions(prev => prev + 1);
                setIsDistracted(true);
            } else {
                setIsDistracted(false);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleComplete = () => {
        const actualMinutes = Math.floor((durationMinutes * 60 - secondsLeft) / 60);
        const focusScore = Math.max(0, 100 - (distractions * 5));

        const log: FocusLog = {
            id: Math.random().toString(36).substr(2, 9),
            userId: 'user_1',
            sessionId: Math.random().toString(36).substr(2, 9),
            startTime: startTimeRef.current,
            endTime: new Date().toISOString(),
            actualMinutes,
            distractionCount: distractions,
            focusScore
        };
        onComplete(log);
    };

    const progress = ((durationMinutes * 60 - secondsLeft) / (durationMinutes * 60)) * 100;

    return (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-6">
            <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="p-8 text-center">
                    <div className="mb-2 text-xs font-bold text-indigo-500 uppercase tracking-widest">Focus Mode Active</div>
                    <h2 className="text-2xl font-black text-slate-800 mb-6">{topic.name}</h2>

                    <div className="relative w-64 h-64 mx-auto mb-8">
                        {/* Circular Progress (simplified) */}
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="128"
                                cy="128"
                                r="120"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                className="text-slate-100"
                            />
                            <circle
                                cx="128"
                                cy="128"
                                r="120"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                strokeDasharray={2 * Math.PI * 120}
                                strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
                                className="text-indigo-600 transition-all duration-1000 ease-linear"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <div className="text-5xl font-black text-slate-900 tabular-nums">
                                {formatTime(secondsLeft)}
                            </div>
                            <div className="text-xs font-bold text-slate-400 mt-2">LEFT OF {durationMinutes}M</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="text-[10px] font-bold text-slate-400 uppercase">Distractions</div>
                            <div className="text-xl font-bold text-slate-800">{distractions}</div>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="text-[10px] font-bold text-slate-400 uppercase">Status</div>
                            <div className={`text-xl font-bold ${isDistracted ? 'text-rose-500' : 'text-emerald-500'}`}>
                                {isDistracted ? 'Distracted!' : 'Focusing'}
                            </div>
                        </div>
                    </div>

                    {isDistracted && (
                        <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl animate-bounce">
                            <p className="text-sm font-bold text-rose-800">⚠️ STAY ON THIS TAB TO EARN FULL XP!</p>
                        </div>
                    )}

                    <div className="flex gap-4">
                        <button
                            onClick={() => setIsActive(!isActive)}
                            className="flex-1 py-4 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold transition-all"
                        >
                            {isActive ? 'Pause' : 'Resume'}
                        </button>
                        <button
                            onClick={handleComplete}
                            className="flex-1 py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 transition-all"
                        >
                            Done
                        </button>
                    </div>

                    <button
                        onClick={onCancel}
                        className="mt-6 text-sm font-bold text-slate-400 hover:text-slate-600 underline"
                    >
                        Abandon Session
                    </button>
                </div>
            </div>
        </div>
    );
}
