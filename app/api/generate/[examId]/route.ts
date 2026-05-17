import { NextRequest, NextResponse } from 'next/server';
import { initializeDB, getExam, updateExam } from '@/lib/db';
import { generateQuestionsFromText } from '@/lib/ai-client';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ examId: string }> }
) {
  try {
    await initializeDB();
    const { examId } = await params;
    const exam = getExam(examId);

    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    if (!exam.contentSource) {
      return NextResponse.json({ error: 'No content source for generation' }, { status: 400 });
    }

    if (exam.questions.length > 0) {
      // Already generated
      return NextResponse.json({ success: true });
    }

    // Generate questions using AI
    const questions = await generateQuestionsFromText(
      exam.contentSource,
      exam.totalQuestions,
      exam.difficulty
    );

    if (questions.length === 0) {
      return NextResponse.json(
        { error: 'Failed to generate questions from provided material' },
        { status: 500 }
      );
    }

    // Update exam with questions
    const updatedExam = {
      ...exam,
      questions,
      updatedAt: Date.now(),
    };

    updateExam(examId, updatedExam);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: `Server error: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}