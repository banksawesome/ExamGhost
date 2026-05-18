'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Clock,
  ListChecks,
  Mic,
  ShieldCheck,
  Volume2,
  AlertTriangle,
  Eye,
  Save,
  Sparkles,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { PageShell } from '@/components/exam-ghost/PageShell';
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ examId: string }> }): Promise<Metadata> {
  const { examId } = await params;
  return {
    title: `Exam Setup ${examId} | ExamGhost`,
    description: 'Review exam settings and prepare for your AI-generated exam.',
    robots: { index: false, follow: false },
  };
}

type Phase = 'instructions' | 'generating' | 'countdown';

const steps = [
  'Analyzing source material…',
  'Structuring exam…',
  'Calibrating difficulty…',
  'Finalizing questions…',
];

const instructions = [
  { icon: Eye, text: 'Find a quiet, distraction-free environment' },
  { icon: ShieldCheck, text: 'Keep your screen focused on the exam' },
  {
    icon: Volume2,
    text: 'Voice answer mode is available — click the speaker icon to read questions aloud',
  },
  { icon: Save, text: 'Your progress is auto-saved as you answer' },
  {
    icon: AlertTriangle,
    text: 'Leaving the exam will automatically submit it with a score of 0',
  },
];

export default function ProcessingPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const examId = params.examId as string;

  // Read exam details from URL params
  const examTitle = searchParams.get('title') || 'Exam';
  const examDuration = parseInt(searchParams.get('duration') || '60', 10);
  const examDifficulty = searchParams.get('difficulty') || 'Medium';
  const examNumQuestions = parseInt(searchParams.get('numQuestions') || '15', 10);
  const voiceEnabled = searchParams.get('voice') === 'true';

  const [phase, setPhase] = useState<Phase>('instructions');
  const [stepIdx, setStepIdx] = useState(0);
  const [count, setCount] = useState(5);
  const [errorMessage, setErrorMessage] = useState('');

  // generating progression
  useEffect(() => {
    if (phase !== 'generating') return;
    if (stepIdx >= steps.length - 1) {
      const t = setTimeout(() => setPhase('countdown'), 900);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStepIdx((i) => i + 1), 850);
    return () => clearTimeout(t);
  }, [phase, stepIdx]);

  // countdown
  useEffect(() => {
    if (phase !== 'countdown') return;
    if (count <= 0) {
      const voiceParam = voiceEnabled ? '&voice=true' : '';
      router.push(`/exam/${examId}?title=${encodeURIComponent(examTitle)}${voiceParam}`);
      return;
    }
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, count, examId, examTitle, voiceEnabled, router]);

  // Start generation when user clicks "I'm Ready"
  const handleStartExam = async () => {
    setPhase('generating');
    // Trigger generation API in background
    try {
      await fetch(`/api/generate/${examId}`, { method: 'POST' });
    } catch (err) {
      setErrorMessage((err as Error).message);
    }
  };

  if (errorMessage) {
    return (
      <PageShell fullscreen>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <div className="rounded-lg bg-red-50 p-6 text-red-700 max-w-md">
              <p className="font-medium">Generation Failed</p>
              <p className="text-sm mt-2">{errorMessage}</p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Home
            </button>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell fullscreen>
      <div className="w-full max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Pre-Exam Instructions</h1>
          <p className="text-muted-foreground mt-1">
            Review the details and prepare your environment before you begin.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Exam summary */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-1 rounded-2xl border border-border bg-card p-6 flex flex-col gap-5"
          >
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  Source
                </div>
                <div className="font-semibold text-foreground truncate">
                  {examTitle}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Stat label="Difficulty" value={examDifficulty} tone="warn" />
              <Stat
                label="Duration"
                value={`${examDuration} min`}
                icon={<Clock className="h-4 w-4" />}
              />
              <Stat
                label="Questions"
                value={String(examNumQuestions)}
                icon={<ListChecks className="h-4 w-4" />}
              />
              <Stat
                label="Voice Mode"
                value={voiceEnabled ? 'Available' : 'Not Available'}
                icon={<Mic className="h-4 w-4" />}
                tone="success"
              />
            </div>

            <div className="rounded-xl border border-border bg-background/40 p-4 text-xs text-muted-foreground flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              By starting, you agree to follow the exam guidelines. Your session will be timed.
            </div>
          </motion.div>

          {/* Right: Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 flex flex-col gap-5"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">
                Pre-Exam Instructions
              </h2>
            </div>

            <ul className="flex flex-col gap-3">
              {instructions.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    className="flex items-start gap-3 rounded-xl border border-border bg-background/40 p-4"
                  >
                    <div className="h-9 w-9 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="text-sm text-foreground/90 leading-relaxed pt-1.5">
                      {item.text}
                    </p>
                  </motion.li>
                );
              })}
            </ul>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => router.push('/')}
                className="flex-1 rounded-xl border border-border bg-background/40 py-3 font-medium text-foreground hover:bg-accent transition-colors"
              >
                Back
              </button>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleStartExam}
                className="flex-[2] relative overflow-hidden rounded-xl bg-[image:var(--gradient-primary)] cursor-pointer py-3 font-semibold text-primary-foreground"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  Start Exam
                </span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Generating / Countdown overlay */}
      <AnimatePresence>
        {phase !== 'instructions' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/85 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-[var(--shadow-glow)]"
            >
              {phase === 'generating' && (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    className="mx-auto h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary"
                  />
                  <h3 className="mt-6 text-xl font-semibold text-foreground">
                    Generating Your Exam
                  </h3>
                  <div className="mt-4 h-6">
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={stepIdx}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="text-sm text-muted-foreground flex items-center justify-center gap-2"
                      >
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        {steps[stepIdx]}
                      </motion.p>
                    </AnimatePresence>
                  </div>

                  <div className="mt-6 flex flex-col gap-2 text-left">
                    {steps.map((s, i) => (
                      <div
                        key={s}
                        className={`flex items-center gap-2 text-xs ${
                          i < stepIdx
                            ? 'text-foreground'
                            : i === stepIdx
                              ? 'text-primary'
                              : 'text-muted-foreground/60'
                        }`}
                      >
                        {i < stepIdx ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          <div className="h-2 w-2 rounded-full bg-current/40" />
                        )}
                        {s}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {phase === 'countdown' && (
                <>
                  <p className="text-sm text-muted-foreground">
                    Exam starting in
                  </p>
                  <motion.div
                    key={count}
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.4, opacity: 0 }}
                    className="mt-2 text-7xl font-bold bg-[image:var(--gradient-primary)] bg-clip-text text-transparent"
                  >
                    {count}
                  </motion.div>
                  <p className="mt-4 text-xs text-muted-foreground">
                    Get ready. Good luck!
                  </p>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  );
}

function Stat({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  tone?: 'warn' | 'success';
}) {
  const toneCls =
    tone === 'warn'
      ? 'text-amber-400'
      : tone === 'success'
        ? 'text-emerald-400'
        : 'text-foreground';
  return (
    <div className="rounded-xl border border-border bg-background/40 p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div
        className={`mt-1 font-semibold flex items-center gap-1.5 ${toneCls}`}
      >
        {icon}
        {value}
      </div>
    </div>
  );
}