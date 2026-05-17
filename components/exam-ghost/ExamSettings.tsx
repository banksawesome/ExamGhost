"use client";

import { Settings2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

type Difficulty = "Easy" | "Medium" | "Hard";

export function ExamSettings({
  questions,
  setQuestions,
  duration,
  setDuration,
  difficulty,
  setDifficulty,
  voice,
  setVoice,
}: {
  questions: number;
  setQuestions: (v: number) => void;
  duration: number;
  setDuration: (v: number) => void;
  difficulty: Difficulty;
  setDifficulty: (v: Difficulty) => void;
  voice: boolean;
  setVoice: (v: boolean) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Settings2 className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Exam Settings</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Questions */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="font-medium text-foreground">Number of Questions</span>
            <span className="text-xs text-muted-foreground">(5 – 50)</span>
          </div>
          <div className="flex items-center gap-4">
            <Slider
              min={5}
              max={50}
              step={1}
              value={[questions]}
              onValueChange={(v) => setQuestions(v[0])}
              className="flex-1"
            />
            <div className="min-w-[64px] text-center rounded-lg bg-primary/15 text-primary font-semibold py-2 px-3">
              {questions}
            </div>
          </div>
        </div>

        {/* Difficulty */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 font-medium text-foreground">Difficulty Level</div>
          <div className="grid grid-cols-3 gap-2">
            {(["Easy", "Medium", "Hard"] as Difficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`rounded-lg py-2.5 font-medium transition-all cursor-pointer ${
                  difficulty === d
                    ? "bg-primary text-primary-foreground shadow-[var(--shadow-soft-glow)]"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="font-medium text-foreground">Duration</span>
            <span className="text-xs text-muted-foreground">(10 – 180 mins)</span>
          </div>
          <div className="flex items-center gap-4">
            <Slider
              min={10}
              max={180}
              step={5}
              value={[duration]}
              onValueChange={(v) => setDuration(v[0])}
              className="flex-1"
            />
            <div className="min-w-[80px] text-center rounded-lg bg-primary/15 text-primary font-semibold py-2 px-3">
              {duration} mins
            </div>
          </div>
        </div>

        {/* Voice Mode */}
        <div className="rounded-2xl border border-border bg-card p-5 flex flex-col">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-medium text-foreground">Voice Mode</div>
              <p className="text-xs text-muted-foreground mt-1">Read questions and speak answers</p>
            </div>
            <Switch checked={voice} onCheckedChange={setVoice} />
          </div>
        </div>
      </div>
    </div>
  );
}