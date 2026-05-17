export interface Question {
  questionText: string;
  options: string[]; // [A, B, C, D]
  correctAnswer: number; // 0-3 index
  explanation?: string;
}

export interface Exam {
  id: string;
  title: string;
  description?: string;
  createdAt: number; // timestamp
  updatedAt: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  duration: number; // minutes
  questions: Question[];
  totalQuestions: number;
  contentSource?: string; // For AI generation
}

export interface UserAnswer {
  questionIndex: number;
  selectedAnswer: number; // 0-3 index
  isCorrect: boolean;
}

export interface UserAttempt {
  id: string;
  examId: string;
  startedAt: number;
  completedAt?: number;
  answers: UserAnswer[];
  score: number; // points
  timeTaken: number; // seconds
  correctCount: number;
  totalQuestions: number;
}

export interface AnalyticsData {
  totalExamsCompleted: number;
  averageScore: number; // percentage 0-100
  lastAttemptDate?: number;
  weakTopics: string[];
  allAttempts: UserAttempt[];
  performanceByDifficulty: {
    Easy: { attempts: number; avgScore: number };
    Medium: { attempts: number; avgScore: number };
    Hard: { attempts: number; avgScore: number };
  };
  progressHistory: Array<{
    date: number;
    score: number;
  }>;
}

export interface AIGeneratedResponse {
  questions: Question[];
}

export interface ExamSettings {
  numberOfQuestions: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  duration: number;
  voiceEnabled: boolean;
}

export interface UploadRequest {
  file: File;
  settings: ExamSettings;
}
