import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { initializeDB, createExam } from '@/lib/db';
import { parseFile, cleanText } from '@/lib/file-parser';
import type { Exam, ExamSettings } from '@/types';

export async function POST(request: NextRequest) {
  try {
    await initializeDB();
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const settingsJson = formData.get('settings') as string;

    if (!file || !settingsJson) {
      return NextResponse.json({ error: 'Missing file or settings' }, { status: 400 });
    }

    const settings: ExamSettings = JSON.parse(settingsJson);

    // Parse file content
    let text: string;
    try {
      text = await parseFile(file);
    } catch (error) {
      return NextResponse.json({ error: `File parsing failed: ${(error as Error).message}` }, { status: 400 });
    }

    // Clean text
    const cleanedText = cleanText(text);

    if (cleanedText.length < 50) {
      return NextResponse.json(
        { error: 'Uploaded file contains too little text for exam generation' },
        { status: 400 }
      );
    }

    // Create exam object without questions (will be generated in processing)
    const now = Date.now();
    const exam: Exam = {
      id: uuidv4(),
      title: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
      description: `Generated on ${new Date(now).toLocaleDateString()}`,
      createdAt: now,
      updatedAt: now,
      difficulty: settings.difficulty,
      duration: settings.duration,
      questions: [], // Empty for now
      totalQuestions: settings.numberOfQuestions,
      contentSource: cleanedText, // Store text for later generation
    };

    // Save to database
    createExam(exam);

    return NextResponse.json({
      examId: exam.id,
      examTitle: exam.title,
      totalQuestions: exam.totalQuestions,
      difficulty: exam.difficulty,
      duration: exam.duration,
      voiceEnabled: settings.voiceEnabled,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: `Server error: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}