"use client";

import { motion } from "framer-motion";
import { FileText, TrendingUp, Trophy, Flame, Play, PieChart } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart as RePieChart, Pie, Cell } from "recharts";
import { PageShell } from "@/components/exam-ghost/PageShell";
import { PageHeader } from "@/components/exam-ghost/PageHeader";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Track your exam performance, view analytics, and continue where you left off.',
  robots: { index: true, follow: true },
}

interface AnalyticsData {
  totalExamsCompleted: number;
  averageScore: number;
  progressHistory: { day: string; score: number }[];
  subjectMix: { name: string; value: number; color: string }[];
  continueExams: { title: string; progress: string; color: string }[];
  userName: string;
}

export default function DashboardPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => res.json())
      .then((apiData) => {
        const name = localStorage.getItem("examghost:name") || "Student";
setData({
           totalExamsCompleted: apiData.totalExamsCompleted || 0,
           averageScore: apiData.averageScore || 0,
           progressHistory: apiData.progressHistory?.length
             ? apiData.progressHistory
             : [],
           subjectMix: apiData.subjectMix?.length
             ? apiData.subjectMix
             : [],
           continueExams: apiData.recentAttempts?.length
             ? apiData.recentAttempts.map((a: any) => ({
                 title: `Exam ${a.id} — ${a.percentage}%`,
                 progress: `${a.score} / ${a.total}`,
                 color: a.percentage >= 70 ? "text-success" : a.percentage >= 50 ? "text-warning" : "text-danger",
               }))
             : [],
           userName: name,
         });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !data) return <PageShell><div className="text-foreground">Loading...</div></PageShell>;

const kpis = [
     { icon: FileText, label: "Total Exams", value: data.totalExamsCompleted.toString(), color: "text-primary", bg: "bg-primary/15" },
     { icon: TrendingUp, label: "Avg Score", value: `${data.averageScore}%`, color: "text-success", bg: "bg-success/15" },
     { icon: Trophy, label: "Best Score", value: "0%", color: "text-warning", bg: "bg-warning/15" },
     { icon: Flame, label: "Streak", value: "0d", color: "text-danger", bg: "bg-danger/15" },
   ];

  return (
    <PageShell>
      <div className="flex flex-col gap-8">
        <PageHeader title={<>Welcome back, <span className="bg-[image:var(--gradient-primary)] bg-clip-text text-transparent">{data.userName}</span></>} subtitle="Here's how your exam prep is going this week." />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((k, i) => {
            const Icon = k.icon;
            return (
              <motion.div
                key={k.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 ${k.bg} ${k.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-2xl font-bold text-foreground">{k.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{k.label}</div>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2 rounded-2xl border border-border bg-card p-5">
            <h3 className="font-semibold text-foreground mb-4">Weekly Performance</h3>
<div className="h-64">
               {data.progressHistory.length === 0 ? (
                 <div className="h-full flex items-center justify-center text-muted-foreground">Not Available</div>
               ) : (
                 <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={data.progressHistory}>
                     <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
                     <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                     <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }} />
                     <Line type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, fill: "var(--primary)" }} />
                   </LineChart>
                 </ResponsiveContainer>
               )}
             </div>
          </motion.div>

<motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="rounded-2xl border border-border bg-card p-5">
             <h3 className="font-semibold text-foreground mb-4">Topic Mix</h3>
             <div className="h-48">
               {data.subjectMix.length === 0 ? (
                 <div className="h-full flex items-center justify-center text-muted-foreground">Not Available</div>
               ) : (
                 <ResponsiveContainer width="100%" height="100%">
                   <RePieChart>
                     <Pie data={data.subjectMix} dataKey="value" innerRadius={45} outerRadius={70} paddingAngle={3}>
                       {data.subjectMix.map((s) => <Cell key={s.name} fill={s.color} stroke="none" />)}
                     </Pie>
                   </RePieChart>
                 </ResponsiveContainer>
               )}
             </div>
             <ul className="space-y-2 mt-2">
               {data.subjectMix.map((s) => (
                 <li key={s.name} className="flex items-center justify-between text-sm">
                   <span className="flex items-center gap-2 text-muted-foreground">
                     <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                     {s.name}
                   </span>
                   <span className="text-foreground font-medium">{s.value}%</span>
                 </li>
               ))}
             </ul>
           </motion.div>
        </div>

<motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-2xl border border-border bg-card p-5">
           <h3 className="font-semibold text-foreground mb-4">Continue where you left off</h3>
           {data.continueExams.length === 0 ? (
             <div className="text-muted-foreground">Not Available</div>
           ) : (
             <ul className="space-y-3">
               {data.continueExams.map((c) => (
                 <li key={c.title} className="flex items-center justify-between p-3 rounded-xl bg-muted/40">
                   <div>
                     <div className="font-medium text-foreground">{c.title}</div>
                     <div className={`text-xs ${c.color}`}>{c.progress}</div>
                   </div>
                   <Button size="sm" className="bg-[image:var(--gradient-primary)] text-primary-foreground cursor-pointer">
                     <Play className="h-4 w-4 mr-1" /> Resume
                   </Button>
                 </li>
               ))}
             </ul>
           )}
         </motion.div>
      </div>
    </PageShell>
  );
}