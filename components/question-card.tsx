'use client';

import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VoiceController } from '@/components/voice-controller';
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
          <span className="text-sm font-medium text-gray-600">
            Question {questionNumber} of {totalQuestions}
          </span>
          <div className="h-2 w-48 rounded-full bg-gray-200 overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all"
              style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question card */}
      <Card className="border-border bg-white shadow-sm">
        <CardContent className="space-y-8 pt-8">
          {/* Question text */}
          <div className="space-y-4">
            <p className="text-xl font-semibold text-gray-900 leading-relaxed">
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
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 font-medium text-sm ${
                      selectedAnswer === index
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-gray-300 bg-white text-gray-600'
                    }`}
                  >
                    {ANSWER_LABELS[index]}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{option}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Voice controller */}
          {voiceEnabled && (
            <VoiceController
              onAnswerDetected={onAnswerSelect}
              onSpeakComplete={() => {}}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
