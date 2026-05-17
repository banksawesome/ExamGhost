'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Loader2, ChevronRight, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ExamHistory {
  id: string;
  title: string;
  description?: string;
  createdAt: number;
  difficulty: string;
  duration: number;
  totalQuestions: number;
}

export default function HistoryPage() {
  const [exams, setExams] = useState<ExamHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState<ExamHistory | null>(null);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = () => {
    fetch('/api/exams')
      .then((res) => res.json())
      .then((data) => {
        if (data.exams) {
          setExams(data.exams);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError((err as Error).message);
        setLoading(false);
      });
  };

  const handleDeleteClick = (exam: ExamHistory) => {
    setExamToDelete(exam);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!examToDelete) return;

    try {
      const response = await fetch(`/api/exams/${examToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete exam');
      }

      // Refresh the list
      fetchExams();
      setDeleteDialogOpen(false);
      setExamToDelete(null);
    } catch (err) {
      setError((err as Error).message);
      setDeleteDialogOpen(false);
      setExamToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-full py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Exam History</h1>
          <p className="text-gray-600 mt-2">
            {exams.length === 0
              ? 'No exams yet. Create your first exam!'
              : `You have ${exams.length} exam${exams.length !== 1 ? 's' : ''} available`}
          </p>
        </div>

        {error && <div className="rounded-lg bg-red-50 p-4 text-red-700">{error}</div>}

        {exams.length === 0 ? (
          <Card className="border-border bg-white shadow-sm">
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-gray-600 mb-4">No exams generated yet.</p>
              <Link href="/">
                <Button>Create Your First Exam</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {exams.map((exam) => (
              <Card key={exam.id} className="border-border bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-6 pb-6">
                  <div className="flex items-center justify-between gap-4">
                    <Link href={`/exam/${exam.id}?title=${encodeURIComponent(exam.title)}`} className="flex-1 cursor-pointer">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{exam.title}</h3>
                        {exam.description && (
                          <p className="text-sm text-gray-600 mt-1">{exam.description}</p>
                        )}
                        <div className="flex gap-4 mt-3 text-sm text-gray-600">
                          <span>📝 {exam.totalQuestions} questions</span>
                          <span>⏱ {exam.duration} minutes</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            exam.difficulty === 'Easy'
                              ? 'bg-green-100 text-green-700'
                              : exam.difficulty === 'Medium'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                          }`}>
                            {exam.difficulty}
                          </span>
                          <span className="text-xs text-gray-600">
                            {new Date(exam.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </Link>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          handleDeleteClick(exam);
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <ChevronRight className="h-5 w-5 text-gray-400 cursor-pointer" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Exam</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{examToDelete?.title}"? This will permanently remove the exam and all associated attempts and results. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700 cursor-pointer">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
