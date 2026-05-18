import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ attemptId: string }> }): Promise<Metadata> {
  const { attemptId } = await params;
  return {
    title: `Exam Results ${attemptId} | ExamGhost`,
    description: 'View your exam results, analyze performance, and review questions.',
    robots: { index: false, follow: false },
  };
}

export default function ResultsLayout({ children }: { children: React.ReactNode }) {
  return children;
}