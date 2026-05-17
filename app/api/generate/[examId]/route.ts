import { NextRequest, NextResponse } from 'next/server';
import { initializeDB, getExam, updateExam } from '@/lib/db';
import { generateQuestionsFromText } from '@/lib/ai-client';
import type { Question } from '@/types';

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ examId: string }> }
) {
  console.log("GENERATE API HIT");
  
  try {
    await initializeDB();
    const { examId } = await params;
    console.log("Exam ID:", examId);
    
    const exam = getExam(examId);

    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    if (!exam.contentSource) {
      return NextResponse.json({ error: 'No content source for generation' }, { status: 400 });
    }

    if (exam.questions && exam.questions.length > 0) {
      console.log("GENERATION CACHED - returning existing questions");
      return NextResponse.json({ 
        success: true, 
        questions: exam.questions,
        cached: true 
      });
    }

    let questions: Question[] = [];
    let attempts = 0;
    const maxAttempts = 3;
    let lastError: Error | null = null;

    while (attempts < maxAttempts) {
      attempts++;
      console.log("Groq attempt:", attempts);
      
      try {
        questions = await generateQuestionsFromText(
          exam.contentSource,
          exam.totalQuestions,
          exam.difficulty
        );
        break;
      } catch (err) {
        lastError = err as Error;
        if (attempts >= maxAttempts) throw lastError;
        await sleep(1000);
      }
    }

    if (questions.length === 0) {
      return NextResponse.json(
        { error: 'Failed to generate questions from provided material' },
        { status: 500 }
      );
    }

    console.log("GENERATION COMPLETE");

    const updatedExam = {
      ...exam,
      questions,
      updatedAt: Date.now(),
    };

    updateExam(examId, updatedExam);

    return NextResponse.json({ success: true, cached: false });
  } catch (error) {
    console.error('Generation error:', error);
    const userMessage = (error as Error).message;
    return NextResponse.json(
      { error: userMessage },
      { status: 500 }
    );
  }
}