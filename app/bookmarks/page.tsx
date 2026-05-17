"use client";

import { motion } from "framer-motion";
import { Bookmark, X } from "lucide-react";
import { PageShell } from "@/components/exam-ghost/PageShell";
import { PageHeader } from "@/components/exam-ghost/PageHeader";
import { useState } from "react";

const initial = [
  { id: 1, subject: "Physics", difficulty: "Hard", q: "A 2 kg block slides down a 30° incline with friction coefficient 0.2. Find the acceleration." },
  { id: 2, subject: "Math", difficulty: "Medium", q: "Evaluate the integral of x·sin(x) dx using integration by parts." },
  { id: 3, subject: "Chemistry", difficulty: "Easy", q: "Identify the product of the reaction between ethene and HBr." },
  { id: 4, subject: "Physics", difficulty: "Medium", q: "State and derive the lens maker's formula." },
  { id: 5, subject: "Math", difficulty: "Hard", q: "Prove that the sum of the first n cubes equals the square of the sum of the first n integers." },
];

const subjects = ["All", "Physics", "Math", "Chemistry"] as const;
const diffColors: Record<string, string> = {
  Easy: "bg-success/15 text-success",
  Medium: "bg-warning/15 text-warning",
  Hard: "bg-danger/15 text-danger",
};

export default function BookmarksPage() {
  const [items, setItems] = useState(initial);
  const [filter, setFilter] = useState<(typeof subjects)[number]>("All");

  const list = items.filter((i) => filter === "All" || i.subject === filter);

  return (
    <PageShell>
      <div className="flex flex-col gap-6">
        <PageHeader title="Bookmarks" subtitle="Questions you saved to revisit later." />

        <div className="flex gap-2 flex-wrap">
          {subjects.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 h-10 rounded-xl font-medium transition-colors cursor-pointer ${
                filter === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:text-foreground border border-border"
              }`}
            >
              {s}
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
                    <span className="text-xs px-2 py-1 rounded-md bg-primary/15 text-primary font-medium">{it.subject}</span>
                    <span className={`text-xs px-2 py-1 rounded-md font-medium ${diffColors[it.difficulty]}`}>{it.difficulty}</span>
                  </div>
                  <button
                    onClick={() => setItems((prev) => prev.filter((p) => p.id !== it.id))}
                    aria-label="Remove bookmark"
                    className="h-8 w-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-foreground leading-relaxed">{it.q}</p>
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