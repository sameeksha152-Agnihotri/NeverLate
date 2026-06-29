import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTasks } from '../../contexts/TaskContext';
import { useAuth } from '../../contexts/AuthContext';
import { generatePanicBucket } from '../../services/gemini';
import type { Task, PanicBucket } from '../../types';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Clock, Circle as XCircle } from 'lucide-react';
import { cn } from '../../utils/helpers';

export function PanicButton() {
  const { activeTasks } = useTasks();
  const { userProfile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bucket, setBucket] = useState<PanicBucket | null>(null);

  const handlePanic = async () => {
    if (activeTasks.length === 0) return;
    setLoading(true);
    setIsOpen(true);

    try {
      const result = await generatePanicBucket(activeTasks, userProfile?.personality || 'supportive-friend');
      setBucket(result);
    } catch {
      setBucket({
        doNow: activeTasks.slice(0, 3),
        doLater: activeTasks.slice(3, 6),
        ignoreToday: activeTasks.slice(6),
      });
    } finally {
      setLoading(false);
    }
  };

  const TaskItem = ({ task, variant }: { task: Task; variant: 'now' | 'later' | 'ignore' }) => (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl transition-colors',
        variant === 'now' && 'bg-red-500/10 border border-red-500/20',
        variant === 'later' && 'bg-amber-500/10 border border-amber-500/20',
        variant === 'ignore' && 'bg-slate-700/30 border border-slate-600/30'
      )}
    >
      {variant === 'now' && <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />}
      {variant === 'later' && <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />}
      {variant === 'ignore' && <XCircle className="w-4 h-4 text-slate-500 flex-shrink-0" />}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-200 truncate">{task.title}</p>
        <p className="text-xs text-slate-500">Risk: {task.riskScore}%</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Floating button - positioned to not overlap with Buddy */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handlePanic}
        disabled={activeTasks.length === 0}
        className={cn(
          'fixed bottom-6 right-6 z-40',
          'px-4 py-2.5 rounded-xl',
          'bg-gradient-to-r from-red-500 to-orange-500',
          'shadow-lg shadow-red-500/20',
          'flex items-center gap-2',
          'text-xs font-semibold text-white',
          'transition-all duration-300',
          'hover:shadow-red-500/30',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        <AlertTriangle className="w-4 h-4" />
        I'm overwhelmed
      </motion.button>

      {/* Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Panic Mode"
        size="lg"
      >
        {loading ? (
          <div className="py-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 mb-4">
              <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-slate-400">Buddy is analyzing your tasks...</p>
          </div>
        ) : bucket ? (
          <div className="space-y-6">
            <p className="text-sm text-slate-400">
              Buddy has categorized your tasks. Focus on what matters most right now.
            </p>

            {/* Do Now */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1 rounded-lg bg-red-500/10">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                </div>
                <h3 className="text-sm font-semibold text-red-400">Do Now</h3>
                <span className="text-xs bg-red-500/15 text-red-300 px-2 py-0.5 rounded-full">
                  {bucket.doNow.length}
                </span>
              </div>
              <div className="space-y-2">
                {bucket.doNow.length === 0 ? (
                  <p className="text-sm text-slate-500 py-2 px-4 bg-slate-800/30 rounded-xl">Nothing urgent!</p>
                ) : (
                  bucket.doNow.map((task: Task) => (
                    <TaskItem key={task.id} task={task} variant="now" />
                  ))
                )}
              </div>
            </div>

            {/* Do Later */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1 rounded-lg bg-amber-500/10">
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <h3 className="text-sm font-semibold text-amber-400">Do Later</h3>
                <span className="text-xs bg-amber-500/15 text-amber-300 px-2 py-0.5 rounded-full">
                  {bucket.doLater.length}
                </span>
              </div>
              <div className="space-y-2">
                {bucket.doLater.length === 0 ? (
                  <p className="text-sm text-slate-500 py-2 px-4 bg-slate-800/30 rounded-xl">No tasks for later</p>
                ) : (
                  bucket.doLater.map((task: Task) => (
                    <TaskItem key={task.id} task={task} variant="later" />
                  ))
                )}
              </div>
            </div>

            {/* Ignore Today */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1 rounded-lg bg-slate-700/30">
                  <XCircle className="w-4 h-4 text-slate-500" />
                </div>
                <h3 className="text-sm font-semibold text-slate-400">Ignore Today</h3>
                <span className="text-xs bg-slate-500/15 text-slate-400 px-2 py-0.5 rounded-full">
                  {bucket.ignoreToday.length}
                </span>
              </div>
              <div className="space-y-2">
                {bucket.ignoreToday.length === 0 ? (
                  <p className="text-sm text-slate-500 py-2 px-4 bg-slate-800/30 rounded-xl">Everything prioritized!</p>
                ) : (
                  bucket.ignoreToday.map((task: Task) => (
                    <TaskItem key={task.id} task={task} variant="ignore" />
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-700/50">
              <Button variant="primary" className="w-full" onClick={() => setIsOpen(false)}>
                <CheckCircle className="w-4 h-4" />
                Got it, thanks Buddy!
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-slate-400">Something went wrong. Please try again.</p>
          </div>
        )}
      </Modal>
    </>
  );
}
