"use client";

import React, { useState } from 'react';

const MENTALITY_QUESTIONS = [
    { id: 'foundations', text: 'How comfortable are you with the basic concepts?', type: 'scale', min: 1, max: 5 },
    { id: 'formula_recall', text: 'Can you solve basic numericals without referring to a formula sheet?', type: 'choice', options: ['No', 'Mostly', 'Yes'] },
    { id: 'error_pattern', text: 'How often do you make "silly mistakes" in this topic?', type: 'choice', options: ['High', 'Medium', 'Low'] },
    { id: 'anxiety_level', text: 'Do you feel anxious or confident when seeing a question from this topic?', type: 'choice', options: ['Anxious', 'Neutral', 'Confident'] },
    { id: 'speed', text: 'How would you rate your problem-solving speed here?', type: 'choice', options: ['Slow', 'Average', 'Fast'] },
    { id: 'teaching_ability', text: 'Can you explain the logic of a complex derivation to someone else?', type: 'choice', options: ['No', 'Partially', 'Completely'] },
    { id: 'exposure', text: 'Have you completed the Previous Year Questions (PYQs)?', type: 'choice', options: ['None', 'Some', 'All'] },
    { id: 'edge_cases', text: 'Do you understand the exceptions and edge cases?', type: 'choice', options: ['No', 'Somewhat', 'Yes'] },
    { id: 'friction', text: 'How much mental effort does it take to start studying this topic?', type: 'choice', options: ['Huge', 'Moderate', 'Easy'] },
    { id: 'retention', text: "If you don't study this for 2 weeks, how much will you remember?", type: 'choice', options: ['None', 'A little', 'Most'] },
];

export default function MentalityAssessment({ topicName, onComplete }: { topicName: string, onComplete: (scores: any) => void }) {
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [currentStep, setCurrentStep] = useState(0);

    const handleAnswer = (val: any) => {
        const newAnswers = { ...answers, [MENTALITY_QUESTIONS[currentStep].id]: val };
        setAnswers(newAnswers);

        if (currentStep < MENTALITY_QUESTIONS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onComplete(newAnswers);
        }
    };

    const question = MENTALITY_QUESTIONS[currentStep];

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg border border-slate-200">
            <div className="mb-4 text-sm font-medium text-slate-500 uppercase tracking-wider">
                Assessing: <span className="text-indigo-600">{topicName}</span>
            </div>

            <div className="mb-8">
                <h2 className="text-xl font-bold text-slate-800 mb-2">{question.text}</h2>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                        className="bg-indigo-600 h-full transition-all duration-300"
                        style={{ width: `${((currentStep + 1) / MENTALITY_QUESTIONS.length) * 100}%` }}
                    />
                </div>
            </div>

            <div className="space-y-3">
                {question.type === 'scale' ? (
                    <div className="flex justify-between items-center bg-slate-50 p-4 rounded-lg">
                        {[1, 2, 3, 4, 5].map((num) => (
                            <button
                                key={num}
                                onClick={() => handleAnswer(num)}
                                className="w-12 h-12 rounded-full border-2 border-slate-300 hover:border-indigo-600 hover:bg-indigo-50 transition-all font-bold text-slate-700 hover:text-indigo-600"
                            >
                                {num}
                            </button>
                        ))}
                    </div>
                ) : (
                    question.options?.map((opt) => (
                        <button
                            key={opt}
                            onClick={() => handleAnswer(opt)}
                            className="w-full text-left p-4 rounded-lg bg-slate-50 border border-slate-200 hover:border-indigo-600 hover:bg-indigo-50 transition-all font-medium text-slate-700 hover:text-indigo-600"
                        >
                            {opt}
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}
