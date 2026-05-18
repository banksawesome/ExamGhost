"use client";

import { motion } from "framer-motion";
import { Bookmark, X } from "lucide-react";
import { PageShell } from "@/components/exam-ghost/PageShell";
import { PageHeader } from "@/components/exam-ghost/PageHeader";
import { useEffect, useState } from "react";
import type { Bookmark as BookmarkType } from "@/types";

const topics = ["All", "Physics", "Math", "Chemistry"] as const;
const diffColors: Record<string, string> = {
  Easy: "bg-success/15 text-success",
  Medium: "bg-warning/15 text-warning",
  Hard: "bg-danger/15 text-danger",
};

export default function BookmarksPage() {
  const [items, setItems] = useState<BookmarkType[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<(typeof topics)[number]>("All");

  useEffect(() => {
    fetch("/api/bookmarks")
      .then((res) => res.json())
      .then((data) => {
        setItems(data.bookmarks || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const list = items.filter((i) => filter === "All" || i.examTitle.toLowerCase().includes(filter.toLowerCase()));

  const handleDelete = async (id: string) => {
    await fetch(`/api/bookmarks?id=${id}`, { method: 'DELETE' });
    setItems((prev) => prev.filter((p) => p.id !== id));
  };

  if (loading) {
    return (
      <PageShell>
        <div className="text-muted-foreground">Loading bookmarks...</div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="flex flex-col gap-6">
        <PageHeader title="Bookmarks" subtitle="Questions you saved to revisit later." />

        <div className="flex gap-2 flex-wrap">
          {topics.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-4 h-10 rounded-xl font-medium transition-colors cursor-pointer ${
                filter === t
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:text-foreground border border-border"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center flex flex-col items-center gap-4">
            <img src="/ghost-mascot.png" alt="" width={120} height={120} className="h-28 w-28 opacity-80" />
            <p className="text-muted-foreground">No bookmarks here yet. Tap the bookmark icon on any question to save it.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {list.map((it, i) => (
              <motion.div
                key={it.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-md bg-primary/15 text-primary font-medium">{it.examTitle}</span>
                    <span className={`text-xs px-2 py-1 rounded-md font-medium ${diffColors[it.difficulty]}`}>{it.difficulty}</span>
                  </div>
                  <button
                    onClick={() => handleDelete(it.id)}
                    aria-label="Remove bookmark"
                    className="h-8 w-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-foreground leading-relaxed">{it.questionText}</p>
                <div className="flex items-center gap-2 text-xs text-primary mt-auto">
                  <Bookmark className="h-4 w-4 fill-current" /> Saved
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}