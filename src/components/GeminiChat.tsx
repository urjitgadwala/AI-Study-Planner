"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Topic, StudentMastery, ChatMessage } from '@/lib/types';
import { db } from '@/lib/db';
import { useSession } from 'next-auth/react';
import { chatWithIdeaEngine } from "@/lib/groq";
import { Send, X, Bot, Sparkles, RotateCcw } from 'lucide-react';

interface GeminiChatProps {
    topics: Topic[];
    mastery: StudentMastery[];
    mode?: 'floating' | 'inline';
}

export default function GeminiChat({ topics, mastery, mode = 'floating' }: GeminiChatProps) {
    const { data: session } = useSession();
    const userId = session?.user?.email || 'default_user';
    const [isOpen, setIsOpen] = useState(mode === 'inline');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Initial Load
    useEffect(() => {
        const fetchHistory = async () => {
            const history = await db.getChatHistory(userId);
            if (history.length > 0) {
                setMessages(history);
            } else {
                setMessages([
                    { role: 'model', text: "Hello! I'm IDEA Master. How can I help you with your JEE preparation today?" }
                ]);
            }
        };
        fetchHistory();
    }, [userId]);

    // Save on change
    useEffect(() => {
        const saveHistory = async () => {
            if (messages.length > 0) {
                await db.saveChatHistory(messages, userId);
            }
        };
        saveHistory();
    }, [messages, userId]);

    // Auto scroll
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (mode === 'inline') setIsOpen(true);
    }, [mode]);

    const handleClear = async () => {
        if (window.confirm("Are you sure you want to clear your chat history?")) {
            const initialMessage: ChatMessage[] = [{ role: 'model', text: "Hello! I'm IDEA Master. How can I help you with your JEE preparation today?" }];
            setMessages(initialMessage);
            await db.saveChatHistory(initialMessage, userId);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
        setIsLoading(true);

        try {
            const masteredTopics = topics.filter(t => mastery.find(m => m.topicId === t.id && m.isCompleted));
            const context = `
                Role: Helpful JEE preparation assistant.
                Student Mastery: ${masteredTopics.length > 0 ? masteredTopics.map(t => t.name).join(', ') : 'No topics mastered yet'}.
                Database Context: There are ${topics.length} total topics available.
            `;

            const responseText = await chatWithIdeaEngine(userMessage, messages, context);
            setMessages(prev => [...prev, { role: 'model', text: responseText }]);
        } catch (error: any) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, { role: 'model', text: "I'm having trouble connecting right now. Please check your AI API keys!" }]);
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
                    ? "absolute bottom-20 right-0 w-[400px] h-[min(600px,80vh)] border border-white/20 animate-in slide-in-from-bottom-8 duration-500"
                    : "flex-grow flex flex-col w-full h-full"
                    } glass dark:bg-slate-900/80 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col`}>
                    <header className="bg-primary p-5 text-white flex justify-between items-center bg-gradient-to-r from-primary to-indigo-600 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-xl">
                                <Bot className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">IDEA Master</h3>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="text-[10px] text-white/80 font-bold uppercase tracking-wider">Online</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={handleClear} className="p-2 hover:bg-white/10 rounded-xl transition-colors" title="Clear History">
                                <RotateCcw className="w-4 h-4" />
                            </button>
                            {mode === 'floating' && (
                                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </header>

                    <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar">
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
                            IDEA Engine
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
