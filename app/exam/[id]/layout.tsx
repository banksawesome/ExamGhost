import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Exam ${id} | ExamGhost`,
    description: 'Take your AI-generated exam with timed questions and voice interaction.',
    robots: { index: false, follow: false },
  };
}

export default function ExamLayout({ children }: { children: React.ReactNode }) {
  return children;
}