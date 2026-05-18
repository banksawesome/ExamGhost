'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  X,
  Clock,
  Target,
  Trophy,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Share2,
  Download,
  Sparkles,
} from 'lucide-react';
import { PageShell } from '@/components/exam-ghost/PageShell';
import { PageHeader } from '@/components/exam-ghost/PageHeader';
import { CircularProgress } from '@/components/exam-ghost/CircularProgress';
import { Button } from '@/components/ui/button';

interface Feedback {
  questionIndex: number;
  questionText: string;
  selectedAnswer: number;
  options: string[];
  correctAnswer: number;
  isCorrect: boolean;
  explanation?: string;
}

interface AttemptResult {
  attemptId: string;
  examId: string;
  examTitle: string;
  difficulty: string;
  score: number;
  total: number;
  percentage: number | string;
  timeTaken: number;
  completedAt: number;
  feedback: Feedback[];
}

type Filter = 'all' | 'correct' | 'wrong' | 'flagged';

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.attemptId as string;

  const [result, setResult] = useState<AttemptResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [expanded, setExpanded] = useState<Set<number>>(new Set([0]));

  useEffect(() => {
    fetch(`/api/attempts/${attemptId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setResult(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError((err as Error).message);
        setLoading(false);
      });
  }, [attemptId]);

  if (loading) {
    return (
      <PageShell fullscreen>
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading results...</div>
        </div>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell fullscreen>
        <div className="rounded-lg bg-destructive/10 p-4 text-destructive text-center space-y-4">
          <p className="font-medium">{error}</p>
          <Button onClick={() => router.push('/')}>Back to Home</Button>
        </div>
      </PageShell>
    );
  }

  if (!result) return null;

  const mm = String(Math.floor(result.timeTaken / 60)).padStart(2, '0');
  const ss = String(result.timeTaken % 60).padStart(2, '0');

  const rawPercentage = result.percentage;
  const percentage = typeof rawPercentage === 'string' ? parseFloat(rawPercentage) : rawPercentage;

  const grade =
    percentage >= 90
      ? { label: 'Excellent', tone: 'text-success', msg: 'Outstanding performance — you\'re exam-ready.' }
      : percentage >= 70
      ? { label: 'Great', tone: 'text-primary', msg: 'Solid grasp. A bit more practice will push you to mastery.' }
      : percentage >= 50
      ? { label: 'Good', tone: 'text-warning', msg: 'You\'re on the right track. Review the weak topics below.' }
      : { label: 'Needs Work', tone: 'text-destructive', msg: 'Keep going — review explanations and try again.' };

  const filtered = result.feedback.filter((q) => {
    if (filter === 'correct') return q.isCorrect;
    if (filter === 'wrong') return !q.isCorrect;
    if (filter === 'flagged') return false;
    return true;
  });

  function toggle(idx: number) {
    setExpanded((s) => {
      const n = new Set(s);
      n.has(idx) ? n.delete(idx) : n.add(idx);
      return n;
    });
  }

  return (
    <PageShell fullscreen>
      <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
        <PageHeader
          title="Exam Results"
          subtitle={`${result.examTitle} · ${result.difficulty} · ${result.total} questions`}
          right={
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="outline" className="rounded-xl">
                <Share2 className="h-4 w-4 mr-1.5" /> Share
              </Button>
              <Button variant="outline" className="rounded-xl">
                <Download className="h-4 w-4 mr-1.5" /> Export
              </Button>
            </div>
          }
        />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-3xl border border-border bg-card p-7 shadow-[var(--shadow-soft-glow)]"
        >
          <div className="absolute inset-0 bg-[image:var(--gradient-primary)] opacity-[0.06] pointer-events-none" />
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="relative">
                <CircularProgress value={percentage} size={132} />
                <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-primary" />
              </div>
              <div>
                <div className={`text-xs font-semibold uppercase tracking-wider ${grade.tone}`}>
                  {grade.label}
                </div>
                <div className="mt-1 text-4xl font-bold text-foreground">
                  {result.score}
                  <span className="text-muted-foreground text-2xl"> / {result.total}</span>
                </div>
                <p className="mt-1.5 text-sm text-muted-foreground max-w-xs">{grade.msg}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
              <StatTile icon={CheckCircle2} label="Correct" value={result.score} tone="success" />
              <StatTile icon={X} label="Wrong" value={result.total - result.score} tone="destructive" />
              <StatTile icon={Clock} label="Time" value={`${mm}:${ss}`} tone="primary" />
              <StatTile icon={Target} label="Accuracy" value={`${percentage}%`} tone="primary" />
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-lg font-semibold text-foreground">Question Review</h2>
            <div className="flex gap-1.5 rounded-xl bg-card border border-border p-1">
              {(['all', 'correct', 'wrong', 'flagged'] as Filter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors ${
                    filter === f
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {filtered.map((q, i) => {
              const isOpen = expanded.has(q.questionIndex);
              return (
                <motion.div
                  key={q.questionIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.04 }}
                  className={`rounded-2xl border bg-card overflow-hidden ${
                    q.isCorrect ? 'border-success/30' : 'border-destructive/30'
                  }`}
                >
                  <button
                    onClick={() => toggle(q.questionIndex)}
                    className="w-full flex items-center gap-4 p-4 text-left hover:bg-accent/30 transition-colors"
                  >
                    <span
                      className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center font-semibold ${
                        q.isCorrect
                          ? 'bg-success/15 text-success'
                          : 'bg-destructive/15 text-destructive'
                      }`}
                    >
                      {q.isCorrect ? <CheckCircle2 className="h-5 w-5" /> : <X className="h-5 w-5" />}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-semibold text-muted-foreground">
                          Q{q.questionIndex + 1}
                        </span>
                        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">
                          Question
                        </span>
                      </div>
                      <p className="text-sm text-foreground line-clamp-1">{q.questionText}</p>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="border-t border-border px-4 pb-4 pt-3"
                    >
                      <p className="text-base text-foreground font-medium mb-4">{q.questionText}</p>
                      <div className="flex flex-col gap-2 mb-4">
                        {q.options.map((opt, idx) => {
                          const isUser = q.selectedAnswer === idx;
                          const isCorrect = q.correctAnswer === idx;
                          return (
                            <div
                              key={idx}
                              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
                                isCorrect
                                  ? 'border-success bg-success/10'
                                  : isUser
                                  ? 'border-destructive bg-destructive/10'
                                  : 'border-border bg-background'
                              }`}
                            >
                              <span
                                className={`h-7 w-7 shrink-0 rounded-lg border flex items-center justify-center text-xs font-semibold ${
                                  isCorrect
                                    ? 'border-success bg-success text-success-foreground'
                                    : isUser
                                    ? 'border-destructive bg-destructive text-destructive-foreground'
                                    : 'border-border text-muted-foreground'
                                }`}
                              >
                                {String.fromCharCode(65 + idx)}
                              </span>
                              <span className="flex-1 text-foreground">{opt}</span>
                              {isUser && !isCorrect && (
                                <span className="text-xs font-medium text-destructive">
                                  Your answer
                                </span>
                              )}
                              {isCorrect && (
                                <span className="text-xs font-medium text-success">
                                  {isUser ? 'Your answer · Correct' : 'Correct answer'}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      {q.explanation && (
                        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                          <div className="text-xs font-semibold text-primary mb-1 uppercase tracking-wider">
                            Explanation
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{q.explanation}</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}

            {filtered.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground text-sm">
                No questions in this filter.
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-3xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">Keep your streak going</div>
              <div className="text-xs text-muted-foreground">
                Retake this exam or jump into analytics for deeper insights.
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-xl w-full sm:w-auto" onClick={() => router.push('/')}>
              <RotateCcw className="h-4 w-4 mr-1.5" /> Retake
            </Button>
            <Button
              className="rounded-xl bg-[image:var(--gradient-primary)] hover:opacity-90 text-primary-foreground w-full sm:w-auto"
              onClick={() => router.push('/analytics')}
            >
              View Analytics
            </Button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  tone: 'success' | 'destructive' | 'primary' | 'warning';
}) {
  const toneClasses = {
    success: 'bg-success/15 text-success',
    destructive: 'bg-destructive/15 text-destructive',
    primary: 'bg-primary/15 text-primary',
    warning: 'bg-warning/15 text-warning',
  }[tone];

  return (
    <div className="rounded-2xl border border-border bg-background p-3 flex items-center gap-3">
      <div className={`h-9 w-9 shrink-0 rounded-xl flex items-center justify-center ${toneClasses}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-base font-semibold text-foreground">{value}</div>
      </div>
    </div>
  );
}