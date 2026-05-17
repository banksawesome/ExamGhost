'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const loadingStates = [
  'Analyzing content…',
  'Generating questions…',
  'Structuring exam…',
];

export default function ProcessingPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const examId = params.examId as string;
  const examTitle = searchParams.get('title') || 'Exam';
  const voiceEnabled = searchParams.get('voice') === 'true';

  const [currentState, setCurrentState] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    const generateExam = async () => {
      try {
        // Show first state
        setCurrentState(0);
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Call generate API
        setCurrentState(1);
        const response = await fetch(`/api/generate/${examId}`, {
          method: 'POST',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Generation failed');
        }

        // Show final state
        setCurrentState(2);
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Redirect to exam
        const voiceParam = voiceEnabled ? '&voice=true' : '';
        router.push(`/exam/${examId}?title=${encodeURIComponent(examTitle)}${voiceParam}`);
      } catch (err) {
        setError((err as Error).message);
      }
    };

    generateExam();
  }, [examId, examTitle, voiceEnabled, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="rounded-lg bg-red-50 p-6 text-red-700 max-w-md">
            <p className="font-medium">Generation Failed</p>
            <p className="text-sm mt-2">{error}</p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-6">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Generating Your Exam</h1>
          <p className="text-lg text-gray-600">{loadingStates[currentState]}</p>
        </div>
        <div className="w-64 mx-auto bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
            style={{ width: `${((currentState + 1) / loadingStates.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}