import { NextRequest, NextResponse } from 'next/server';
import { initializeDB, getAnalytics } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    await initializeDB();
    const analytics = getAnalytics();

    return NextResponse.json({
      totalExamsCompleted: analytics.totalExamsCompleted,
      averageScore: parseFloat(analytics.averageScore.toFixed(1)),
      lastAttemptDate: analytics.lastAttemptDate,
      weakTopics: analytics.weakTopics,
      performanceByDifficulty: analytics.performanceByDifficulty,
      progressHistory: analytics.progressHistory,
      recentAttempts: analytics.allAttempts.slice(0, 5).map((attempt) => ({
        id: attempt.id,
        examId: attempt.examId,
        score: attempt.correctCount,
        total: attempt.totalQuestions,
        percentage: ((attempt.correctCount / attempt.totalQuestions) * 100).toFixed(1),
        completedAt: attempt.completedAt,
      })),
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
