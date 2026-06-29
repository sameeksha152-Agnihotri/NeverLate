import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { Task } from '../../types';
import { Button } from '../ui/Button';
import { Card, CardBody } from '../ui/Card';
import { RiskGauge } from '../ui/RiskGauge';
import {
  Play,
  Pause,
  RotateCcw,
  X,
  Focus,
  Clock,
} from 'lucide-react';
import { formatTimeRemaining } from '../../utils/helpers';

interface FocusBubbleProps {
  task: Task;
  onComplete: () => void;
  onExit: () => void;
}

export function FocusBubble({ task, onComplete, onExit }: FocusBubbleProps) {
  const [isActive, setIsActive] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [totalTime] = useState(task.estimatedHours * 60 * 60);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTimeElapsed((prev) => {
          if (prev >= totalTime) {
            setIsActive(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, totalTime]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progress = (timeElapsed / totalTime) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-slate-950/95 flex items-center justify-center p-4"
    >
      <div className="w-full max-w-lg">
        <button
          onClick={onExit}
          className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-300 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-full text-sm text-amber-400 mb-4">
            <Focus className="w-4 h-4" />
            Focus Mode Active
          </div>
          <h1 className="text-2xl font-bold text-slate-100 mb-2">Stay Focused</h1>
          <p className="text-slate-400">One task at a time. You've got this.</p>
        </div>

        <Card className="border-amber-500/30 mb-8">
          <CardBody className="p-8">
            <div className="flex flex-col items-center text-center">
              <RiskGauge score={task.riskScore} size="lg" />
              <h2 className="mt-6 text-xl font-semibold text-slate-100">
                {task.title}
              </h2>
              <p className="mt-2 text-sm text-slate-400 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {formatTimeRemaining(task.deadline)} remaining
              </p>
            </div>
          </CardBody>
        </Card>

        <div className="text-center">
          <div className="relative w-48 h-48 mx-auto mb-6">
            <svg
              className="w-full h-full transform -rotate-90"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                className="text-slate-800"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                strokeLinecap="round"
                className="text-amber-500 transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-mono font-bold text-slate-100">
                {formatTime(timeElapsed)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => setTimeElapsed(0)}
            >
              <RotateCcw className="w-5 h-5" />
            </Button>

            <Button
              variant={isActive ? 'secondary' : 'primary'}
              size="lg"
              onClick={() => setIsActive(!isActive)}
              className="w-20 h-20 rounded-full"
            >
              {isActive ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-1" />
              )}
            </Button>

            <Button
              variant="success"
              size="lg"
              onClick={onComplete}
            >
              Complete
            </Button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 italic">
            {progress < 25
              ? 'Just getting started. Build momentum!'
              : progress < 50
              ? 'Making progress. Keep going!'
              : progress < 75
              ? 'More than halfway there. Push through!'
              : 'Almost done! Finish strong!'}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function FocusModeToggle({
  task,
  onEnterFocus,
}: {
  task: Task | null;
  onEnterFocus: () => void;
}) {
  if (!task) return null;

  return (
    <Button variant="primary" size="sm" onClick={onEnterFocus}>
      <Focus className="w-4 h-4" />
      Focus Mode
    </Button>
  );
}
