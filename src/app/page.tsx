"use client";

import React from "react";
import Link from "next/link";
import SignInButton from "@/components/SignInButton";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
    const { data: session } = useSession();
    const router = useRouter();

    // Redirect if already logged in
    React.useEffect(() => {
        if (session) {
            router.push("/dashboard");
        }
    }, [session, router]);

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
            {/* Navigation */}
            <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-100">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <span className="text-xl font-black tracking-tight text-slate-900">JEE MASTER</span>
                    </div>
                    <div className="flex items-center gap-8">
                        <div className="hidden md:flex items-center gap-6 text-sm font-bold text-slate-500">
                            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
                            <a href="#about" className="hover:text-indigo-600 transition-colors">About</a>
                        </div>
                        <SignInButton />
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-40 pb-24 px-6 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-100 rounded-full blur-[120px] opacity-60 animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-100 rounded-full blur-[100px] opacity-40"></div>
                </div>

                <div className="max-w-4xl mx-auto text-center space-y-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 text-xs font-black uppercase tracking-widest animate-bounce">
                        🚀 New features added
                    </div>
                    <h1 className="text-6xl md:text-7xl font-black tracking-tight text-slate-900 leading-[1.1]">
                        Forge Your Success with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">AI Intelligence</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
                        The ultimate companion for JEE aspirants. Master your syllabus, track focus, and get AI-driven insights to crush your exams.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <SignInButton />
                        <a href="#features" className="px-8 py-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl text-sm font-bold transition-all shadow-sm">
                            Explore Features
                        </a>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-24 px-6 bg-white border-y border-slate-200">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-3xl font-black text-slate-900">Prebuilt for High Performance</h2>
                        <p className="text-slate-500 font-medium">Everything you need to stay ahead of the competition.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Syllabus Analysis",
                                desc: "Deep dive into your progress with visual heatmaps and topic-wise breakdown.",
                                icon: (
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                )
                            },
                            {
                                title: "Daily Roadmap",
                                desc: "Automatically generated study schedules tailored to your current mastery level.",
                                icon: (
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                )
                            },
                            {
                                title: "AI Chat Assistant",
                                desc: "Stuck on a concept? Your personalized Gemini-powered tutor is here to help 24/7.",
                                icon: (
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                    </svg>
                                )
                            }
                        ].map((feature, i) => (
                            <div key={i} className="group p-8 bg-slate-50 border border-slate-200 rounded-3xl hover:bg-white hover:shadow-xl hover:shadow-indigo-50 hover:-translate-y-2 transition-all duration-300">
                                <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                                <p className="text-slate-600 font-medium leading-relaxed">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 bg-slate-900 text-white">
                <div className="max-w-7xl mx-auto flex flex-col md:row justify-between items-center gap-8">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-600 p-2 rounded-lg">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <span className="text-lg font-black tracking-tight">JEE MASTER</span>
                    </div>
                    <p className="text-slate-400 text-sm font-bold">© 2026 Idea Forge. Built for Excellence.</p>
                </div>
            </footer>
        </div>
    );
}
