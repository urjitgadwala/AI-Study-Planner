"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { db } from "@/lib/db";
import { generateDailyTimetable, TimeSlot } from "@/lib/scheduler";
import { Topic, StudentMastery, UserProfile } from "@/lib/types";
import { Calendar, Clock, BookOpen, CheckCircle2, Circle, Zap, RefreshCw, ChevronRight } from "lucide-react";

const SUBJECT_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
    Physics: {
        bg: "bg-blue-50 dark:bg-blue-950/30",
        text: "text-blue-700 dark:text-blue-300",
        border: "border-blue-200 dark:border-blue-800",
        dot: "bg-blue-500",
    },
    Chemistry: {
        bg: "bg-emerald-50 dark:bg-emerald-950/30",
        text: "text-emerald-700 dark:text-emerald-300",
        border: "border-emerald-200 dark:border-emerald-800",
        dot: "bg-emerald-500",
    },
    Math: {
        bg: "bg-violet-50 dark:bg-violet-950/30",
        text: "text-violet-700 dark:text-violet-300",
        border: "border-violet-200 dark:border-violet-800",
        dot: "bg-violet-500",
    },
};

function formatDuration(start: string, end: string): string {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    const mins = (eh * 60 + em) - (sh * 60 + sm);
    if (mins >= 60) {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return m > 0 ? `${h}h ${m}m` : `${h}h`;
    }
    return `${mins}m`;
}

function formatTime12(time24: string): string {
    const [h, m] = time24.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${m.toString().padStart(2, "0")} ${period}`;
}

export default function TimetablePage() {
    const { data: session } = useSession();
    const userId = session?.user?.email || "default_user";

    const [topics, setTopics] = useState<Topic[]>([]);
    const [mastery, setMastery] = useState<StudentMastery[]>([]);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [timetable, setTimetable] = useState<TimeSlot[]>([]);
    const [startHour, setStartHour] = useState(9);
    const [completedSlots, setCompletedSlots] = useState<Set<string>>(new Set());
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const t = db.getTopics(userId);
        const m = db.getMastery(userId);
        const p = db.getProfile(userId);
        setTopics(t);
        setMastery(m);
        setProfile(p);
        if (p) {
            const tt = generateDailyTimetable(p, t, m, startHour);
            setTimetable(tt);
        }
    }, [userId]);

    const regenerate = () => {
        if (profile) {
            const tt = generateDailyTimetable(profile, topics, mastery, startHour);
            setTimetable(tt);
            setCompletedSlots(new Set());
        }
    };

    const toggleSlot = (topicId: string) => {
        setCompletedSlots(prev => {
            const next = new Set(prev);
            if (next.has(topicId)) next.delete(topicId);
            else next.add(topicId);
            return next;
        });
    };

    const today = new Date().toLocaleDateString("en-IN", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
    });

    const totalMinutes = timetable.reduce((acc, slot) => {
        const [sh, sm] = slot.startTime.split(":").map(Number);
        const [eh, em] = slot.endTime.split(":").map(Number);
        return acc + (eh * 60 + em) - (sh * 60 + sm);
    }, 0);

    const completedCount = completedSlots.size;
    const progressPct = timetable.length > 0 ? Math.round((completedCount / timetable.length) * 100) : 0;

    const subjectSummary = ["Physics", "Chemistry", "Math"].map(subj => ({
        subject: subj,
        count: timetable.filter(s => s.subject === subj).length,
        color: SUBJECT_COLORS[subj],
    }));

    if (!mounted) return <div className="min-h-screen bg-background" />;

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm font-semibold mb-1">
                        <Calendar className="w-4 h-4" />
                        {today}
                    </div>
                    <h1 className="text-3xl font-black text-foreground">Today's Study Plan</h1>
                    <p className="text-muted-foreground mt-1 font-medium">
                        AI-generated schedule based on your syllabus and mastery levels.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-bold text-muted-foreground">Start at:</label>
                        <select
                            value={startHour}
                            onChange={e => setStartHour(Number(e.target.value))}
                            className="px-3 py-2 bg-secondary border border-border rounded-xl text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                        >
                            {Array.from({ length: 16 }, (_, i) => i + 5).map(h => (
                                <option key={h} value={h}>
                                    {h < 12 ? `${h}:00 AM` : h === 12 ? "12:00 PM" : `${h - 12}:00 PM`}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={regenerate}
                        className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Regenerate
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Sessions", value: timetable.length, icon: BookOpen, color: "text-primary" },
                    { label: "Study Time", value: `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`, icon: Clock, color: "text-amber-500" },
                    { label: "Completed", value: `${completedCount}/${timetable.length}`, icon: CheckCircle2, color: "text-emerald-500" },
                    { label: "Progress", value: `${progressPct}%`, icon: Zap, color: "text-violet-500" },
                ].map(stat => (
                    <div key={stat.label} className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
                        <div className={`p-2.5 bg-secondary rounded-xl ${stat.color}`}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                            <p className="text-xl font-black text-foreground">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Progress Bar */}
            {timetable.length > 0 && (
                <div className="bg-card border border-border rounded-2xl p-5">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-bold text-foreground">Daily Progress</span>
                        <span className="text-sm font-black text-primary">{progressPct}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                        <div
                            className="h-3 bg-gradient-to-r from-primary to-violet-500 rounded-full transition-all duration-700"
                            style={{ width: `${progressPct}%` }}
                        />
                    </div>
                    <div className="flex gap-6 mt-4">
                        {subjectSummary.map(s => (
                            <div key={s.subject} className="flex items-center gap-2">
                                <div className={`w-2.5 h-2.5 rounded-full ${s.color.dot}`} />
                                <span className="text-xs font-bold text-muted-foreground">{s.subject}: {s.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Timetable */}
            {timetable.length === 0 ? (
                <div className="bg-card border border-border rounded-3xl p-16 text-center">
                    <div className="w-20 h-20 bg-secondary rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Calendar className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-black text-foreground mb-2">No Schedule Generated</h3>
                    <p className="text-muted-foreground font-medium max-w-sm mx-auto">
                        Add topics to your syllabus first, then come back to generate your personalized study plan.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    <h2 className="text-lg font-black text-foreground">Schedule</h2>
                    {timetable.map((slot, idx) => {
                        const colors = SUBJECT_COLORS[slot.subject] || SUBJECT_COLORS.Physics;
                        const isDone = completedSlots.has(slot.topicId + idx);
                        const duration = formatDuration(slot.startTime, slot.endTime);

                        return (
                            <div
                                key={idx}
                                onClick={() => toggleSlot(slot.topicId + idx)}
                                className={`group flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${isDone
                                        ? "bg-secondary/50 border-border opacity-60"
                                        : `${colors.bg} ${colors.border}`
                                    }`}
                            >
                                {/* Time Column */}
                                <div className="hidden sm:flex flex-col items-end min-w-[80px]">
                                    <span className="text-xs font-black text-foreground">{formatTime12(slot.startTime)}</span>
                                    <span className="text-[10px] text-muted-foreground font-bold">to {formatTime12(slot.endTime)}</span>
                                </div>

                                {/* Divider */}
                                <div className="hidden sm:flex flex-col items-center gap-1">
                                    <div className={`w-2.5 h-2.5 rounded-full ${isDone ? "bg-emerald-500" : colors.dot}`} />
                                    <div className="w-0.5 h-8 bg-border" />
                                </div>

                                {/* Content */}
                                <div className="flex-grow min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}>
                                            {slot.subject}
                                        </span>
                                        <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {duration}
                                        </span>
                                    </div>
                                    <p className={`font-bold text-sm truncate ${isDone ? "line-through text-muted-foreground" : "text-foreground"}`}>
                                        {slot.topicName}
                                    </p>
                                    <p className="text-xs text-muted-foreground font-medium sm:hidden">
                                        {formatTime12(slot.startTime)} – {formatTime12(slot.endTime)}
                                    </p>
                                </div>

                                {/* Check Icon */}
                                <div className="shrink-0">
                                    {isDone ? (
                                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                    ) : (
                                        <Circle className="w-6 h-6 text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
