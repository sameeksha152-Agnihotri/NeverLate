import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { analyzeProcrastinationPattern, generateFutureComparison, generateRoast } from '../../services/gemini';
import type { Task } from '../../types';
import { Button } from '../ui/Button';
import { Card, CardBody } from '../ui/Card';
import { Lightbulb, Sparkles, ArrowRight, X } from 'lucide-react';

interface ExcuseDetectorProps {
  task: Task;
  onClose?: () => void;
}

export function ExcuseDetector({ task, onClose }: ExcuseDetectorProps) {
  const { userProfile } = useAuth();
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    analyzeProcrastinationPattern(task, userProfile?.personality || 'supportive-friend')
      .then(setAnalysis)
      .catch(() => setAnalysis('Try starting with just 5 minutes of work on this task.'))
      .finally(() => setLoading(false));
  }, [task, userProfile?.personality]);

  return (
    <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/10">
      <CardBody className="py-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-amber-400 mb-2">
              Pattern Detected
            </h4>
            {loading ? (
              <div className="h-4 bg-slate-700/50 rounded animate-pulse" />
            ) : (
              <p className="text-sm text-slate-300">{analysis}</p>
            )}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

interface FutureSimulatorProps {
  task: Task;
}

export function FutureSimulator({ task }: FutureSimulatorProps) {
  const { userProfile } = useAuth();
  const [comparison, setComparison] = useState<{ ifCompleted: string; ifIgnored: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen && !comparison) {
      generateFutureComparison(task, userProfile?.personality || 'supportive-friend')
        .then(setComparison)
        .catch(() => setComparison({
          ifCompleted: 'Tomorrow brings accomplishment and relief.',
          ifIgnored: 'Tomorrow brings stress and regret.',
        }))
        .finally(() => setLoading(false));
    }
  }, [isOpen, task, userProfile?.personality, comparison]);

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setIsOpen(true)}>
        <Sparkles className="w-4 h-4 text-purple-400" />
        See Your Future
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/70" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl"
            >
              <h3 className="text-lg font-semibold text-slate-100 mb-4">
                Future Self Simulator
              </h3>
              <p className="text-sm text-slate-400 mb-6">
                See what tomorrow looks like based on your choice today.
              </p>

              {loading ? (
                <div className="py-8 text-center">
                  <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : comparison && (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">✨</span>
                      <span className="text-sm font-medium text-emerald-400">If Completed</span>
                    </div>
                    <p className="text-sm text-slate-300">{comparison.ifCompleted}</p>
                  </div>

                  <div className="flex justify-center">
                    <ArrowRight className="w-5 h-5 text-slate-500 rotate-90" />
                  </div>

                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">😰</span>
                      <span className="text-sm font-medium text-red-400">If Ignored</span>
                    </div>
                    <p className="text-sm text-slate-300">{comparison.ifIgnored}</p>
                  </div>
                </div>
              )}

              <Button
                variant="secondary"
                className="w-full mt-6"
                onClick={() => setIsOpen(false)}
              >
                Close
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

interface RoastFeedbackProps {
  tasks: Task[];
}

export function RoastFeedback({ tasks }: RoastFeedbackProps) {
  const { userProfile } = useAuth();
  const [roast, setRoast] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateRoastMessage = async () => {
    setLoading(true);
    const totalPostpones = tasks.reduce((sum, t) => sum + t.postponeCount, 0);

    try {
      const message = await generateRoast(tasks, totalPostpones, userProfile?.personality || 'supportive-friend');
      setRoast(message);
    } catch {
      setRoast('Your postpone button is getting more of a workout than your actual tasks!');
    } finally {
      setLoading(false);
    }
  };

  if (tasks.filter(t => t.postponeCount > 0).length === 0) return null;

  return (
    <Card className="border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
      <CardBody className="py-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
            <span className="text-lg">🔥</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-purple-400">Buddy's Take</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={generateRoastMessage}
                loading={loading}
              >
                Roast Me
              </Button>
            </div>
            {roast && (
              <p className="text-sm text-slate-300 italic">"{roast}"</p>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
