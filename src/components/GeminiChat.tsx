"use client";

import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Topic, StudentMastery } from '@/lib/types';
import { Send, X, Bot, Sparkles } from 'lucide-react';

interface Message {
    role: 'user' | 'model';
    text: string;
}

interface GeminiChatProps {
    topics: Topic[];
    mastery: StudentMastery[];
    mode?: 'floating' | 'inline';
}

export default function GeminiChat({ topics, mastery, mode = 'floating' }: GeminiChatProps) {
    const [isOpen, setIsOpen] = useState(mode === 'inline');
    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', text: "Hello! I'm your Gemini Master. How can I help you with your JEE preparation today?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
    const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (mode === 'inline') setIsOpen(true);
    }, [mode]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
        setIsLoading(true);

        if (!genAI) {
            setTimeout(() => {
                setMessages(prev => [...prev, { role: 'model', text: "API Key is missing. I'm in mock mode! That's a great question, but I need a key to give you a real answer." }]);
                setIsLoading(false);
            }, 1000);
            return;
        }

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const masteredTopics = topics.filter(t => mastery.find(m => m.topicId === t.id && m.isCompleted));

            const fullPrompt = `
                Context: You are Gemini Master, a helpful JEE preparation assistant.
                Student Mastery: ${masteredTopics.length > 0 ? masteredTopics.map(t => t.name).join(', ') : 'No topics mastered yet'}.
                Database Context: There are ${topics.length} total topics available.
                
                Student Question: ${userMessage}
                
                Please provide concise, expert JEE guidance.
            `;

            const result = await model.generateContent(fullPrompt);
            const response = await result.response;
            const responseText = response.text();

            if (!responseText) throw new Error("Empty response");
            setMessages(prev => [...prev, { role: 'model', text: responseText }]);
        } catch (error: any) {
            console.error("Gemini Chat Error:", error);
            setMessages(prev => [...prev, { role: 'model', text: "I encountered an error. Please check your connection." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const floatingStyles = "fixed bottom-6 right-6 z-[120]";
    const inlineStyles = "w-full h-full flex flex-col";

    return (
        <div className={mode === 'floating' ? floatingStyles : inlineStyles}>
            {/* Chat Window */}
            {isOpen && (
                <div className={`${mode === 'floating'
                        ? "absolute bottom-20 right-0 w-[400px] h-[600px] border border-white/20 animate-in slide-in-from-bottom-8 duration-500"
                        : "flex-grow flex flex-col w-full h-full"
                    } glass dark:bg-slate-900/80 rounded-[2rem] shadow-2xl overflow-hidden`}>
                    <header className="bg-primary p-5 text-white flex justify-between items-center bg-gradient-to-r from-primary to-indigo-600">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-xl">
                                <Bot className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Gemini Master</h3>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="text-[10px] text-white/80 font-bold uppercase tracking-wider">Online</span>
                                </div>
                            </div>
                        </div>
                        {mode === 'floating' && (
                            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </header>

                    <div className="flex-grow overflow-y-auto p-6 space-y-6 scrollbar-hide">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed shadow-sm transition-all ${msg.role === 'user'
                                    ? 'bg-primary text-white rounded-tr-none'
                                    : 'bg-card text-foreground border border-border rounded-tl-none font-medium'
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-card p-4 rounded-3xl shadow-sm border border-border flex gap-1.5">
                                    <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" />
                                    <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                                    <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    <div className="p-5 border-t border-border bg-card/50">
                        <div className="flex gap-3 items-center bg-secondary/50 p-2 rounded-2xl border border-border">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Type your message..."
                                className="flex-grow px-4 py-2 bg-transparent text-sm border-none focus:ring-0 placeholder:text-muted-foreground"
                            />
                            <button
                                onClick={handleSend}
                                className="p-3 bg-primary text-white rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                            <Sparkles className="w-3 h-3" />
                            Gemini 1.5 Flash
                        </div>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            {mode === 'floating' && (
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-2xl transition-all hover:scale-105 active:scale-95 group ${isOpen
                        ? 'bg-card text-foreground border border-border'
                        : 'bg-primary text-white hover:shadow-primary/40'
                        }`}
                >
                    {isOpen ? (
                        <X className="w-7 h-7" />
                    ) : (
                        <div className="relative">
                            <Bot className="w-7 h-7 transition-all group-hover:rotate-6" />
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-primary shadow-sm" />
                        </div>
                    )}
                </button>
            )}
        </div>
    );
}
