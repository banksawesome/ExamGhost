import { NextRequest, NextResponse } from 'next/server';
import { initializeDB, createBookmark, getAllBookmarks, deleteBookmark } from '@/lib/db';

export async function GET() {
  try {
    await initializeDB();
    const bookmarks = getAllBookmarks();
    return NextResponse.json({ bookmarks });
  } catch (error) {
    console.error('Get bookmarks error:', error);
    return NextResponse.json({ error: 'Failed to fetch bookmarks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await initializeDB();
    const body = await request.json();
    const { examId, examTitle, questionIndex, questionText, difficulty } = body;
    
    if (!examId || !examTitle || questionIndex === undefined || !questionText || !difficulty) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const bookmark = createBookmark({
      examId,
      examTitle,
      questionIndex,
      questionText,
      difficulty,
    });
    
    return NextResponse.json({ bookmark });
  } catch (error) {
    console.error('Create bookmark error:', error);
    return NextResponse.json({ error: 'Failed to create bookmark' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await initializeDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Missing bookmark id' }, { status: 400 });
    }
    
    const success = deleteBookmark(id);
    
    if (!success) {
      return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete bookmark error:', error);
    return NextResponse.json({ error: 'Failed to delete bookmark' }, { status: 500 });
  }
}