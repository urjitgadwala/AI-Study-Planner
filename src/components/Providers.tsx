"use client";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import React from "react";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="light">
            <SessionProvider>
                {children}
            </SessionProvider>
        </ThemeProvider>
    );
}
