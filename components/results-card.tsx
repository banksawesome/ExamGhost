'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronDown, ChevronUp, Check, X } from 'lucide-react';

interface Feedback {
  questionIndex: number;
  questionText: string;
  selectedAnswer: number;
  options: string[];
  correctAnswer: number;
  isCorrect: boolean;
  explanation?: string;
}

interface ResultsCardProps {
  examTitle: string;
  score: number;
  total: number;
  percentage: string;
  timeTaken: number;
  feedback: Feedback[];
  difficulty: string;
}

const ANSWER_LABELS = ['A', 'B', 'C', 'D'];

export function ResultsCard({
  examTitle,
  score,
  total,
  percentage,
  timeTaken,
  feedback,
  difficulty,
}: ResultsCardProps) {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());

  const toggleQuestion = (index: number) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedQuestions(newExpanded);
  };

  const minutes = Math.floor(timeTaken / 60);
  const seconds = timeTaken % 60;

  return (
    <div className="space-y-8">
      {/* Score summary */}
      <Card className="border-border bg-gradient-to-br from-blue-50 to-white shadow-sm">
        <CardContent className="pt-8">
          <div className="text-center space-y-4">
            <p className="text-gray-600 text-sm font-medium">{examTitle}</p>
            <div className="text-6xl font-bold text-blue-600">{percentage}%</div>
            <p className="text-xl text-gray-900 font-semibold">
              {score} out of {total} correct
            </p>
            <p className="text-gray-600 text-sm">
              Time taken: {minutes}m {seconds}s • Difficulty: {difficulty}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Feedback section */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900 text-lg">Review Your Answers</h3>

        {feedback.map((item) => (
          <Card
            key={item.questionIndex}
            className={`border-l-4 cursor-pointer transition-all ${
              item.isCorrect ? 'border-l-green-500 bg-green-50' : 'border-l-red-500 bg-red-50'
            }`}
            onClick={() => toggleQuestion(item.questionIndex)}
          >
            <CardContent className="pt-4">
              {/* Question header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 mt-1 ${item.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                      {item.isCorrect ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <X className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        Question {item.questionIndex + 1}
                      </p>
                      <p className="text-gray-800 mt-2">{item.questionText}</p>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {expandedQuestions.has(item.questionIndex) ? (
                    <ChevronUp className="h-5 w-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-600" />
                  )}
                </div>
              </div>

              {/* Expanded details */}
              {expandedQuestions.has(item.questionIndex) && (
                <div className="mt-4 space-y-4 border-t border-gray-200 pt-4">
                  {/* Your answer */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Your answer:</p>
                    <div className={`rounded-lg p-3 ${item.isCorrect ? 'bg-white border border-green-200' : 'bg-white border border-red-200'}`}>
                      <p className="text-sm text-gray-900">
                        <span className={`font-bold ${item.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                          {ANSWER_LABELS[item.selectedAnswer]}.
                        </span>{' '}
                        {item.options[item.selectedAnswer]}
                      </p>
                    </div>
                  </div>

                  {/* Correct answer (if wrong) */}
                  {!item.isCorrect && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Correct answer:</p>
                      <div className="rounded-lg bg-white border border-green-200 p-3">
                        <p className="text-sm text-gray-900">
                          <span className="font-bold text-green-600">
                            {ANSWER_LABELS[item.correctAnswer]}.
                          </span>{' '}
                          {item.options[item.correctAnswer]}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Explanation */}
                  {item.explanation && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Explanation:</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{item.explanation}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-4">
        <Link href="/" className="flex-1">
          <Button variant="outline" className="w-full">
            Back to Home
          </Button>
        </Link>
        <Link href="/" className="flex-1">
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            Take Another Exam
          </Button>
        </Link>
      </div>
    </div>
  );
}
