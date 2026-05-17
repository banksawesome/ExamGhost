"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return <div className="rounded-lg bg-destructive/15 p-4 text-destructive">Failed to load analytics: {error}</div>;
  }

  if (!analytics) {
    return (
      <div className="rounded-lg bg-muted/40 p-8 text-center">
        <p className="text-muted-foreground">No exam data yet. Take your first exam to see analytics!</p>
      </div>
    );
  }

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Exams</p>
                <p className="text-4xl font-bold text-primary">{analytics.totalExamsCompleted}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Average Score</p>
                <p className="text-4xl font-bold text-success">
                  {analytics.averageScore.toFixed(1)}%
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Best Difficulty</p>
                <p className="text-4xl font-bold text-warning">{best.level}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {progressData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">Progress Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    dot={{ fill: 'var(--primary)', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Score %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {difficultyData.some((d) => d.attempts > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">Performance by Difficulty</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={difficultyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="difficulty" stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="avgScore" fill="var(--primary)" name="Avg Score %" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="attempts" fill="var(--muted)" name="Attempts" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="space-y-4">
        <h3 className="font-semibold text-foreground text-lg">Insights</h3>
        <div className="grid grid-cols-1 gap-4">
          {best.score > 0 && (
            <Card className="border-border bg-success/10 border-success/30">
              <CardContent className="pt-6">
                <p className="text-foreground font-medium">
                  Your best performance is in <span className="font-bold text-success">{best.level}</span> difficulty exams
                  ({Math.round(best.score)}% average)
                </p>
              </CardContent>
            </Card>
          )}

          {analytics.weakTopics.length > 0 && (
            <Card className="border-border bg-warning/10 border-warning/30">
              <CardContent className="pt-6">
                <p className="text-foreground font-medium mb-2">Topics to review:</p>
                <ul className="space-y-1">
                  {analytics.weakTopics.slice(0, 3).map((topic, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground">
                      • {topic.length > 80 ? topic.slice(0, 77) + '...' : topic}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {analytics.totalExamsCompleted > 0 && (
            <Card className="border-border bg-primary/10 border-primary/30">
              <CardContent className="pt-6">
                <p className="text-foreground font-medium">
                  You&apos;ve taken <span className="font-bold text-primary">{analytics.totalExamsCompleted}</span> exams so far.
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