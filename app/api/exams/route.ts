import { NextRequest, NextResponse } from 'next/server';
import { initializeDB, getAllExams } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    await initializeDB();
    const exams = getAllExams();

    return NextResponse.json({
      exams: exams.map((exam) => ({
        id: exam.id,
        title: exam.title,
        description: exam.description,
        createdAt: exam.createdAt,
        difficulty: exam.difficulty,
        duration: exam.duration,
        totalQuestions: exam.totalQuestions,
      })),
    });
  } catch (error) {
    console.error('Get exams error:', error);
    return NextResponse.json({ error: 'Failed to fetch exams' }, { status: 500 });
  }
}
