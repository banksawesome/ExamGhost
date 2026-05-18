'use client';

import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getVoiceController } from '@/lib/voice';
import type { Question } from '@/types';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswerSelect: (answerIndex: number) => void;
  selectedAnswer?: number;
  voiceEnabled?: boolean;
}

const ANSWER_LABELS = ['A', 'B', 'C', 'D'];

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  onAnswerSelect,
  selectedAnswer,
  voiceEnabled,
}: QuestionCardProps) {
  // Auto-read question when voice is enabled
  useEffect(() => {
    if (voiceEnabled) {
      const voiceController = getVoiceController();
      voiceController.speak(question.questionText).catch((error) => {
        console.warn('Auto-voice reading failed:', error);
      });
    }
  }, [voiceEnabled, question.questionText]);

  return (
    <div className="space-y-6">
      {/* Question header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Question {questionNumber} of {totalQuestions}
          </span>
          <div className="h-2 w-48 rounded-full bg-border overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question card */}
      <Card className="border-border bg-card shadow-sm">
        <CardContent className="space-y-8 pt-8">
          {/* Question text */}
          <div className="space-y-4">
            <p className="text-xl font-semibold text-foreground leading-relaxed">
              {question.questionText}
            </p>
          </div>

          {/* Answer options */}
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => onAnswerSelect(index)}
                className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                  selectedAnswer === index
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-background hover:border-border/60 hover:bg-accent/40'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 font-medium text-sm ${
                      selectedAnswer === index
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border text-muted-foreground'
                    }`}
                  >
                    {ANSWER_LABELS[index]}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{option}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
