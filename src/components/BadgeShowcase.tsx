"use client";

import React from 'react';

interface BadgeShowcaseProps {
    badges: string[];
}

const BADGE_DATA: Record<string, { icon: string, color: string, description: string }> = {
    'Early Bird': { icon: '☀️', color: 'orange', description: 'Started study before 8 AM' },
    'Consistency King': { icon: '👑', color: 'emerald', description: 'Maintained a 5-day streak' },
    'Monk Mode': { icon: '🧘', color: 'indigo', description: 'Completed 3 sessions with 0 distractions' },
    'Syllabus Slayer': { icon: '⚔️', color: 'rose', description: 'Mastered 10 topics' },
    'Sunday Warrior': { icon: '🛡️', color: 'purple', description: 'Scored 90%+ in a Sunday Test' }
};

export default function BadgeShowcase({ badges }: BadgeShowcaseProps) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Achievements</h3>
            <div className="flex flex-wrap gap-3">
                {badges.map((badgeName) => {
                    const data = BADGE_DATA[badgeName] || { icon: '🏅', color: 'slate', description: 'Special achievement' };
                    return (
                        <div
                            key={badgeName}
                            className={`group relative flex items-center justify-center w-12 h-12 rounded-xl bg-${data.color}-50 border border-${data.color}-100 text-2xl cursor-help transition-all hover:scale-110`}
                        >
                            {data.icon}
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                                <div className="font-bold">{badgeName}</div>
                                <div className="text-slate-300">{data.description}</div>
                            </div>
                        </div>
                    );
                })}
                {badges.length === 0 && (
                    <div className="text-xs font-bold text-slate-400 italic">No badges earned yet... Keep studying!</div>
                )}
            </div>
        </div>
    );
}
