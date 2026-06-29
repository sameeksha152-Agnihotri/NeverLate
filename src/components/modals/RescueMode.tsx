import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { generateRescueSteps } from '../../services/gemini';
import type { Task, RescueStep } from '../../types';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { RiskGauge } from '../ui/RiskGauge';
import { Zap, Clock, CircleCheck as CheckCircle, RefreshCw } from 'lucide-react';
import { cn } from '../../utils/helpers';

interface RescueModeProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export function RescueMode({ task, isOpen, onClose }: RescueModeProps) {
  const { userProfile } = useAuth();
  const [steps, setSteps] = useState<RescueStep[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task && isOpen) {
      setLoading(true);
      setSteps([]);

      generateRescueSteps(task, userProfile?.personality || 'supportive-friend')
        .then(setSteps)
        .catch(() => {
          setSteps([
            { id: '1', description: 'Take a deep breath and review the task requirements', duration: 5, completed: false },
            { id: '2', description: 'Gather all necessary materials and resources', duration: 10, completed: false },
            { id: '3', description: 'Break the task into smaller manageable parts', duration: 15, completed: false },
            { id: '4', description: 'Focus on the first part for 25 minutes', duration: 25, completed: false },
            { id: '5', description: 'Take a 5-minute break', duration: 5, completed: false },
            { id: '6', description: 'Complete the remaining parts one by one', duration: 20, completed: false },
          ]);
        })
        .finally(() => setLoading(false));
    }
  }, [task, isOpen, userProfile?.personality]);

  const toggleStep = (index: number) => {
    setSteps((prev) =>
      prev.map((step, i) =>
        i === index ? { ...step, completed: !step.completed } : step
      )
    );
  };

  const totalDuration = steps.reduce((acc, step) => acc + step.duration, 0);
  const completedDuration = steps.filter((s) => s.completed).reduce((acc, s) => acc + s.duration, 0);

  if (!task) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rescue Mode" size="lg">
      <div className="space-y-6">
        <div className="flex items-start gap-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <RiskGauge score={task.riskScore} size="sm" showLabel={false} />
          <div className="flex-1">
            <h3 className="font-medium text-slate-100">{task.title}</h3>
            <p className="text-sm text-slate-400 mt-1">
              Let's break this down into manageable steps
            </p>
          </div>
          <div className="flex items-center gap-1 text-sm text-red-400">
            <Zap className="w-4 h-4" />
            High Risk
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 mb-4">
              <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
            </div>
            <p className="text-slate-400">Buddy is creating your rescue plan...</p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Progress</span>
                <span className="text-slate-300">
                  {completedDuration} / {totalDuration} minutes
                </span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(completedDuration / totalDuration) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            <div className="space-y-2">
              {steps.map((step, index) => (
                <motion.button
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => toggleStep(index)}
                  className={cn(
                    'w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-200',
                    'text-left hover:bg-slate-800/50',
                    step.completed
                      ? 'bg-emerald-500/10 border border-emerald-500/30'
                      : 'bg-slate-800/30 border border-slate-700/50'
                  )}
                >
                  <div
                    className={cn(
                      'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors',
                      step.completed
                        ? 'bg-emerald-500 border-emerald-500'
                        : 'border-slate-500'
                    )}
                  >
                    {step.completed && <CheckCircle className="w-4 h-4 text-white" />}
                  </div>

                  <div className="flex-1">
                    <p
                      className={cn(
                        'text-sm font-medium',
                        step.completed ? 'text-emerald-400 line-through' : 'text-slate-200'
                      )}
                    >
                      {step.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Clock className="w-3 h-3" />
                    {step.duration}m
                  </div>
                </motion.button>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-700 flex justify-between items-center">
              <p className="text-sm text-slate-400">
                {steps.filter((s) => s.completed).length} of {steps.length} steps completed
              </p>
              <Button variant="primary" onClick={onClose}>
                Done
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
