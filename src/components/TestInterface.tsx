"use client";

import React, { useState, useEffect } from 'react';
import { GeneratedTest } from '@/lib/testEngine';

interface TestInterfaceProps {
    test: GeneratedTest;
    onComplete: (results: any) => void;
    onCancel: () => void;
}

export default function TestInterface({ test, onComplete, onCancel }: TestInterfaceProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [timeLeft, setTimeLeft] = useState(test.questions.length * 2 * 60); // 2 mins per question
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const handleAnswer = (category: 'Silly' | 'Conceptual' | 'Time Pressure' | 'Correct') => {
        const qId = test.questions[currentQuestionIndex].id;
        setAnswers({ ...answers, [qId]: category });
    };

    const handleSubmit = () => {
        setIsSubmitting(true);
        // Simulate a small delay for "AI Analysis"
        setTimeout(() => {
            const correctCount = Object.values(answers).filter(v => v === 'Correct').length;
            const score = Math.round((correctCount / test.questions.length) * 100);

            const result = {
                testId: test.id,
                score,
                answers,
                date: new Date().toISOString()
            };
            onComplete(result);
        }, 1500);
    };

    const q = test.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / test.questions.length) * 100;

    return (
        <div className="fixed inset-0 bg-slate-900 z-[110] flex flex-col">
            {/* Header */}
            <header className="bg-slate-800 p-4 flex justify-between items-center border-b border-slate-700">
                <div className="flex items-center gap-4">
                    <button onClick={onCancel} className="text-slate-400 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <div>
                        <h2 className="text-white font-bold">Sunday Revision Test</h2>
                        <p className="text-xs text-slate-400">Question {currentQuestionIndex + 1} of {test.questions.length}</p>
                    </div>
                </div>
                <div className={`px-4 py-2 rounded-lg font-mono font-bold ${timeLeft < 60 ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-700 text-emerald-400'}`}>
                    {formatTime(timeLeft)}
                </div>
            </header>

            {/* Progress Bar */}
            <div className="w-full h-1 bg-slate-700">
                <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>

            <main className="flex-grow flex items-center justify-center p-6 overflow-y-auto">
                <div className="max-w-2xl w-full">
                    <div className="mb-8">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full mb-4 inline-block ${q.subject === 'Physics' ? 'bg-blue-900/40 text-blue-300' :
                                q.subject === 'Chemistry' ? 'bg-orange-900/40 text-orange-300' :
                                    'bg-purple-900/40 text-purple-300'
                            }`}>
                            {q.subject} • Tier {q.difficulty}
                        </span>
                        <h3 className="text-3xl font-bold text-white leading-tight">
                            Solve a problem from: <br />
                            <span className="text-indigo-400">{q.topicName}</span>
                        </h3>
                        <p className="mt-4 text-slate-400 italic">
                            (In a real version, we would fetch a dynamic question from a database or Gemini here.)
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Self-Assessment</div>
                        <button
                            onClick={() => handleAnswer('Correct')}
                            className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center justify-between ${answers[q.id] === 'Correct' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                                }`}
                        >
                            <span className="font-bold">I solved it correctly!</span>
                            <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center">
                                {answers[q.id] === 'Correct' && <div className="w-3 h-3 bg-current rounded-full" />}
                            </div>
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-8">
                            {[
                                { id: 'Silly', label: 'Silly Error', color: 'rose' },
                                { id: 'Conceptual', label: 'Conceptual Gap', color: 'amber' },
                                { id: 'Time Pressure', label: 'Time Pressure', color: 'indigo' }
                            ].map((btn) => (
                                <button
                                    key={btn.id}
                                    onClick={() => handleAnswer(btn.id as any)}
                                    className={`p-4 rounded-xl border-2 transition-all font-bold text-center text-sm ${answers[q.id] === btn.id
                                            ? `bg-${btn.color}-500/10 border-${btn.color}-500 text-${btn.color}-400`
                                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                                        }`}
                                >
                                    {btn.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-slate-800 p-6 flex justify-between items-center border-t border-slate-700">
                <button
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                    className="px-6 py-3 rounded-xl font-bold text-slate-400 hover:text-white disabled:opacity-30"
                >
                    Previous
                </button>

                {currentQuestionIndex < test.questions.length - 1 ? (
                    <button
                        disabled={!answers[q.id]}
                        onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                        className="px-10 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-900/20 disabled:opacity-50 transition-all"
                    >
                        Next
                    </button>
                ) : (
                    <button
                        onClick={handleSubmit}
                        disabled={!answers[q.id] || isSubmitting}
                        className="px-10 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-900/20 disabled:opacity-50 transition-all flex items-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Analyzing results...
                            </>
                        ) : 'Finish & Analyze'}
                    </button>
                )}
            </footer>
        </div>
    );
}
