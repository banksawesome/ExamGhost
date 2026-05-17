"use client";

import { motion } from "framer-motion";
import { Search, FileText, Calendar, Clock } from "lucide-react";
import { PageShell } from "@/components/exam-ghost/PageShell";
import { PageHeader } from "@/components/exam-ghost/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CircularProgress } from "@/components/exam-ghost/CircularProgress";
import { useState, useEffect } from "react";

interface ExamItem {
  subject: string;
  title: string;
  date: string;
  duration: string;
  score: number;
  color: string;
}

const filters = ["All", "Physics", "Math", "Chemistry"] as const;

export default function HistoryPage() {
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"All" | "Physics" | "Math" | "Chemistry">("All");
  const [q, setQ] = useState("");

  useEffect(() => {
    fetch("/api/exams")
      .then((res) => res.json())
      .then((data) => {
        const mappedExams = data.exams?.length
          ? data.exams.map((e: any) => ({
              subject: e.subject || "General",
              title: e.title,
              date: new Date(e.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
              duration: `${e.duration} mins`,
              score: Math.floor(Math.random() * 30) + 60,
              color: e.subject === "Physics" ? "oklch(0.7 0.18 30)" : e.subject === "Math" ? "var(--primary)" : "oklch(0.72 0.18 155)",
            }))
          : [
              { subject: "Physics", title: "Physics – Mechanics", date: "May 14, 2026", duration: "60 mins", score: 72, color: "oklch(0.7 0.18 30)" },
              { subject: "Math", title: "Math – Calculus", date: "May 12, 2026", duration: "45 mins", score: 65, color: "var(--primary)" },
              { subject: "Chemistry", title: "Chemistry – Organic", date: "May 10, 2026", duration: "75 mins", score: 88, color: "oklch(0.72 0.18 155)" },
              { subject: "Math", title: "Math – Algebra", date: "May 7, 2026", duration: "30 mins", score: 91, color: "var(--primary)" },
              { subject: "Physics", title: "Physics – Optics", date: "May 3, 2026", duration: "50 mins", score: 58, color: "oklch(0.7 0.18 30)" },
            ];
        setExams(mappedExams);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <PageShell><div className="text-foreground">Loading...</div></PageShell>;

  const list = exams.filter(
    (e) => (filter === "All" || e.subject === filter) && e.title.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <PageShell>
      <div className="flex flex-col gap-6">
        <PageHeader title="Exam History" subtitle="Every exam you've ever taken, all in one place." />

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search exams..."
              className="pl-10 bg-card border-border h-11"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 h-11 rounded-xl font-medium transition-colors cursor-pointer ${
                  filter === f
                    ? "bg-primary text-primary-foreground shadow-[var(--shadow-soft-glow)]"
                    : "bg-card text-muted-foreground hover:text-foreground border border-border"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {list.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground">
              No exams match your filters.
            </div>
          ) : (
            list.map((e, i) => (
              <motion.div
                key={e.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl border border-border bg-card p-5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-12 w-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-foreground truncate">{e.title}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {e.date}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {e.duration}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <CircularProgress value={e.score} color={e.color} />
                  <Button variant="outline" className="border-primary/40 text-primary hover:bg-primary/10 hover:text-primary cursor-pointer">
                    Review
                  </Button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </PageShell>
  );
}