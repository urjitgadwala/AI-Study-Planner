"use client";

import Link from "next/link";
import React from "react";

const Navbar = () => {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center gap-2">
                        <div className="bg-indigo-600 p-1.5 rounded-lg">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <Link href="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                            IDEA FORGE
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        <Link href="#features" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
                            Features
                        </Link>
                        <Link href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
                            How it Works
                        </Link>
                        <Link href="#pricing" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
                            Pricing
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link href="/auth/signin" className="text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-colors">
                            Sign In
                        </Link>
                        <Link
                            href="/auth/signup"
                            className="bg-indigo-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
