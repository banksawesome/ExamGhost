import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ examId: string }> }): Promise<Metadata> {
  const { examId } = await params;
  return {
    title: `Exam Setup ${examId} | ExamGhost`,
    description: 'Review exam settings and prepare for your AI-generated exam.',
    robots: { index: false, follow: false },
  };
}

export default function ProcessingLayout({ children }: { children: React.ReactNode }) {
  return children;
}