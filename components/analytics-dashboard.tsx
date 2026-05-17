'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Loader2 } from 'lucide-react';
import type { AnalyticsData } from '@/types';

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/analytics')
      .then((res) => res.json())
      .then((data) => {
        setAnalytics(data);
        setLoading(false);
      })
      .catch((err) => {
        setError((err as Error).message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return <div className="rounded-lg bg-red-50 p-4 text-red-700">Failed to load analytics: {error}</div>;
  }

  if (!analytics) {
    return (
      <div className="rounded-lg bg-gray-50 p-8 text-center">
        <p className="text-gray-600">No exam data yet. Take your first exam to see analytics!</p>
      </div>
    );
  }

  // Prepare chart data
  const progressData = analytics.progressHistory.map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    score: Math.round(item.score),
  }));

  const difficultyData = [
    {
      difficulty: 'Easy',
      attempts: analytics.performanceByDifficulty.Easy.attempts,
      avgScore: Math.round(analytics.performanceByDifficulty.Easy.avgScore),
    },
    {
      difficulty: 'Medium',
      attempts: analytics.performanceByDifficulty.Medium.attempts,
      avgScore: Math.round(analytics.performanceByDifficulty.Medium.avgScore),
    },
    {
      difficulty: 'Hard',
      attempts: analytics.performanceByDifficulty.Hard.attempts,
      avgScore: Math.round(analytics.performanceByDifficulty.Hard.avgScore),
    },
  ];

  const getBestDifficulty = () => {
    return Object.entries(analytics.performanceByDifficulty).reduce((best, [key, value]) =>
      value.avgScore > best.score ? { level: key, score: value.avgScore } : best
    , { level: 'None', score: 0 });
  };

  const best = getBestDifficulty();

  return (
    <div className="space-y-8">
      {/* Key stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border bg-white shadow-sm">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Total Exams</p>
              <p className="text-4xl font-bold text-blue-600">{analytics.totalExamsCompleted}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-white shadow-sm">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Average Score</p>
              <p className="text-4xl font-bold text-blue-600">
                {analytics.averageScore.toFixed(1)}%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-white shadow-sm">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Best Difficulty</p>
              <p className="text-4xl font-bold text-blue-600">{best.level}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress chart */}
      {progressData.length > 0 && (
        <Card className="border-border bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Progress Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ fill: '#2563eb', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Score %"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Performance by difficulty */}
      {difficultyData.some((d) => d.attempts > 0) && (
        <Card className="border-border bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Performance by Difficulty</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={difficultyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="difficulty" stroke="#6b7280" />
                <YAxis stroke="#6b7280" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="avgScore" fill="#2563eb" name="Avg Score %" radius={[8, 8, 0, 0]} />
                <Bar dataKey="attempts" fill="#93c5fd" name="Attempts" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Insights */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900 text-lg">Insights</h3>
        <div className="grid grid-cols-1 gap-4">
          {best.score > 0 && (
            <Card className="border-border bg-blue-50 border-blue-200 shadow-sm">
              <CardContent className="pt-6">
                <p className="text-gray-900 font-medium">
                  Your best performance is in <span className="font-bold text-blue-600">{best.level}</span> difficulty exams
                  ({Math.round(best.score)}% average)
                </p>
              </CardContent>
            </Card>
          )}

          {analytics.weakTopics.length > 0 && (
            <Card className="border-border bg-amber-50 border-amber-200 shadow-sm">
              <CardContent className="pt-6">
                <p className="text-gray-900 font-medium mb-2">Topics to review:</p>
                <ul className="space-y-1">
                  {analytics.weakTopics.slice(0, 3).map((topic, idx) => (
                    <li key={idx} className="text-sm text-gray-700">
                      • {topic.length > 80 ? topic.slice(0, 77) + '...' : topic}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {analytics.totalExamsCompleted > 0 && (
            <Card className="border-border bg-green-50 border-green-200 shadow-sm">
              <CardContent className="pt-6">
                <p className="text-gray-900 font-medium">
                  You&apos;ve taken <span className="font-bold text-green-600">{analytics.totalExamsCompleted}</span> exams so far.
                  Keep practicing to improve!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
