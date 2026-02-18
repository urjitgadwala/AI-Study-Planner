"use client";

import React, { useState, useEffect } from 'react';
import { generateDiagnosticQuestions, evaluateDiagnosticPerformance, DiagnosticQuestion, AssessmentResult } from '@/lib/gemini';
import { Brain, Sparkles, Target, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface TopicAssessmentProps {
    topicName: string;
    onComplete: (result: AssessmentResult) => void;
    onCancel: () => void;
}

export default function TopicAssessment({ topicName, onComplete, onCancel }: TopicAssessmentProps) {
    const [questions, setQuestions] = useState<DiagnosticQuestion[]>([]);
    const [currentIndex, setCurrentIndex] = useState(-1); // -1 is loading state
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [currentInput, setCurrentInput] = useState('');
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadQuestions() {
            try {
                const qs = await generateDiagnosticQuestions(topicName);
                // The API now returns fallbacks automatically, so we shouldn't fail here
                setQuestions(qs);
                setCurrentIndex(0);
            } catch (err) {
                // Secondary safety in case of severe implementation drift
                setError("AI connectivity is limited. Please refresh and try again.");
            }
        }
        loadQuestions();
    }, [topicName]);

    const handleNext = async () => {
        if (!currentInput.trim()) return;

        const updatedAnswers = { ...answers, [questions[currentIndex].id]: currentInput };
        setAnswers(updatedAnswers);
        setCurrentInput('');

        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setIsEvaluating(true);
            try {
                const result = await evaluateDiagnosticPerformance(topicName, updatedAnswers);
                onComplete(result);
            } catch (err) {
                // If even the evaluator fallback fails (unlikely), complete with a neutral tier
                onComplete({
                    tier: 2,
                    feedback: "Automatic Tier 2 assignment due to temporary connectivity issues.",
                    strengths: ["Consistency"],
                    weaknesses: ["AI analysis interrupted"]
                });
            }
        }
    };

    if (error) {
        return (
            <div className="bg-card p-8 rounded-3xl border border-border shadow-2xl text-center">
                <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Oops!</h2>
                <p className="text-muted-foreground mb-6">{error}</p>
                <div className="flex gap-4">
                    <button onClick={onCancel} className="flex-1 py-3 bg-secondary rounded-xl font-bold">Cancel</button>
                    <button onClick={() => window.location.reload()} className="flex-1 py-3 bg-primary text-white rounded-xl font-bold">Retry</button>
                </div>
            </div>
        );
    }

    if (currentIndex === -1 || isEvaluating) {
        return (
            <div className="bg-card p-12 rounded-3xl border border-border shadow-2xl text-center space-y-6">
                <div className="relative inline-block">
                    <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <Brain className="w-8 h-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-foreground">
                        {isEvaluating ? "Analyzing Your Expertise..." : "AI Engine is Crafting Your Test..."}
                    </h2>
                    <p className="text-muted-foreground">This helps the AI set your Tier and Study Hours.</p>
                </div>
            </div>
        );
    }

    const currentQ = questions[currentIndex];

    return (
        <div className="bg-card p-8 rounded-3xl border border-border shadow-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest">
                        <Target className="w-4 h-4" />
                        AI Focus Assessment
                    </div>
                    <h2 className="text-2xl font-black text-foreground">
                        {topicName}
                    </h2>
                </div>
                <div className="text-sm font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">
                    Q{currentIndex + 1} / {questions.length}
                </div>
            </div>

            {/* Question Area */}
            <div className="space-y-6">
                <p className="text-lg font-bold text-foreground leading-relaxed">
                    {currentQ.text}
                </p>

                {currentQ.type === 'choice' ? (
                    <div className="grid grid-cols-1 gap-3">
                        {currentQ.options?.map((opt, i) => (
                            <button
                                key={i}
                                onClick={() => {
                                    setCurrentInput(opt);
                                    // Small delay for visual feedback before auto-next
                                    setTimeout(handleNext, 300);
                                }}
                                className={`w-full text-left p-4 rounded-2xl border-2 transition-all font-bold flex items-center justify-between group ${currentInput === opt
                                    ? 'border-primary bg-primary/5 text-primary'
                                    : 'border-border bg-secondary/50 hover:border-primary/50 text-foreground/70'
                                    }`}
                            >
                                {opt}
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${currentInput === opt ? 'bg-primary border-primary' : 'border-border'
                                    }`}>
                                    {currentInput === opt && <CheckCircle2 className="w-4 h-4 text-white" />}
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <textarea
                            autoFocus
                            value={currentInput}
                            onChange={(e) => setCurrentInput(e.target.value)}
                            placeholder="Type your explanation or numerical answer here..."
                            className="w-full h-32 p-4 bg-secondary/50 border-2 border-border rounded-2xl focus:border-primary outline-none transition-all font-medium text-foreground resize-none"
                        />
                        <button
                            onClick={handleNext}
                            disabled={!currentInput.trim()}
                            className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            Next Question
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-border h-2 rounded-full overflow-hidden">
                <div
                    className="h-full bg-primary transition-all duration-500 rounded-full"
                    style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
            </div>
        </div>
    );
}
