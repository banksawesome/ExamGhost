import { NextRequest, NextResponse } from 'next/server';
import { initializeDB, getExam, deleteExam } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await initializeDB();
    const { id } = await params;
    const exam = getExam(id);

    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: exam.id,
      title: exam.title,
      description: exam.description,
      difficulty: exam.difficulty,
      duration: exam.duration,
      totalQuestions: exam.totalQuestions,
      questions: exam.questions,
    });
  } catch (error) {
    console.error('Get exam error:', error);
    return NextResponse.json({ error: 'Failed to fetch exam' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await initializeDB();
    const { id } = await params;

    const success = deleteExam(id);
    if (!success) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete exam error:', error);
    return NextResponse.json({ error: 'Failed to delete exam' }, { status: 500 });
  }
}
