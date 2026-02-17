"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { useSession } from 'next-auth/react';
import { User, Mail, Phone, Trophy, Calendar, Clock, Shield, Save, Check } from 'lucide-react';
import { UserProfile } from '@/lib/types';

export default function ProfilePage() {
    const [mounted, setMounted] = useState(false);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showSavedMsg, setShowSavedMsg] = useState(false);

    const { data: session } = useSession();
    const userId = session?.user?.email || 'default_user';

    useEffect(() => {
        setMounted(true);
        const data = db.getProfile(userId);
        setProfile(data);
    }, [userId]);

    if (!mounted || !profile) {
        return <div className="min-h-screen bg-background" />;
    }

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        db.saveProfile(profile, userId);
        setTimeout(() => {
            setIsSaving(false);
            setShowSavedMsg(true);
            setTimeout(() => setShowSavedMsg(false), 3000);
        }, 800);
    };

    const handleChange = (field: keyof UserProfile, value: any) => {
        setProfile(prev => prev ? ({ ...prev, [field]: value }) : null);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">User Profile</h1>
                    <p className="text-muted-foreground mt-1">Manage your personal details and JEE preparation goals.</p>
                </div>
                {showSavedMsg && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20 animate-in fade-in slide-in-from-top-2">
                        <Check className="w-4 h-4" />
                        <span className="text-sm font-bold">Settings Saved</span>
                    </div>
                )}
            </header>

            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Personal Information */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-card p-8 rounded-3xl border border-border shadow-sm space-y-6">
                        <div className="flex items-center gap-2 pb-2 border-b border-border">
                            <User className="w-5 h-5 text-primary" />
                            <h2 className="text-xl font-bold">Personal Information</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-muted-foreground ml-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        value={profile.name || ''}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-muted-foreground ml-1">Username</label>
                                <div className="relative">
                                    <div className="absolute left-3 top-2.5 text-muted-foreground font-bold">@</div>
                                    <input
                                        type="text"
                                        value={profile.username || ''}
                                        onChange={(e) => handleChange('username', e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                        placeholder="username"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-muted-foreground ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="email"
                                        readOnly
                                        value={profile.email || ''}
                                        className="w-full pl-10 pr-4 py-2.5 bg-secondary/30 border border-border rounded-xl text-muted-foreground cursor-not-allowed font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-muted-foreground ml-1">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="tel"
                                        value={profile.phoneNumber || ''}
                                        onChange={(e) => handleChange('phoneNumber', e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                        placeholder="+91 00000 00000"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security */}
                    <div className="bg-card p-8 rounded-3xl border border-border shadow-sm space-y-6">
                        <div className="flex items-center gap-2 pb-2 border-b border-border">
                            <Shield className="w-5 h-5 text-primary" />
                            <h2 className="text-xl font-bold">Security</h2>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl border border-border">
                            <div>
                                <h3 className="font-bold">Password</h3>
                                <p className="text-sm text-muted-foreground">Change your account password</p>
                            </div>
                            <button
                                type="button"
                                className="px-4 py-2 bg-card border border-border rounded-xl text-sm font-bold hover:bg-secondary transition-all"
                            >
                                Change Password
                            </button>
                        </div>
                    </div>
                </div>

                {/* Academic Goals */}
                <div className="space-y-6">
                    <div className="bg-card p-8 rounded-3xl border border-border shadow-sm space-y-6">
                        <div className="flex items-center gap-2 pb-2 border-b border-border">
                            <Trophy className="w-5 h-5 text-primary" />
                            <h2 className="text-xl font-bold">Preparation</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-muted-foreground ml-1">Target Rank</label>
                                <div className="relative">
                                    <Trophy className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="number"
                                        value={profile.targetRank || ''}
                                        onChange={(e) => handleChange('targetRank', parseInt(e.target.value))}
                                        className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                        placeholder="1000"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-muted-foreground ml-1">Target Year</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                    <select
                                        value={profile.targetYear}
                                        onChange={(e) => handleChange('targetYear', parseInt(e.target.value))}
                                        className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium appearance-none"
                                    >
                                        <option value={2025}>2025</option>
                                        <option value={2026}>2026</option>
                                        <option value={2027}>2027</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-muted-foreground ml-1">Daily Study Limit (Hours)</label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="number"
                                        value={profile.dailyHourLimit}
                                        onChange={(e) => handleChange('dailyHourLimit', parseInt(e.target.value))}
                                        className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                        min={1}
                                        max={24}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSaving}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Save className="w-5 h-5" />
                            )}
                            {isSaving ? 'Saving Changes...' : 'Save Profile Settings'}
                        </button>
                    </div>

                    <div className="bg-primary/5 p-6 rounded-3xl border border-primary/20">
                        <p className="text-xs font-medium text-primary leading-relaxed">
                            Your academic goals help our AI Tutor personalize your study roadmap and confidence assessments.
                        </p>
                    </div>
                </div>
            </form>
        </div>
    );
}
