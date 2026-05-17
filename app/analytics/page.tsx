import { AnalyticsDashboard } from '@/components/analytics-dashboard';

export const metadata = {
  title: 'Analytics - ExamGhost',
  description: 'View your exam performance analytics and insights',
};

export default function AnalyticsPage() {
  return (
    <div className="min-h-full py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Performance</h1>
          <p className="text-gray-600 mt-2">Track your progress and identify areas for improvement</p>
        </div>
        <AnalyticsDashboard />
      </div>
    </div>
  );
}
