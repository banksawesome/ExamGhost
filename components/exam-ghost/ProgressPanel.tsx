"use client";

import { motion } from "framer-motion";
import { FileText, TrendingUp, Trophy, ArrowUp, Lightbulb, Quote } from "lucide-react";
import { CircularProgress } from "./CircularProgress";
import { useEffect, useState } from "react";

interface AnalyticsData {
  totalExamsCompleted: number;
  averageScore: number;
  recentAttempts?: { id: string; score: number; total: number; percentage: string }[];
}

const activity = [
  { title: "Physics – Mechanics", meta: "20 Questions • 60 mins", pct: 72, color: "oklch(0.7 0.18 30)", iconBg: "bg-danger/15 text-danger" },
  { title: "Math – Calculus", meta: "15 Questions • 45 mins", pct: 65, color: "var(--primary)", iconBg: "bg-primary/15 text-primary" },
  { title: "Chemistry – Organic", meta: "25 Questions • 75 mins", pct: 88, color: "oklch(0.72 0.18 155)", iconBg: "bg-success/15 text-success" },
];

export function ProgressPanel() {
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => res.json())
      .then((apiData) => {
        setData({
          totalExamsCompleted: apiData.totalExamsCompleted || 12,
          averageScore: apiData.averageScore || 68,
          recentAttempts: apiData.recentAttempts || [],
        });
      })
      .catch(() => setData(null));
  }, []);

  const stats = data
    ? [
        { icon: FileText, label: "Total Exams", value: data.totalExamsCompleted.toString(), color: "text-primary" },
        { icon: TrendingUp, label: "Average Score", value: `${data.averageScore}%`, color: "text-success" },
        { icon: Trophy, label: "Best Score", value: "92%", color: "text-warning" },
      ]
    : [
        { icon: FileText, label: "Total Exams", value: "12", color: "text-primary" },
        { icon: TrendingUp, label: "Average Score", value: "68%", color: "text-success" },
        { icon: Trophy, label: "Best Score", value: "92%", color: "text-warning" },
      ];

  return (
    <div className="flex flex-col gap-5">
      {/* Your Progress */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl border border-border bg-card p-5"
      >
        <h3 className="font-semibold text-foreground mb-4">Your Progress</h3>
        <ul className="flex flex-col gap-4">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.li
                key={s.label}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${s.color}`} />
                  <span className="text-muted-foreground">{s.label}</span>
                </div>
                <span className="font-bold text-foreground">{s.value}</span>
              </motion.li>
            );
          })}
          <motion.li
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-success" />
              <div>
                <div className="text-muted-foreground">Improvement</div>
                <div className="text-xs text-muted-foreground/70">vs last 7 days</div>
              </div>
            </div>
            <span className="text-success font-bold flex items-center gap-1">
              <ArrowUp className="h-3 w-3" />
              12%
            </span>
          </motion.li>
        </ul>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="rounded-2xl border border-border bg-card p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Recent Activity</h3>
          <button className="text-xs text-primary hover:underline cursor-pointer">View all</button>
        </div>
        <ul className="flex flex-col gap-4">
          {activity.map((a, i) => (
            <motion.li
              key={a.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 * i }}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${a.iconBg}`}>
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-foreground truncate">{a.title}</div>
                  <div className="text-xs text-muted-foreground">{a.meta}</div>
                </div>
              </div>
              <CircularProgress value={a.pct} color={a.color} />
            </motion.li>
          ))}
        </ul>
      </motion.div>

      {/* Tip of the day */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="rounded-2xl border border-border bg-card p-5 relative"
      >
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="h-5 w-5 text-warning" />
          <h3 className="font-semibold text-foreground">Tip of the Day</h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Review your incorrect answers to improve 2x faster!
        </p>
        <Quote className="absolute bottom-3 right-4 h-5 w-5 text-muted-foreground/40" />
      </motion.div>
    </div>
  );
}