"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BarChart3, Trophy, Bot, Plus, Download, Trash2, Settings, ChevronDown, LayoutGrid } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import SignInButton from "@/components/SignInButton";
import { useSession } from "next-auth/react";
import { db } from "@/lib/db";
import TopicDeleteModal from "@/components/TopicDeleteModal";
import TopicInput from "@/components/TopicInput";
import PdfImportModal from "@/components/PdfImportModal";
import { Topic, StudentMastery } from "@/lib/types";
import { generateDailyTimetable } from "@/lib/scheduler";
import GeminiChat from "@/components/GeminiChat";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = React.useState(false);
    const pathname = usePathname();
    const { data: session } = useSession();
    const userId = session?.user?.email || 'default_user';
    const [showDeleteModal, setShowDeleteModal] = React.useState(false);
    const [showSyllabusMenu, setShowSyllabusMenu] = React.useState(false);
    const [showTopicInput, setShowTopicInput] = React.useState(false);
    const [showPdfImport, setShowPdfImport] = React.useState(false);
    const [topics, setTopics] = React.useState<Topic[]>([]);
    const [mastery, setMastery] = React.useState<StudentMastery[]>([]);

    React.useEffect(() => {
        setMounted(true);
        setTopics(db.getTopics(userId));
        setMastery(db.getMastery(userId));
    }, [userId]);

    if (!mounted) {
        return <div className="min-h-screen bg-background" />;
    }

    const profile = db.getProfile(userId);

    const navItems = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Progress", href: "/dashboard/progress", icon: BarChart3 },
        { name: "Points", href: "/dashboard/points", icon: Trophy },
        { name: "AI Tutor", href: "/dashboard/tutor", icon: Bot },
    ];

    return (
        <div className="min-h-screen bg-background transition-colors duration-300">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full bg-card/80 backdrop-blur-md border-b border-border px-6 py-3">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link href="/dashboard" className="flex items-center gap-2">
                            <div className="bg-primary p-1.5 rounded-lg">
                                <LayoutDashboard className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-foreground">JEE MASTER</span>
                        </Link>

                        <nav className="hidden md:flex items-center bg-secondary/50 p-1 rounded-xl">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${isActive
                                            ? "bg-card text-foreground shadow-sm"
                                            : "text-muted-foreground hover:text-foreground"
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden lg:flex items-center gap-2 mr-2">
                            <button
                                onClick={() => setShowPdfImport(true)}
                                title="Import Syllabus from PDF"
                                className="p-2.5 bg-secondary text-foreground rounded-xl hover:bg-secondary/80 transition-all border border-border shadow-sm group"
                            >
                                <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </button>

                            {/* Combined Syllabus Manager Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowSyllabusMenu(!showSyllabusMenu)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all shadow-sm ${showSyllabusMenu
                                        ? "bg-primary text-white border-primary"
                                        : "bg-secondary text-foreground border-border hover:bg-secondary/80"
                                        }`}
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                    Manage Topics
                                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showSyllabusMenu ? "rotate-180" : ""}`} />
                                </button>

                                {showSyllabusMenu && (
                                    <>
                                        {/* Click outside backdrop */}
                                        <div className="fixed inset-0 z-10" onClick={() => setShowSyllabusMenu(false)} />

                                        {/* Dropdown Menu */}
                                        <div className="absolute right-0 mt-2 w-48 bg-card/95 backdrop-blur-md border border-border rounded-2xl shadow-xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="p-1.5 space-y-1">
                                                <button
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-foreground hover:bg-secondary/80 rounded-xl transition-all"
                                                    onClick={() => {
                                                        setShowSyllabusMenu(false);
                                                        setShowTopicInput(true);
                                                    }}
                                                >
                                                    <div className="p-1.5 bg-primary/10 text-primary rounded-lg">
                                                        <Plus className="w-4 h-4" />
                                                    </div>
                                                    Add Topics
                                                </button>
                                                <button
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                                    onClick={() => {
                                                        setShowSyllabusMenu(false);
                                                        setShowDeleteModal(true);
                                                    }}
                                                >
                                                    <div className="p-1.5 bg-red-500/10 text-red-500 rounded-lg">
                                                        <Trash2 className="w-4 h-4" />
                                                    </div>
                                                    Delete Topics
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="hidden sm:flex flex-col items-end mr-2">
                            <span className="text-sm font-bold text-primary">{profile?.currentXP || 0} XP</span>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Streak: {profile?.streakCount || 0} Days</span>
                        </div>

                        <ThemeToggle />
                        <SignInButton />

                        <Link
                            href="/dashboard/profile"
                            className="w-10 h-10 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary font-bold hover:bg-primary/20 transition-all"
                        >
                            {session?.user?.name?.slice(0, 2).toUpperCase() || "GU"}
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {children}
            </main>

            {/* Topic Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-6 pb-20 overflow-y-auto">
                    <div className="max-w-2xl w-full">
                        <TopicDeleteModal
                            topics={topics}
                            userId={userId}
                            onCancel={() => setShowDeleteModal(false)}
                            onTopicsDeleted={() => {
                                setTopics(db.getTopics(userId));
                                setShowDeleteModal(false);
                                window.location.reload();
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Topic Input Modal */}
            {showTopicInput && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
                    <div className="w-full max-w-xl">
                        <TopicInput
                            onTopicsAdded={(newTopics) => {
                                const currentTopics = db.getTopics(userId);
                                const updatedUserTopics = [...currentTopics.filter(t => t.id.startsWith('u_')), ...newTopics];
                                db.saveTopics(updatedUserTopics, userId);
                                setTopics(db.getTopics(userId));
                                setShowTopicInput(false);
                                window.location.reload();
                            }}
                            onCancel={() => setShowTopicInput(false)}
                        />
                    </div>
                </div>
            )}

            {/* PDF Import Modal */}
            {showPdfImport && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
                    <div className="w-full max-w-xl">
                        <PdfImportModal
                            onTopicsAdded={(newTopics) => {
                                const currentTopics = db.getTopics(userId);
                                const updatedUserTopics = [...currentTopics.filter(t => t.id.startsWith('u_')), ...newTopics];
                                db.saveTopics(updatedUserTopics, userId);
                                setTopics(db.getTopics(userId));
                                setShowPdfImport(false);
                                window.location.reload();
                            }}
                            onCancel={() => setShowPdfImport(false)}
                        />
                    </div>
                </div>
            )}
            {pathname !== "/dashboard/tutor" && (
                <GeminiChat topics={topics} mastery={mastery} mode="floating" />
            )}
        </div>
    );
}
