'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useParams } from 'next/navigation';
import { Timer } from '@/components/timer';
import { QuestionCard } from '@/components/question-card';
import { VoiceController } from '@/components/voice-controller';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import type { Exam } from '@/types';

export default function ExamPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const examId = params.id as string;
  const examTitle = searchParams.get('title') || 'Exam';
  const voiceEnabled = searchParams.get('voice') === 'true';

  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | undefined)[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [examStartTime] = useState(Date.now());
  const [isExamActive, setIsExamActive] = useState(true);

  // Fetch exam data
  useEffect(() => {
    fetch(`/api/exams/${examId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setExam(data);
          setAnswers(new Array(data.questions.length).fill(undefined));
        }
        setLoading(false);
      })
      .catch((err) => {
        setError((err as Error).message);
        setLoading(false);
      });
  }, [examId]);

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleVoiceAnswer = (answerIndex: number) => {
    handleAnswerSelect(answerIndex);
  };

  const handleNextQuestion = () => {
    if (exam && currentQuestion < exam.totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleTimeUp = () => {
    setIsExamActive(false);
    submitExam();
  };

  const submitExam = async () => {
    if (!exam || submitting) return;

    setSubmitting(true);

    try {
      const timeTaken = Math.floor((Date.now() - examStartTime) / 1000);

      const response = await fetch('/api/attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId,
          answers,
          timeTaken,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit exam');
      }

      const data = await response.json();
      router.push(`/results/${data.attemptId}`);
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-700 text-center">
        <p className="font-medium">{error}</p>
        <Button onClick={() => router.push('/')} className="mt-4">
          Back to Home
        </Button>
      </div>
    );
  }

  if (!exam) {
    return null;
  }

  const secondsTotal = exam.duration * 60;

  return (
    <div className="min-h-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between rounded-lg bg-white border border-border p-4 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{examTitle}</h1>
          <p className="text-sm text-gray-600">
            {exam.difficulty} • {exam.totalQuestions} questions • {exam.duration} minutes
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Timer
            initialSeconds={secondsTotal}
            onTimeUp={handleTimeUp}
            isRunning={isExamActive}
          />
        </div>
      </div>

      {/* Question area */}
      {exam.questions[currentQuestion] && (
        <div className="space-y-6">
          <QuestionCard
            question={exam.questions[currentQuestion]}
            questionNumber={currentQuestion + 1}
            totalQuestions={exam.totalQuestions}
            onAnswerSelect={handleAnswerSelect}
            selectedAnswer={answers[currentQuestion]}
            voiceEnabled={voiceEnabled}
          />

          {/* Navigation buttons */}
          <div className="flex gap-4">
            {currentQuestion > 0 && (
              <Button
                onClick={() => setCurrentQuestion(currentQuestion - 1)}
                variant="outline"
                className="flex-1"
              >
                Previous
              </Button>
            )}

            {currentQuestion < exam.totalQuestions - 1 ? (
              <Button
                onClick={handleNextQuestion}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={answers[currentQuestion] === undefined}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={submitExam}
                disabled={submitting || answers.some((a) => a === undefined)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Exam'
                )}
              </Button>
            )}
          </div>

          {/* Warnings */}
          {answers[currentQuestion] === undefined && (
            <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700 border border-amber-200">
              Please select an answer before proceeding.
            </div>
          )}

          {answers.some((a) => a === undefined) && currentQuestion === exam.totalQuestions - 1 && (
            <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700 border border-amber-200">
              {answers.filter((a) => a === undefined).length} question(s) not answered. You can still submit.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
