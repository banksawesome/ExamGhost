"use client";

import { motion } from "framer-motion";
import { FileText, TrendingUp, Trophy, ArrowUp, Lightbulb, Quote } from "lucide-react";
import { CircularProgress } from "./CircularProgress";
import { useEffect, useState } from "react";

interface AnalyticsData {
  totalExamsCompleted: number;
  averageScore: number;
  recentAttempts?: { id: string; examId: string; score: number; total: number; percentage: string }[];
  weakTopics?: string[];
}

export function ProgressPanel() {
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => res.json())
      .then((apiData) => {
        setData({
          totalExamsCompleted: apiData.totalExamsCompleted || 0,
          averageScore: apiData.averageScore || 0,
          recentAttempts: apiData.recentAttempts || [],
          weakTopics: apiData.weakTopics || [],
        });
      })
      .catch(() => setData(null));
  }, []);

  const stats = data
    ? [
        { icon: FileText, label: "Total Exams", value: data.totalExamsCompleted.toString(), color: "text-primary" },
        { icon: TrendingUp, label: "Average Score", value: `${data.averageScore}%`, color: "text-success" },
        { icon: Trophy, label: "Best Score", value: data.recentAttempts && data.recentAttempts.length > 0 ? `${Math.max(...data.recentAttempts.map(a => parseFloat(a.percentage)))}%` : "0%", color: "text-warning" },
      ]
    : [
        { icon: FileText, label: "Total Exams", value: "0", color: "text-primary" },
        { icon: TrendingUp, label: "Average Score", value: "0%", color: "text-success" },
        { icon: Trophy, label: "Best Score", value: "0%", color: "text-warning" },
      ];

  // Calculate improvement from previous week vs this week
  const improvement = data?.recentAttempts && data.recentAttempts.length >= 2
    ? (() => {
        const scores = data.recentAttempts!.map(a => parseFloat(a.percentage));
        const recent = scores.slice(0, Math.ceil(scores.length / 2));
        const older = scores.slice(Math.ceil(scores.length / 2));
        if (recent.length === 0 || older.length === 0) return 0;
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
        return Math.round(recentAvg - olderAvg);
      })()
    : 0;

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
               {improvement > 0 ? `${improvement}%` : "0%"}
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
         {data?.recentAttempts && data.recentAttempts.length > 0 ? (
           <ul className="flex flex-col gap-4">
             {data.recentAttempts.slice(0, 3).map((attempt, i) => (
               <motion.li
                 key={attempt.id}
                 initial={{ opacity: 0, y: 8 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.15 * i }}
                 className="flex items-center justify-between gap-3"
               >
                 <div className="flex items-center gap-3 min-w-0">
                   <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 bg-primary/15 text-primary">
                     <FileText className="h-5 w-5" />
                   </div>
                   <div className="min-w-0">
                     <div className="font-medium text-foreground truncate">Exam {attempt.id.slice(0, 8)}</div>
                     <div className="text-xs text-muted-foreground">{attempt.score}/{attempt.total} correct</div>
                   </div>
                 </div>
                 <CircularProgress value={parseFloat(attempt.percentage)} color="var(--primary)" />
               </motion.li>
             ))}
           </ul>
         ) : (
           <div className="text-muted-foreground text-center py-4">No recent activity</div>
         )}
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