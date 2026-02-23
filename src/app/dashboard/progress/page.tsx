"use client";

import React, { useState } from 'react';
import SyllabusTracker from '@/components/SyllabusTracker';
import SyllabusAnalysis from '@/components/SyllabusAnalysis';
import { db } from '@/lib/db';
import { useSession } from 'next-auth/react';
import { Topic, StudentMastery } from '@/lib/types';
import { CheckCircle2, Circle, Clock, ChevronRight, Trash2, AlertCircle } from 'lucide-react';
import TopicAssessment from '@/components/TopicAssessment';
import { generateDailyTimetable } from '@/lib/scheduler';
import confetti from 'canvas-confetti';

export default function ProgressPage() {
    const [mounted, setMounted] = React.useState(false);
    const [activeSubject, setActiveSubject] = useState('Physics');
    const [topics, setTopics] = useState<Topic[]>([]);
    const [mastery, setMastery] = useState<StudentMastery[]>([]);
    const [deletingTopicId, setDeletingTopicId] = useState<string | null>(null);
    const [assessingTopic, setAssessingTopic] = useState<Topic | null>(null);

    const { data: session } = useSession();
    const userId = session?.user?.email || 'default_user';

    React.useEffect(() => {
        setMounted(true);
        const fetchData = async () => {
            const loadedTopics = await db.getTopics(userId);
            const loadedMastery = await db.getMastery(userId);
            setTopics(loadedTopics);
            setMastery(loadedMastery);
        };
        fetchData();
    }, [userId]);

    if (!mounted) {
        return <div className="min-h-screen bg-background" />;
    }

    const handleDelete = async (topicId: string) => {
        await db.deleteTopic(topicId, userId);
        const loadedTopics = await db.getTopics(userId);
        setTopics(loadedTopics);
        setDeletingTopicId(null);
    };

    const handleAssessmentComplete = async (result: any) => {
        if (!assessingTopic) return;

        const newEntry: StudentMastery = {
            userId: userId,
            topicId: assessingTopic.id,
            currentTier: result.tier,
            isCompleted: result.tier >= 4,
            confidenceScore: result.tier * 20,
            completedAt: result.tier >= 4 ? new Date().toISOString() : undefined
        };

        const newMastery = [...mastery.filter(m => m.topicId !== assessingTopic.id), newEntry];
        setMastery(newMastery);
        await db.saveMastery(newMastery, userId);
        setAssessingTopic(null);

        confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.6 },
            colors: ['#4f46e5', '#10b981']
        });
    };

    const subjects = ['Physics', 'Chemistry', 'Math'];
    const filteredTopics = topics.filter(t => t.subject === activeSubject);

    const getTopicStatus = (topicId: string) => {
        const m = mastery.find(m => m.topicId === topicId);
        if (!m) return 'not-started';
        return m.isCompleted ? 'mastered' : 'in-progress';
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header>
                <h1 className="text-3xl font-bold text-foreground">Detailed Progress</h1>
                <p className="text-muted-foreground mt-1">Analyze your mastery across all JEE subjects.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <SyllabusAnalysis
                        topics={topics}
                        mastery={mastery}
                        onStartAssessment={(topic) => setAssessingTopic(topic)}
                    />

                    <div className="bg-card p-0 rounded-3xl border border-border shadow-sm overflow-hidden relative">
                        {/* Deletion Confirmation Overlay */}
                        {deletingTopicId && (
                            <div className="absolute inset-0 z-50 bg-background/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
                                <div className="bg-card border border-border p-6 rounded-2xl shadow-2xl max-w-sm w-full text-center space-y-4">
                                    <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto">
                                        <AlertCircle className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-lg font-bold">Remove Topic?</h3>
                                    <p className="text-sm text-muted-foreground">Are you sure you want to remove this topic from your syllabus? Your progress data for it may be hidden.</p>
                                    <div className="flex gap-3 pt-2">
                                        <button
                                            onClick={() => setDeletingTopicId(null)}
                                            className="flex-1 py-2 px-4 bg-secondary border border-border rounded-xl text-sm font-bold hover:bg-secondary/80 transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => handleDelete(deletingTopicId)}
                                            className="flex-1 py-2 px-4 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="p-8 border-b border-border bg-secondary/20">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-foreground">Mastery Breakdown</h2>
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                    {filteredTopics.length} Topics total
                                </span>
                            </div>

                            {/* Sub-navigation */}
                            <div className="relative flex p-1 bg-secondary/50 rounded-2xl w-full max-w-md">
                                <div
                                    className="absolute inset-y-1 transition-all duration-300 ease-out bg-card rounded-[14px] shadow-sm"
                                    style={{
                                        width: 'calc(33.333% - 4px)',
                                        left: activeSubject === 'Physics' ? '4px' : activeSubject === 'Chemistry' ? '33.333%' : '66.666%'
                                    }}
                                />
                                {subjects.map((subject) => (
                                    <button
                                        key={subject}
                                        onClick={() => setActiveSubject(subject)}
                                        className={`relative z-10 flex-1 px-4 py-2.5 text-sm font-bold transition-all duration-300 ${activeSubject === subject
                                            ? "text-primary"
                                            : "text-muted-foreground hover:text-foreground"
                                            }`}
                                    >
                                        {subject}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="divide-y divide-border max-h-[600px] overflow-y-auto custom-scrollbar">
                            {filteredTopics.map((topic) => {
                                const status = getTopicStatus(topic.id);
                                const masteryEntry = mastery.find(m => m.topicId === topic.id);

                                return (
                                    <div key={topic.id} className="p-6 flex items-center justify-between hover:bg-secondary/10 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-xl ${status === 'mastered' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                status === 'in-progress' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' :
                                                    'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                                                }`}>
                                                {status === 'mastered' ? <CheckCircle2 className="w-5 h-5" /> :
                                                    status === 'in-progress' ? <Clock className="w-5 h-5" /> :
                                                        <Circle className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{topic.name}</h3>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Weightage: {topic.weightage}/10</span>
                                                    {masteryEntry?.confidenceScore && (
                                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">• Confidence: {masteryEntry.confidenceScore}%</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${status === 'mastered' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' :
                                                status === 'in-progress' ? 'bg-orange-500/10 text-orange-600 border border-orange-500/20' :
                                                    'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                                                }`}>
                                                {status.replace('-', ' ')}
                                            </span>
                                            <button
                                                onClick={() => setDeletingTopicId(topic.id)}
                                                className="p-2 text-muted-foreground/30 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                <div className="space-y-8">
                    <SyllabusTracker topics={topics} mastery={mastery} />
                </div>
            </div>

            {/* Modals & Overlays */}
            {assessingTopic && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[200] flex items-center justify-center p-6">
                    <div className="w-full max-w-2xl">
                        <TopicAssessment
                            topicName={assessingTopic.name}
                            onComplete={handleAssessmentComplete}
                            onCancel={() => setAssessingTopic(null)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
