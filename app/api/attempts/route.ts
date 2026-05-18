import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { initializeDB, createUserAttempt, updateUserAttempt, getExam, recalculateAnalytics } from '@/lib/db';
import type { UserAttempt, UserAnswer } from '@/types';

export async function POST(request: NextRequest) {
  try {
    await initializeDB();
    const body = await request.json();
    const { examId, answers, timeTaken } = body;

    if (!examId || !Array.isArray(answers)) {
      return NextResponse.json({ error: 'Missing examId or answers' }, { status: 400 });
    }

    // Get exam to validate and calculate score
    const exam = getExam(examId);
    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    // Calculate score
    let correctCount = 0;
    const userAnswers: UserAnswer[] = [];

    // Answers come as array of objects with questionIndex and selectedAnswer
    for (const answer of answers) {
      const question = exam.questions[answer.questionIndex];
      if (question) {
        const isCorrect = answer.selectedAnswer === question.correctAnswer;
        if (isCorrect) correctCount++;

        userAnswers.push({
          questionIndex: answer.questionIndex,
          selectedAnswer: answer.selectedAnswer,
          isCorrect,
        });
      }
    }

    // Create attempt record
    const now = Date.now();
    const attempt: UserAttempt = {
      id: uuidv4(),
      examId,
      startedAt: now - (timeTaken || 0) * 1000,
      completedAt: now,
      answers: userAnswers,
      score: correctCount,
      timeTaken: timeTaken || 0,
      correctCount,
      totalQuestions: exam.questions.length,
    };

    createUserAttempt(attempt);

    // Recalculate analytics
    recalculateAnalytics();

    // Calculate percentage
    const percentage = ((correctCount / exam.questions.length) * 100).toFixed(1);

    return NextResponse.json({
      attemptId: attempt.id,
      examId,
      score: correctCount,
      total: exam.questions.length,
      percentage,
      timeTaken: timeTaken || 0,
      feedback: userAnswers.map((answer) => ({
        questionIndex: answer.questionIndex,
        questionText: exam.questions[answer.questionIndex].questionText,
        selectedAnswer: answer.selectedAnswer,
        options: exam.questions[answer.questionIndex].options,
        correctAnswer: exam.questions[answer.questionIndex].correctAnswer,
        isCorrect: answer.isCorrect,
        explanation: exam.questions[answer.questionIndex].explanation,
      })),
    });
  } catch (error) {
    console.error('Submit attempt error:', error);
    return NextResponse.json(
      { error: `Server error: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
