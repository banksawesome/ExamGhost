'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ResultsCard } from '@/components/results-card';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

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
  percentage: string;
  timeTaken: number;
  completedAt: number;
  feedback: Feedback[];
}

export default function ResultsPage() {
  const params = useParams();
  const attemptId = params.attemptId as string;

  const [result, setResult] = useState<AttemptResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-700 text-center space-y-4">
        <p className="font-medium">{error}</p>
        <Link href="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  return (
    <div className="min-h-full py-8">
      <ResultsCard
        examTitle={result.examTitle}
        score={result.score}
        total={result.total}
        percentage={result.percentage}
        timeTaken={result.timeTaken}
        feedback={result.feedback}
        difficulty={result.difficulty}
      />
    </div>
  );
}
