"use client";

import { motion } from "framer-motion";
import { Target, Clock, TrendingUp, BarChart, Radar, Flame, Bookmark, X, FileText, Calendar, User, Sliders, Bell, AlertTriangle, Search, Play } from "lucide-react";
import { BarChart as ReBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar as ReRadar, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { PageShell } from "@/components/exam-ghost/PageShell";
import { PageHeader } from "@/components/exam-ghost/PageHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect } from "react";

interface AnalyticsAPIData {
  stats?: { accuracy: number; avgTime: number; improvement: number };
  bySubject?: { subject: string; score: number }[];
  skills?: { skill: string; value: number }[];
  weakTopics?: { topic: string; pct: number }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsAPIData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => res.json())
      .then((apiData) => {
        setData({
          stats: apiData.stats || { accuracy: 78, avgTime: 42, improvement: 12 },
          bySubject: apiData.bySubject || [
            { subject: "Physics", score: 72 },
            { subject: "Math", score: 65 },
            { subject: "Chemistry", score: 88 },
            { subject: "Biology", score: 70 },
            { subject: "English", score: 81 },
          ],
          skills: apiData.skills || [
            { skill: "Recall", value: 78 },
            { skill: "Analysis", value: 65 },
            { skill: "Application", value: 82 },
            { skill: "Speed", value: 70 },
            { skill: "Accuracy", value: 88 },
          ],
          weakTopics: apiData.weakTopics || [
            { topic: "Thermodynamics", pct: 42 },
            { topic: "Probability", pct: 51 },
            { topic: "Organic Reactions", pct: 58 },
          ],
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !data) return <PageShell><div className="text-foreground">Loading...</div></PageShell>;

  const stats = [
    { icon: Target, label: "Accuracy", value: `${data.stats!.accuracy}%`, color: "text-primary", bg: "bg-primary/15" },
    { icon: Clock, label: "Avg time / question", value: `${data.stats!.avgTime}s`, color: "text-warning", bg: "bg-warning/15" },
    { icon: TrendingUp, label: "Improvement", value: `+${data.stats!.improvement}%`, color: "text-success", bg: "bg-success/15" },
  ];

  const bySubject = data.bySubject!;
  const skills = data.skills!;
  const weak = data.weakTopics!;

  return (
    <PageShell>
      <div className="flex flex-col gap-6">
        <PageHeader title="Analytics" subtitle="Spot patterns, fix weaknesses, level up faster." />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl border border-border bg-card p-5 flex items-center gap-4"
              >
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${s.bg} ${s.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-semibold text-foreground mb-4">Scores by subject</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={bySubject}>
                  <XAxis dataKey="subject" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }} />
                  <Bar dataKey="score" fill="var(--primary)" radius={[8, 8, 0, 0]} />
                </ReBarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-semibold text-foreground mb-4">Skill breakdown</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={skills}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="skill" stroke="var(--muted-foreground)" fontSize={12} />
                  <ReRadar dataKey="value" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="font-semibold text-foreground mb-4">Weakest topics</h3>
          <ul className="space-y-4">
            {weak.map((w) => (
              <li key={w.topic}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-foreground font-medium">{w.topic}</span>
                  <span className="text-danger font-semibold">{w.pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${w.pct}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-[image:linear-gradient(90deg,var(--danger),var(--warning))]"
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </PageShell>
  );
}