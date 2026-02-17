"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function SignInPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        // Mock authentication
        setTimeout(() => {
            if (email === "demo@example.com" || email === "swapnil") {
                router.push("/dashboard");
            } else if (email && password) {
                // Any email/password combination for demo purposes
                router.push("/dashboard");
            } else {
                setError("Please enter your credentials.");
                setIsLoading(false);
            }
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center flex-col items-center gap-4">
                    <Link href="/" className="bg-indigo-600 p-3 rounded-2xl shadow-xl shadow-indigo-100">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </Link>
                    <h2 className="text-center text-3xl font-black text-slate-900 tracking-tight">
                        Sign in to IDEA FORGE
                    </h2>
                    <p className="text-center text-sm font-bold text-slate-500 uppercase tracking-widest">
                        Level up your JEE preparation
                    </p>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
                <div className="bg-white py-10 px-8 shadow-2xl shadow-slate-200/50 rounded-[32px] border border-slate-100">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-2">
                                Email / Username
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="text"
                                required
                                className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-bold text-slate-700 mb-2">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                {error}
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded transition-all"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600 font-bold">
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm">
                                <a href="#" className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
                                    Forgot password?
                                </a>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-lg shadow-indigo-100 text-lg font-black text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-70"
                            >
                                {isLoading ? (
                                    <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    "Sign In"
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-100"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-slate-500 font-bold uppercase tracking-widest text-xs">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-4">
                            <button
                                onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                                className="flex justify-center items-center py-3 px-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-sm font-bold text-slate-700 bg-white"
                            >
                                Google
                            </button>
                            <button className="flex justify-center items-center py-3 px-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-sm font-bold text-slate-700 bg-white">
                                GitHub
                            </button>
                        </div>
                    </div>
                </div>

                <p className="mt-8 text-center text-sm text-slate-600 font-bold">
                    Don't have an account?{" "}
                    <Link href="#" className="font-black text-indigo-600 hover:text-indigo-500">
                        Sign up for free
                    </Link>
                </p>
            </div>
        </div>
    );
}
