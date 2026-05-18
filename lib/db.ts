import { promises as fs } from 'fs';
import path from 'path';
import type { Exam, UserAttempt, AnalyticsData, UserAnswer } from '@/types';

const DB_FILE = path.join(process.cwd(), 'db.json');

// File-based storage using JSON file
interface Database {
  exams: Record<string, Exam>;
  attempts: Record<string, UserAttempt>;
  analytics: AnalyticsData;
  bookmarks: Record<string, import('@/types').Bookmark>;
}

let db: Database = {
  exams: {},
  attempts: {},
  analytics: {
    totalExamsCompleted: 0,
    averageScore: 0,
    weakTopics: [],
    allAttempts: [],
    performanceByDifficulty: {
      Easy: { attempts: 0, avgScore: 0 },
      Medium: { attempts: 0, avgScore: 0 },
      Hard: { attempts: 0, avgScore: 0 },
    },
    progressHistory: [],
  },
  bookmarks: {},
};

export async function initializeDB() {
  try {
    const data = await fs.readFile(DB_FILE, 'utf8');
    db = JSON.parse(data);
  } catch (error) {
    // File doesn't exist or is corrupted, use default
    console.log('DB file not found or corrupted, using defaults');
  }
}

async function saveDB() {
  try {
    await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2));
  } catch (error) {
    console.error('Failed to save DB:', error);
  }
}

// Exam operations
export function createExam(exam: Exam) {
  db.exams[exam.id] = exam;
  saveDB();
  return exam;
}

export function updateExam(id: string, exam: Exam) {
  db.exams[id] = exam;
  saveDB();
  return exam;
}

export function getExam(id: string): Exam | null {
  return db.exams[id] || null;
}

export function deleteExam(id: string): boolean {
  if (db.exams[id]) {
    delete db.exams[id];
    // Also delete associated attempts
    Object.keys(db.attempts).forEach(attemptId => {
      if (db.attempts[attemptId].examId === id) {
        delete db.attempts[attemptId];
      }
    });
    recalculateAnalytics();
    saveDB();
    return true;
  }
  return false;
}

export function getAllExams(): Exam[] {
  return Object.values(db.exams).sort((a, b) => b.createdAt - a.createdAt);
}

// User attempt operations
export function createUserAttempt(attempt: Omit<UserAttempt, 'completedAt'> & { completedAt?: number }): UserAttempt {
  const userAttempt = attempt as UserAttempt;
  db.attempts[attempt.id] = userAttempt;
  recalculateAnalytics();
  saveDB();
  return userAttempt;
}

export function updateUserAttempt(id: string, updates: Partial<UserAttempt>) {
  const existing = db.attempts[id];
  if (existing) {
    const updated = { ...existing, ...updates };
    db.attempts[id] = updated;
    recalculateAnalytics();
    saveDB();
    return updated;
  }
  return null;
}

export function getUserAttempt(id: string): UserAttempt | null {
  return db.attempts[id] || null;
}

export function getAllUserAttempts(): UserAttempt[] {
  return Object.values(db.attempts).sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));
}

// Analytics operations
export function updateAnalytics(data: AnalyticsData) {
  db.analytics = data;
  saveDB();
}

export function getAnalytics(): AnalyticsData {
  return db.analytics;
}

// Helper: Calculate analytics from attempts
export function recalculateAnalytics() {
  const allAttempts = getAllUserAttempts();
  const allExams = getAllExams();

  if (allAttempts.length === 0) {
    db.analytics = {
      totalExamsCompleted: 0,
      averageScore: 0,
      weakTopics: [],
      allAttempts: [],
      performanceByDifficulty: {
        Easy: { attempts: 0, avgScore: 0 },
        Medium: { attempts: 0, avgScore: 0 },
        Hard: { attempts: 0, avgScore: 0 },
      },
      progressHistory: [],
    };
    saveDB();
    return;
  }

  // Calculate average score
  const totalScore = allAttempts.reduce((sum, a) => sum + (a.correctCount / a.totalQuestions) * 100, 0);
  const averageScore = totalScore / allAttempts.length;

  // Group by difficulty
  const performanceByDifficulty = {
    Easy: { attempts: 0, avgScore: 0 },
    Medium: { attempts: 0, avgScore: 0 },
    Hard: { attempts: 0, avgScore: 0 },
  };

  for (const attempt of allAttempts) {
    const exam = allExams.find((e) => e.id === attempt.examId);
    if (exam) {
      const difficulty = exam.difficulty as keyof typeof performanceByDifficulty;
      const score = (attempt.correctCount / attempt.totalQuestions) * 100;
      performanceByDifficulty[difficulty].attempts += 1;
      performanceByDifficulty[difficulty].avgScore =
        (performanceByDifficulty[difficulty].avgScore * (performanceByDifficulty[difficulty].attempts - 1) + score) /
        performanceByDifficulty[difficulty].attempts;
    }
  }

  // Create progress history
  const progressHistory = allAttempts.map((attempt) => ({
    date: new Date(attempt.completedAt || 0).getTime(),
    score: (attempt.correctCount / attempt.totalQuestions) * 100,
  }));

  // Find weak topics (lowest scoring)
  const topicScores: Record<string, number[]> = {};
  for (const exam of allExams) {
    const examAttempts = allAttempts.filter((a) => a.examId === exam.id);
    if (examAttempts.length > 0) {
      const avgScore = examAttempts.reduce((sum, a) => sum + (a.correctCount / a.totalQuestions) * 100, 0) / examAttempts.length;
      topicScores[exam.title] = [avgScore];
    }
  }

  const weakTopics = Object.entries(topicScores)
    .sort(([, scores1], [, scores2]) => (scores1[0] || 0) - (scores2[0] || 0))
    .slice(0, 3)
    .map(([topic]) => topic);

db.analytics = {
    totalExamsCompleted: allAttempts.length,
    averageScore,
    weakTopics,
    allAttempts,
    performanceByDifficulty,
    progressHistory,
  };
  saveDB();
}

// Bookmark operations
export function createBookmark(bookmark: {
  examId: string;
  examTitle: string;
  questionIndex: number;
  questionText: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}) {
  const id = `${bookmark.examId}-${bookmark.questionIndex}-${Date.now()}`;
  const newBookmark = {
    id,
    ...bookmark,
    createdAt: Date.now(),
  };
  db.bookmarks[id] = newBookmark;
  saveDB();
  return newBookmark;
}

export function getAllBookmarks(): import('@/types').Bookmark[] {
  return Object.values(db.bookmarks).sort((a, b) => b.createdAt - a.createdAt);
}

export function deleteBookmark(id: string): boolean {
  if (db.bookmarks[id]) {
    delete db.bookmarks[id];
    saveDB();
    return true;
  }
  return false;
}
