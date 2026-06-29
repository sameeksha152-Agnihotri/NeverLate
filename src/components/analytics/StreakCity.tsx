import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTasks } from '../../contexts/TaskContext';
import { getEnergyBasedTaskRecommendation } from '../../services/gemini';
import type { Task, EnergyLevel } from '../../types';
import { Card, CardBody } from '../ui/Card';
import { Battery, Coffee, Zap, Target, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../../utils/helpers';

interface EnergySelectorProps {
  currentEnergy: EnergyLevel;
  onChange: (energy: EnergyLevel) => void;
}

export function EnergySelector({ currentEnergy, onChange }: EnergySelectorProps) {
  const [expanded, setExpanded] = useState(false);

  const options: { id: EnergyLevel; label: string; icon: React.ElementType; color: string }[] = [
    { id: 'tired', label: 'Tired', icon: Battery, color: 'text-slate-400' },
    { id: 'normal', label: 'Normal', icon: Coffee, color: 'text-amber-400' },
    { id: 'energetic', label: 'Energetic', icon: Zap, color: 'text-emerald-400' },
  ];

  const current = options.find(o => o.id === currentEnergy) || options[1];
  const CurrentIcon = current.icon;

  return (
    <div className="relative">
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg transition-all",
          "bg-slate-800/50 border border-slate-700 hover:border-amber-500/50",
          expanded && "border-amber-500/50"
        )}
      >
        <CurrentIcon className={cn("w-5 h-5", current.color)} />
        <span className="text-sm text-slate-300">{current.label}</span>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-slate-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-500" />
        )}
      </button>

      {expanded && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setExpanded(false)} />
          <div className="absolute top-full mt-2 left-0 z-20 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden animate-scale-in min-w-[150px]">
            {options.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    onChange(opt.id);
                    setExpanded(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors",
                    currentEnergy === opt.id
                      ? "bg-amber-500/10 text-amber-400"
                      : "text-slate-300 hover:bg-slate-700"
                  )}
                >
                  <Icon className={cn("w-4 h-4", opt.color)} />
                  {opt.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

interface EnergyTaskRecommendationProps {
  tasks: Task[];
  energy: EnergyLevel;
}

export function EnergyTaskRecommendation({ tasks, energy }: EnergyTaskRecommendationProps) {
  const { userProfile } = useAuth();
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tasks.length === 0) return;

    setLoading(true);
    getEnergyBasedTaskRecommendation(tasks, energy, userProfile?.personality || 'supportive-friend')
      .then(setRecommendation)
      .catch(() => {
        const sorted = [...tasks].sort((a, b) => b.riskScore - a.riskScore);
        setRecommendation(`Work on: "${sorted[0].title}" - highest priority with ${sorted[0].riskScore}% risk.`);
      })
      .finally(() => setLoading(false));
  }, [tasks, energy, userProfile?.personality]);

  if (tasks.length === 0) return null;

  const getEnergyGradient = () => {
    switch (energy) {
      case 'tired':
        return 'from-slate-600 to-slate-700';
      case 'normal':
        return 'from-amber-600 to-orange-600';
      case 'energetic':
        return 'from-emerald-500 to-teal-500';
    }
  };

  return (
    <Card className={cn("border", energy === 'energetic' ? 'border-emerald-500/30' : energy === 'normal' ? 'border-amber-500/30' : 'border-slate-600/30')}>
      <CardBody>
        <div className="flex items-center gap-3 mb-3">
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-r", getEnergyGradient())}>
            <Target className="w-4 h-4 text-white" />
          </div>
          <h4 className="text-sm font-medium text-slate-300">Best task for your energy</h4>
        </div>

        {loading ? (
          <div className="h-12 bg-slate-800/50 rounded-lg animate-pulse" />
        ) : recommendation ? (
          <p className="text-sm text-slate-200 leading-relaxed">{recommendation}</p>
        ) : null}
      </CardBody>
    </Card>
  );
}

export function StreakCity() {
  const { userProfile } = useAuth();
  const { completedTasks, missedTasks } = useTasks();

  const streakDays = userProfile?.streakDays || 0;
  const completedCount = completedTasks.length;
  const missedCount = missedTasks.length;

  const buildings = Math.min(20, Math.floor(completedCount / 2));
  const hasRain = missedCount > 0;
  const isGrey = streakDays === 0 && completedCount === 0;

  return (
    <Card>
      <CardBody>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-slate-400">Productivity City</h3>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>{buildings} buildings</span>
            {hasRain && <span className="text-blue-400">Rainy</span>}
          </div>
        </div>

        <div className={cn(
          "relative h-32 rounded-lg overflow-hidden transition-all duration-500",
          isGrey ? "bg-slate-800" : hasRain ? "bg-gradient-to-b from-slate-600 to-slate-700" : "bg-gradient-to-b from-sky-900 to-sky-800"
        )}>
          {!isGrey && !hasRain && (
            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-yellow-400 shadow-lg shadow-yellow-400/50" />
          )}

          {hasRain && (
            <div className="absolute inset-0 opacity-30">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-0.5 h-4 bg-blue-400 animate-rain"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: '1s',
                  }}
                />
              ))}
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 h-2 bg-slate-700" />

          <div className="absolute bottom-2 left-0 right-0 flex items-end justify-center gap-1 px-4">
            {[...Array(buildings)].map((_, i) => {
              const height = 20 + Math.random() * 60;
              const width = 8 + Math.random() * 12;
              const isLit = !hasRain && Math.random() > 0.3;

              return (
                <div
                  key={i}
                  className={cn(
                    "relative rounded-t-sm transition-all duration-300",
                    isGrey ? "bg-slate-600" : hasRain ? "bg-slate-500" : "bg-slate-300"
                  )}
                  style={{ height, width }}
                >
                  <div className="absolute inset-1 grid grid-cols-2 gap-0.5 p-0.5">
                    {[...Array(4)].map((_, j) => (
                      <div
                        key={j}
                        className={cn(
                          "rounded-xs",
                          isLit && !isGrey ? "bg-yellow-400/80" : "bg-slate-600"
                        )}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {buildings === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm">
              Complete tasks to build your city!
            </div>
          )}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 bg-slate-800/50 rounded-lg">
            <p className="text-lg font-bold text-amber-400">{streakDays}</p>
            <p className="text-slate-500">Day Streak</p>
          </div>
          <div className="p-2 bg-slate-800/50 rounded-lg">
            <p className="text-lg font-bold text-emerald-400">{completedCount}</p>
            <p className="text-slate-500">Completed</p>
          </div>
          <div className="p-2 bg-slate-800/50 rounded-lg">
            <p className="text-lg font-bold text-red-400">{missedCount}</p>
            <p className="text-slate-500">Missed</p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
