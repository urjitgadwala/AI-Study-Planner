"use client";

import React from 'react';
import { db } from '@/lib/db';
import { useSession } from 'next-auth/react';
import { Medal, Trophy, Star, Zap } from 'lucide-react';

export default function PointsPage() {
    const [mounted, setMounted] = React.useState(false);
    const { data: session } = useSession();
    const userId = session?.user?.email || 'default_user';

    const [profile, setProfile] = React.useState<any>(null);
    const [focusLogs, setFocusLogs] = React.useState<any[]>([]);

    React.useEffect(() => {
        setMounted(true);
        const fetchData = async () => {
            const loadedProfile = await db.getProfile(userId);
            const loadedLogs = await db.getFocusLogs(userId);
            setProfile(loadedProfile);
            setFocusLogs(loadedLogs);
        };
        fetchData();
    }, [userId]);

    const totalFocusMinutes = focusLogs.reduce((acc, log) => acc + (log.actualMinutes || 0), 0);

    if (!mounted || !profile) {
        return <div className="min-h-screen bg-background" />;
    }

    return (
        <div className="space-y-8 text-center max-w-4xl mx-auto py-12">
            <header className="space-y-4">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 border-4 border-primary/20 text-primary mb-2">
                    <Trophy className="w-12 h-12" />
                </div>
                <h1 className="text-4xl font-black text-foreground">{profile.currentXP} XP Earned</h1>
                <p className="text-xl text-muted-foreground">Level 12 • 450 XP to next level</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card p-8 rounded-3xl border border-border shadow-sm">
                    <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-4" />
                    <div className="text-3xl font-bold text-foreground">{profile.streakCount}</div>
                    <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Day Streak</div>
                </div>

                <div className="bg-card p-8 rounded-3xl border border-border shadow-sm">
                    <Star className="w-8 h-8 text-purple-500 mx-auto mb-4" />
                    <div className="text-3xl font-bold text-foreground">{totalFocusMinutes}</div>
                    <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Focus Minutes</div>
                </div>

                <div className="bg-card p-8 rounded-3xl border border-border shadow-sm">
                    <Medal className="w-8 h-8 text-orange-500 mx-auto mb-4" />
                    <div className="text-3xl font-bold text-foreground">{profile.badges?.length || 0}</div>
                    <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Achievements</div>
                </div>
            </div>

            <div className="bg-card p-8 rounded-3xl border border-border shadow-sm text-left">
                <h2 className="text-xl font-bold text-foreground mb-8">Badges & Accomplishments</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    {profile.badges?.map((badge: string, i: number) => (
                        <div key={i} className="flex flex-col items-center gap-3 p-4 bg-secondary/50 rounded-2xl border border-border">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Medal className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold text-center">{badge}</span>
                        </div>
                    )) || <p className="text-muted-foreground col-span-full text-center">No badges earned yet. Keep studying!</p>}
                </div>
            </div>
        </div>
    );
}
