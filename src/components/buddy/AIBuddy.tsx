import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTasks } from '../../contexts/TaskContext';
import { useAuth } from '../../contexts/AuthContext';
import { getBuddyMessage } from '../../services/gemini';
import { getBuddyMood } from '../../utils/helpers';
import { Award } from 'lucide-react';

export function AIBuddy() {
  const { userProfile } = useAuth();
  const { getRiskiestTask, getAverageRisk, activeTasks } = useTasks();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const averageRisk = getAverageRisk();
  const mood = getBuddyMood(averageRisk);
  const riskiestTask = getRiskiestTask();

  const fetchMessage = async () => {
    if (!userProfile || loading) return;
    setLoading(true);
    try {
      const buddyMessage = await getBuddyMessage(
        userProfile.personality,
        riskiestTask,
        activeTasks
      );
      setMessage(buddyMessage);
    } catch {
      setMessage('Hey! Ready to crush some tasks today?');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen && !message) {
      fetchMessage();
    }
  };

  useEffect(() => {
    if (isOpen && !message) {
      fetchMessage();
    }
  }, [isOpen]);

  const getMoodGradient = () => {
    if (averageRisk >= 85) return 'from-red-500 to-orange-500';
    if (averageRisk >= 65) return 'from-orange-500 to-amber-500';
    if (averageRisk >= 40) return 'from-amber-500 to-yellow-500';
    return 'from-emerald-400 to-teal-400';
  };

  return (
    <div className="fixed bottom-20 right-6 z-40 flex flex-col items-end">
      {/* Message popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-3 w-72 bg-slate-900/95 border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/30 overflow-hidden backdrop-blur-xl"
          >
            {/* Header */}
            <div className={`bg-gradient-to-r ${getMoodGradient()} px-4 py-3`}>
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{mood}</span>
                <span className="font-semibold text-slate-900">Buddy</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <p className="text-sm text-slate-300 leading-relaxed">
                  {message || 'Hi! Click me anytime for motivation.'}
                </p>
              )}

              {/* Stats */}
              <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-500">
                <span>Avg Risk: {averageRisk}%</span>
                <span>{activeTasks.length} tasks</span>
              </div>

              {/* Refresh button */}
              <button
                onClick={fetchMessage}
                disabled={loading}
                className="mt-3 w-full py-2 text-xs font-medium text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
              >
                Get Another Message
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Avatar button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggle}
        className={`
          relative w-14 h-14 rounded-2xl
          bg-gradient-to-br ${getMoodGradient()}
          shadow-lg shadow-black/20
          flex items-center justify-center
          text-3xl
          transition-all duration-300
          ${averageRisk >= 85 ? 'animate-heartbeat' : ''}
        `}
      >
        {mood}

        {/* Pulse ring for critical */}
        {averageRisk >= 85 && (
          <motion.span
            className="absolute inset-0 rounded-2xl border-2 border-red-500"
            animate={{ scale: [1, 1.15, 1], opacity: [1, 0, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
        )}
      </motion.button>

      {/* Badge indicator */}
      {userProfile?.badges.some((b: { unlockedAt?: Date }) => b.unlockedAt) && (
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center shadow-lg">
          <Award className="w-3 h-3 text-slate-900" />
        </div>
      )}
    </div>
  );
}
