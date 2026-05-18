'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Mic,
  CheckCircle2,
  Volume2,
  X,
  AlertTriangle,
} from 'lucide-react';
import { PageShell } from '@/components/exam-ghost/PageShell';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { getVoiceController } from '@/lib/voice';
import type { Exam } from '@/types';

export default function ExamPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const examId = params.id as string;
  const examTitle = searchParams.get('title') || 'Exam';

  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [bookmarked, setBookmarked] = useState<Set<number>>(new Set());
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [examStartTime] = useState(Date.now());
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);

  const voiceController = getVoiceController();

  // Exit prevention effects
  useEffect(() => {
    if (submitted) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Leaving will forfeit your exam. Continue?';
      return e.returnValue;
    };

    const handleVisibilityChange = () => {
      if (document.hidden && !showExitWarning) {
        setShowExitWarning(true);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [submitted, showExitWarning]);

  // Fetch exam data
  useEffect(() => {
    fetch(`/api/exams/${examId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setExam(data);
          setSecondsLeft(data.duration * 60);
          setVoiceEnabled(searchParams.get('voice') === 'true');
        }
        setLoading(false);
      })
      .catch((err) => {
        setError((err as Error).message);
        setLoading(false);
      });
  }, [examId, searchParams]);

  // Timer
  useEffect(() => {
    if (submitted || secondsLeft <= 0) return;
    
    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          handleSubmitExam();
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [submitted, secondsLeft]);

  // Voice reading
  useEffect(() => {
    if (voiceOn && exam && exam.questions[currentQuestion]) {
      const q = exam.questions[currentQuestion];
      voiceController.speak(q.questionText).catch(console.error);
    }
  }, [voiceOn, currentQuestion, exam, voiceController]);

  // Calculate score - must be called before early returns to maintain hook order
  const answered = Object.keys(answers).length;
  const progress = exam ? (answered / exam.questions.length) * 100 : 0;
  const score = useMemo(() => {
    if (!exam) return 0;
    let s = 0;
    exam.questions.forEach((qq, idx) => {
      if (answers[idx] === qq.correctAnswer) s++;
    });
    return s;
  }, [answers, exam]);

  if (loading) {
    return (
      <PageShell fullscreen>
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading exam...</div>
        </div>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell fullscreen>
        <div className="rounded-lg bg-destructive/10 p-4 text-destructive text-center">
          <p className="font-medium">{error}</p>
          <Button onClick={() => router.push('/')} className="mt-4">
            Back to Home
          </Button>
        </div>
      </PageShell>
    );
  }

  if (!exam) return null;

  const q = exam.questions[currentQuestion];

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');
  const timeLow = secondsLeft < 5 * 60;

  function pick(idx: number) {
    if (submitted) return;
    setAnswers((a) => ({ ...a, [currentQuestion]: idx }));
  }

  function toggleFlag() {
    setFlagged((f) => {
      const n = new Set(f);
      n.has(currentQuestion) ? n.delete(currentQuestion) : n.add(currentQuestion);
      return n;
    });
  }

  function toggleBookmark() {
    setBookmarked((b) => {
      const n = new Set(b);
      n.has(currentQuestion) ? n.delete(currentQuestion) : n.add(currentQuestion);
      return n;
    });
  }

  async function handleSubmitExam() {
    if (submitted || !exam) return;
    
    const timeTaken = Math.floor((Date.now() - examStartTime) / 1000);
    
    try {
      const response = await fetch('/api/attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId,
          answers: Object.entries(answers).map(([qIdx, ans]) => ({
            questionIndex: parseInt(qIdx),
            selectedAnswer: ans,
            isCorrect: exam.questions[parseInt(qIdx)].correctAnswer === ans,
          })),
          timeTaken,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit exam');
      
      const data = await response.json();
      setSubmitted(true);
      router.push(`/results/${data.attemptId}`);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  function handleVoiceAnswer() {
    voiceController.startListening()
      .then((text) => {
        const answerIndex = voiceController.mapVoiceToAnswer(text);
        if (answerIndex !== null) {
          pick(answerIndex);
        }
      })
      .catch(console.error);
  }

  return (
    <>
      <PageShell fullscreen>
        <div className="flex flex-col gap-6">
          {/* Header with timer and quit button */}
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-foreground">{exam.title || examTitle}</h1>
            <div className="flex items-center gap-4">
              <div
                className={`flex items-center gap-2 rounded-2xl border px-4 py-2.5 font-mono text-lg font-semibold transition-colors ${
                  timeLow
                    ? 'border-destructive/40 bg-destructive/10 text-destructive'
                    : 'border-border bg-card text-foreground'
                }`}
              >
                <Clock className="h-5 w-5" />
                {mm}:{ss}
              </div>
              <Button
                variant="outline"
                onClick={() => setShowQuitConfirm(true)}
                className="rounded-xl text-destructive border-destructive/40 hover:bg-destructive/10"
              >
                Quit Exam
              </Button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>
                  Question {currentQuestion + 1} of {exam.questions.length}
                </span>
                <span>
                  {answered}/{exam.questions.length} answered
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>

          {/* Question nav pills */}
          <div className="flex flex-wrap gap-2">
            {exam.questions.map((_, i) => {
              const isCurrent = i === currentQuestion;
              const isAnswered = answers[i] !== undefined;
              const isFlaggedItem = flagged.has(i);
              return (
                <button
                  key={i}
                  onClick={() => setCurrentQuestion(i)}
                  className={`relative h-10 w-10 rounded-xl border text-sm font-semibold transition-all ${
                    isCurrent
                      ? 'border-primary bg-primary text-primary-foreground shadow-[var(--shadow-glow)]'
                      : isAnswered
                      ? 'border-primary/30 bg-primary/10 text-primary'
                      : 'border-border bg-card text-muted-foreground hover:border-primary/40'
                  }`}
                >
                  {i + 1}
                  {isFlaggedItem && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-warning border-2 border-background" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Question card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
              className="rounded-3xl border border-border bg-card p-7 shadow-[var(--shadow-soft-glow)]"
            >
              <div className="flex items-start justify-between gap-4 mb-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">
                    Question
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      exam.difficulty === 'Easy'
                        ? 'bg-success/15 text-success'
                        : exam.difficulty === 'Medium'
                        ? 'bg-warning/15 text-warning'
                        : 'bg-destructive/15 text-destructive'
                    }`}
                  >
                    {exam.difficulty}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {voiceEnabled && (
                    <button
                      onClick={() => setVoiceOn((v) => !v)}
                      aria-label="Read aloud"
                      className={`h-9 w-9 rounded-lg border border-border flex items-center justify-center transition-colors ${
                        voiceOn ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-accent'
                      }`}
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={toggleBookmark}
                    aria-label="Bookmark"
                    className={`h-9 w-9 rounded-lg border border-border flex items-center justify-center transition-colors ${
                      bookmarked.has(currentQuestion)
                        ? 'bg-primary/15 text-primary'
                        : 'text-muted-foreground hover:bg-accent'
                    }`}
                  >
                    <Bookmark
                      className="h-4 w-4"
                      fill={bookmarked.has(currentQuestion) ? 'currentColor' : 'none'}
                    />
                  </button>
                  <button
                    onClick={toggleFlag}
                    aria-label="Flag for review"
                    className={`h-9 w-9 rounded-lg border border-border flex items-center justify-center transition-colors ${
                      flagged.has(currentQuestion) ? 'bg-warning/15 text-warning' : 'text-muted-foreground hover:bg-accent'
                    }`}
                  >
                    <Flag
                      className="h-4 w-4"
                      fill={flagged.has(currentQuestion) ? 'currentColor' : 'none'}
                    />
                  </button>
                </div>
              </div>

              <h2 className="text-xl md:text-2xl font-semibold text-foreground leading-snug mb-6">
                {q.questionText}
              </h2>

              <div className="flex flex-col gap-3">
                {q.options.map((opt, idx) => {
                  const selected = answers[currentQuestion] === idx;
                  const correct = submitted && idx === q.correctAnswer;
                  const wrong = submitted && selected && idx !== q.correctAnswer;
                  return (
                    <motion.button
                      key={idx}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => pick(idx)}
                      disabled={submitted}
                      className={`group flex items-center gap-4 rounded-2xl border px-5 py-4 text-left transition-all ${
                        correct
                          ? 'border-success bg-success/10'
                          : wrong
                          ? 'border-destructive bg-destructive/10'
                          : selected
                          ? 'border-primary bg-primary/10 shadow-[var(--shadow-soft-glow)]'
                          : 'border-border bg-background hover:border-primary/40 hover:bg-accent/40'
                      }`}
                    >
                      <span
                        className={`h-9 w-9 shrink-0 rounded-xl border flex items-center justify-center font-semibold ${
                          correct
                            ? 'border-success bg-success text-success-foreground'
                            : wrong
                            ? 'border-destructive bg-destructive text-destructive-foreground'
                            : selected
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border text-muted-foreground group-hover:border-primary/40'
                        }`}
                      >
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="flex-1 text-foreground">{opt}</span>
                      {correct && <CheckCircle2 className="h-5 w-5 text-success" />}
                      {wrong && <X className="h-5 w-5 text-destructive" />}
                    </motion.button>
                  );
                })}
              </div>

              {submitted && q.explanation && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 rounded-2xl border border-primary/30 bg-primary/5 p-4"
                >
                  <div className="text-sm font-semibold text-primary mb-1">Explanation</div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{q.explanation}</p>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Footer controls */}
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestion((c) => Math.max(0, c - 1))}
              disabled={currentQuestion === 0}
              className="rounded-xl"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>

            {voiceEnabled && (
              <button
                onClick={handleVoiceAnswer}
                className={`hidden sm:flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition-colors ${
                  voiceOn
                    ? 'border-primary/40 bg-primary/10 text-primary'
                    : 'border-border bg-card text-muted-foreground hover:bg-accent'
                }`}
              >
                <Mic className="h-4 w-4" />
                Voice mode {voiceOn ? 'on' : 'off'}
              </button>
            )}

            {currentQuestion < exam.questions.length - 1 ? (
              <Button
                onClick={() => setCurrentQuestion((c) => Math.min(exam.questions.length - 1, c + 1))}
                className="rounded-xl bg-[image:var(--gradient-primary)] hover:opacity-90 text-primary-foreground shadow-[var(--shadow-soft-glow)]"
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmitExam}
                disabled={submitted}
                className="rounded-xl bg-[image:var(--gradient-primary)] hover:opacity-90 text-primary-foreground shadow-[var(--shadow-soft-glow)]"
              >
                Submit Exam
              </Button>
            )}
          </div>

          {/* Submission summary */}
          <AnimatePresence>
            {submitted && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-border bg-card p-7 shadow-[var(--shadow-soft-glow)]"
              >
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Your score</div>
                    <div className="text-4xl font-bold text-foreground">
                      {score} <span className="text-muted-foreground text-2xl">/ {exam.questions.length}</span>
                    </div>
                    <p className="mt-2 text-muted-foreground">
                      {score === exam.questions.length
                        ? 'Perfect run — you crushed it!'
                        : score >= exam.questions.length / 2
                        ? 'Solid work. Review the explanations to push higher.'
                        : 'Keep going — review the explanations and retry.'}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" className="rounded-xl" onClick={() => window.location.reload()}>
                      Retake
                    </Button>
                    <Button className="rounded-xl bg-[image:var(--gradient-primary)] hover:opacity-90 text-primary-foreground">
                      View Analytics
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </PageShell>

      {/* Exit Warning Modal */}
      {showExitWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-start gap-4 mb-4">
              <AlertTriangle className="h-6 w-6 text-warning shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">Exam Paused</h3>
                <p className="text-sm text-muted-foreground">
                  You've left the exam window. Leaving again will forfeit your exam.
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowExitWarning(false)} className="rounded-xl">
                Continue Exam
              </Button>
              <Button
                onClick={() => router.push('/')}
                className="rounded-xl bg-destructive text-destructive-foreground"
              >
                Forfeit Exam
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Quit Confirmation Modal */}
      {showQuitConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-foreground mb-2">Quit Exam?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Quitting will forfeit this exam and submit it with a score of 0. Are you sure?
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowQuitConfirm(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button
                onClick={() => router.push('/')}
                className="rounded-xl bg-destructive text-destructive-foreground"
              >
                Quit Exam
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}