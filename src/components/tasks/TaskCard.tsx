import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTasks } from '../../contexts/TaskContext';
import type { Task } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { RiskGauge } from '../ui/RiskGauge';
import { formatTimeRemaining, formatDateTime, getRiskColor, cn } from '../../utils/helpers';
import {
  Calendar,
  Clock,
  CircleCheck as CheckCircle2,
  TriangleAlert as AlertTriangle,
  Trash2,
  MoreVertical,
  Zap,
  RefreshCw,
} from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onRescue?: (task: Task) => void;
  onEdit?: (task: Task) => void;
  compact?: boolean;
}

export function TaskCard({ task, onRescue, onEdit, compact = false }: TaskCardProps) {
  const { completeTask, postponeTask, deleteTask } = useTasks();
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    setLoading(true);
    try {
      await completeTask(task.id);
    } finally {
      setLoading(false);
    }
  };

  const handlePostpone = async () => {
    setLoading(true);
    try {
      await postponeTask(task.id);
    } finally {
      setLoading(false);
      setShowMenu(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Delete this task?')) {
      setLoading(true);
      try {
        await deleteTask(task.id);
      } finally {
        setLoading(false);
        setShowMenu(false);
      }
    }
  };

  const isPast = new Date() > task.deadline;
  const isHighRisk = task.riskScore >= 70;

  if (compact) {
    return (
      <div
        className="flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 hover:border-[var(--border-active)]"
        style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
      >
        <RiskGauge score={task.riskScore} size="sm" showLabel={false} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-theme-primary truncate">{task.title}</p>
          <p className="text-xs text-theme-muted mt-1">{formatTimeRemaining(task.deadline)}</p>
        </div>
        {isHighRisk && onRescue && (
          <Button variant="primary" size="sm" onClick={() => onRescue(task)}>
            <Zap className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      layout
    >
      <Card
        className={cn(
          'group relative overflow-hidden',
          isPast && 'opacity-60',
          isHighRisk && 'border-red-500/20'
        )}
      >
        {/* Risk indicator bar */}
        {isHighRisk && (
          <div
            className="absolute top-0 left-0 right-0 h-0.5"
            style={{ backgroundColor: getRiskColor(task.riskScore) }}
          />
        )}

        <div className="p-5">
          <div className="flex items-start gap-4">
            {/* Risk gauge */}
            <div className="flex-shrink-0 pt-1">
              <RiskGauge score={task.riskScore} size="sm" animate={isHighRisk} />
            </div>

            {/* Task details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-base font-medium text-slate-100 leading-snug">
                  {task.title}
                </h3>

                {/* Menu button */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMenu(!showMenu)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>

                  {showMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowMenu(false)}
                      />
                      <div className="absolute right-0 top-full mt-1 z-20 w-36 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden animate-scale-in">
                        <button
                          onClick={() => {
                            onEdit?.(task);
                            setShowMenu(false);
                          }}
                          className="w-full px-3 py-2 text-xs text-slate-300 hover:bg-slate-700 text-left"
                        >
                          Edit Task
                        </button>
                        <button
                          onClick={handlePostpone}
                          disabled={loading}
                          className="w-full px-3 py-2 text-xs text-slate-300 hover:bg-slate-700 text-left flex items-center gap-2"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Postpone
                        </button>
                        <button
                          onClick={handleDelete}
                          disabled={loading}
                          className="w-full px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 text-left flex items-center gap-2"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Meta info */}
              <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDateTime(task.deadline)}
                </span>
                <span
                  className={cn(
                    'flex items-center gap-1.5',
                    isPast ? 'text-red-400' : 'text-slate-500'
                  )}
                >
                  <Clock className="w-3.5 h-3.5" />
                  {formatTimeRemaining(task.deadline)}
                </span>
              </div>

              {/* Hours info */}
              <div className="mt-2.5 flex items-center gap-4 text-xs">
                <span className="text-slate-600">
                  Est: <span className="text-slate-400">{task.estimatedHours}h</span>
                </span>
                <span className="text-slate-600">
                  Free: <span className="text-slate-400">{task.freeHours}h</span>
                </span>
                {task.postponeCount > 0 && (
                  <span className="text-amber-500 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {task.postponeCount}x
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="mt-4 flex items-center gap-2">
                {task.status === 'active' && (
                  <>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={handleComplete}
                      loading={loading}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Complete
                    </Button>

                    {isHighRisk && onRescue && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onRescue(task)}
                      >
                        <Zap className="w-3.5 h-3.5" />
                        Rescue
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
