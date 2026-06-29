import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { generateAccountabilityScript } from '../../services/gemini';
import type { Task } from '../../types';
import { Button } from '../ui/Button';
import { Phone, PhoneOff, Volume2 } from 'lucide-react';

interface AccountabilityCallProps {
  task: Task | null;
  trigger?: boolean;
  onComplete?: () => void;
}

export function AccountabilityCall({ task, trigger, onComplete }: AccountabilityCallProps) {
  const { userProfile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [script, setScript] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    if (trigger && task) {
      setIsOpen(true);
      setLoading(true);
      setCallDuration(0);

      generateAccountabilityScript(task, userProfile?.personality || 'supportive-friend')
        .then(setScript)
        .catch(() => setScript(`Hey! This is your accountability check about "${task.title}". Time to make it happen!`))
        .finally(() => setLoading(false));
    }
  }, [trigger, task, userProfile?.personality]);

  useEffect(() => {
    if (isOpen && !loading) {
      const interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isOpen, loading]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    setIsOpen(false);
    onComplete?.();
  };

  if (!task) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="w-full max-w-sm"
          >
            <div className="relative bg-gradient-to-b from-slate-800 to-slate-900 rounded-[2.5rem] p-3 shadow-2xl border border-slate-700">
              <div className="bg-slate-950 rounded-[2rem] overflow-hidden">
                <div className="h-6 bg-slate-950 flex items-center justify-center">
                  <div className="w-20 h-5 bg-slate-900 rounded-full" />
                </div>

                <div className="p-6 text-center">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-4xl shadow-lg"
                  >
                    😊
                  </motion.div>

                  <h3 className="text-lg font-semibold text-slate-100 mb-1">
                    Buddy
                  </h3>
                  <p className="text-sm text-slate-400 mb-2">
                    {formatDuration(callDuration)}
                  </p>

                  <div className="mt-4 p-4 bg-slate-900/50 rounded-xl text-left min-h-[120px]">
                    {loading ? (
                      <div className="flex items-center gap-2 text-slate-400">
                        <Volume2 className="w-4 h-4 animate-pulse" />
                        <span>Connecting...</span>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {script}
                      </p>
                    )}
                  </div>

                  <div className="mt-6 flex justify-center gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleEndCall}
                      className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center shadow-lg"
                    >
                      <PhoneOff className="w-6 h-6 text-white" />
                    </motion.button>
                  </div>

                  <p className="text-xs text-slate-500 mt-4">
                    Tap to end call
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function AccountabilityCallButton({ task, onTrigger }: { task: Task | null; onTrigger: () => void }) {
  if (!task || task.riskScore < 70) return null;

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={onTrigger}
      className="gap-2"
    >
      <Phone className="w-4 h-4 text-emerald-400" />
      Accountability Call
    </Button>
  );
}
