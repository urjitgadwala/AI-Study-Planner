"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import React from "react";
import { LogIn, LogOut } from "lucide-react";

export default function SignInButton() {
    const { data: session } = useSession();

    if (session && session.user) {
        return (
            <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="p-2 rounded-xl bg-secondary text-foreground hover:bg-secondary/80 transition-all border border-border"
                title="Sign Out"
            >
                <LogOut className="w-5 h-5" />
            </button>
        );
    }

    return (
        <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-sm"
        >
            <LogIn className="w-4 h-4" />
            Sign In
        </button>
    );
}
