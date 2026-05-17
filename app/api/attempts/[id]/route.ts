import { NextRequest, NextResponse } from 'next/server';
import { initializeDB, getUserAttempt, getExam } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await initializeDB();
    const { id } = await params;
    const attempt = getUserAttempt(id);

    if (!attempt) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    }

    const exam = getExam(attempt.examId);
    if (!exam) {
      return NextResponse.json({ error: 'Associated exam not found' }, { status: 404 });
    }

    const percentage = ((attempt.correctCount / attempt.totalQuestions) * 100).toFixed(1);

    return NextResponse.json({
      attemptId: attempt.id,
      examId: attempt.examId,
      examTitle: exam.title,
      difficulty: exam.difficulty,
      score: attempt.correctCount,
      total: attempt.totalQuestions,
      percentage,
      timeTaken: attempt.timeTaken,
      completedAt: attempt.completedAt,
      feedback: attempt.answers.map((answer) => ({
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
    console.error('Get attempt error:', error);
    return NextResponse.json({ error: 'Failed to fetch attempt' }, { status: 500 });
  }
}
