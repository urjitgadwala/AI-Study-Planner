"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
    const { setTheme, theme } = useTheme();

    return (
        <div className="flex items-center bg-secondary/50 p-1 rounded-xl border border-border">
            <button
                onClick={() => setTheme("light")}
                className={`p-1.5 rounded-lg transition-all ${theme === "light"
                        ? "bg-card text-primary shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                aria-label="Light theme"
            >
                <Sun className="h-4 w-4" />
            </button>
            <button
                onClick={() => setTheme("dark")}
                className={`p-1.5 rounded-lg transition-all ${theme === "dark"
                        ? "bg-card text-primary shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                aria-label="Dark theme"
            >
                <Moon className="h-4 w-4" />
            </button>
        </div>
    );
}
