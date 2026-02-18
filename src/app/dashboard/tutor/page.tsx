"use client";

import React from 'react';
import GeminiChat from '@/components/GeminiChat';
import { db } from '@/lib/db';
import { useSession } from 'next-auth/react';
import { Bot, Sparkles } from 'lucide-react';

export default function TutorPage() {
    const [mounted, setMounted] = React.useState(false);
    const { data: session } = useSession();
    const userId = session?.user?.email || 'default_user';

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="min-h-screen bg-background" />;
    }

    const topics = db.getTopics(userId);
    const mastery = db.getMastery(userId);

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col gap-6">
            <header className="flex items-center justify-between bg-card p-6 rounded-3xl border border-border shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-2xl text-primary">
                        <Bot className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-foreground">JEE AI Tutor</h1>
                        <p className="text-sm text-muted-foreground">Expert guidance on Physics, Chemistry, and Math.</p>
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-secondary rounded-xl text-sm font-bold text-muted-foreground">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Powered by IDEA Engine
                </div>
            </header>

            <div className="flex-grow bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
                <GeminiChat topics={topics} mastery={mastery} mode="inline" />
            </div>
        </div>
    );
}
