"use client";

import { Moon, Sun, BarChart3, ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export function Header({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();
  const [userName, setUserName] = useState("Aditya Verma");
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const name = localStorage.getItem("examghost:name");
    if (name) setUserName(name);
  }, []);

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <button
          aria-label="Toggle theme"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center text-foreground cursor-pointer hover:bg-accent transition-colors"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>
        <Avatar className="h-10 w-10 bg-primary">
          <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
            {userName.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-5">
      <div className="flex items-center gap-4">
        <button
          aria-label="Toggle theme"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="h-11 w-11 rounded-full bg-card border border-border flex items-center justify-center text-foreground hover:bg-accent transition-colors cursor-pointer"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>
        <div className="flex items-center gap-3">
          <Avatar className="h-11 w-11 bg-primary">
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
              {userName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="leading-tight">
            <div className="font-semibold text-foreground flex items-center gap-1">
              {userName} <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-xs text-muted-foreground">Student</div>
          </div>
        </div>
      </div>
      <Button asChild variant="outline" className="rounded-xl border-primary/40 text-primary hover:bg-primary/10 hover:text-primary cursor-pointer">
        <Link href="/analytics">
          <BarChart3 className="h-4 w-4 mr-2" />
          View Analytics
        </Link>
      </Button>
    </div>
  );
}