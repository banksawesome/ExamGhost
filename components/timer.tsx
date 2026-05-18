'use client';

import { useEffect, useState } from 'react';

interface TimerProps {
  initialSeconds: number;
  onTimeUp?: () => void;
  isRunning: boolean;
}

export function Timer({ initialSeconds, onTimeUp, isRunning }: TimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    if (!isRunning || secondsLeft <= 0) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          onTimeUp?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, secondsLeft, onTimeUp]);

  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;

  const isLowTime = secondsLeft < 300; // 5 minutes

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 font-mono text-sm font-bold ${
        isLowTime
          ? 'bg-destructive/10 text-destructive'
          : 'bg-primary/10 text-primary'
      }`}
    >
      <span className="text-base">⏱</span>
      <span>
        {hours > 0 && `${hours}:`}
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
}
