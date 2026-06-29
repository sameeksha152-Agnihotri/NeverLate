import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTasks } from '../contexts/TaskContext';
import { TaskCard } from '../components/tasks/TaskCard';
import { RiskGauge } from '../components/ui/RiskGauge';
import { Card, CardBody } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { Button } from '../components/ui/Button';
import { FutureSimulator, RoastFeedback } from '../components/modals/ExcuseDetector';
import { AccountabilityCall, AccountabilityCallButton } from '../components/modals/AccountabilityCall';
import { EnergyTaskRecommendation, StreakCity } from '../components/analytics/StreakCity';
import { FocusBubble, FocusModeToggle } from '../components/analytics/FocusBubble';
import type { Task, EnergyLevel } from '../types';
import { updateUserEnergy } from '../services/firestore';
import { Flame, Trophy, Clock, Target, TrendingUp, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Zap } from 'lucide-react';

interface DashboardProps {
  onRescue: (task: Task) => void;
}

export function Dashboard({ onRescue }: DashboardProps) {
  const { userProfile, refreshUserProfile } = useAuth();
  const { activeTasks, getRiskiestTask, getAverageRisk, postponeTask } = useTasks();

  const riskiestTask = getRiskiestTask();
  const averageRisk = getAverageRisk();

  const [showAccountabilityCall, setShowAccountabilityCall] = useState(false);
  const [focusTask, setFocusTask] = useState<Task | null>(null);

  const handleEnergyChange = async (energy: EnergyLevel) => {
    if (!userProfile) return;
    try {
      await updateUserEnergy(userProfile.uid, energy);
      await refreshUserProfile();
    } catch (error) {
      console.error('Failed to update energy:', error);
    }
  };

  const handleFocusComplete = async () => {
    if (focusTask) {
      await postponeTask(focusTask.id);
      setFocusTask(null);
    }
  };

  const statCards = [
    {
      label: 'Streak',
      value: userProfile?.streakDays || 0,
      unit: 'days',
      icon: Flame,
      iconClassName: 'text-[var(--accent-warm)]',
    },
    {
      label: 'Total XP',
      value: userProfile?.xp || 0,
      unit: '',
      icon: TrendingUp,
      iconClassName: 'text-[var(--accent-success)]',
    },
    {
      label: 'Completed',
      value: userProfile?.completedCount || 0,
      unit: 'tasks',
      icon: CheckCircle,
      iconClassName: 'text-[var(--accent-secondary)]',
    },
    {
      label: 'Rewards',
      value: userProfile?.entertainmentMinutes || 0,
      unit: 'mins',
      icon: Clock,
      iconClassName: 'text-[var(--accent-primary)]',
    },
  ];

  return (
    <div className="page-container pb-24">
      {/* Focus bubble mode */}
      {focusTask && (
        <FocusBubble
          task={focusTask}
          onComplete={handleFocusComplete}
          onExit={() => setFocusTask(null)}
        />
      )}

      {/* Accountability call modal */}
      <AccountabilityCall
        task={riskiestTask}
        trigger={showAccountabilityCall}
        onComplete={() => setShowAccountabilityCall(false)}
      />

      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">
            Welcome back, {userProfile?.displayName?.split(' ')[0] || 'there'}
          </h1>
          <p className="page-subtitle">
            {activeTasks.length === 0
              ? 'No active tasks. Add some tasks to get started!'
              : `You have ${activeTasks.length} active task${activeTasks.length === 1 ? '' : 's'} to focus on`}
          </p>
        </div>

        {averageRisk >= 70 && (
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl border"
            style={{
              background: 'color-mix(in srgb, var(--accent-danger) 10%, transparent)',
              borderColor: 'color-mix(in srgb, var(--accent-danger) 25%, transparent)',
            }}
          >
            <AlertTriangle className="w-4 h-4 text-[var(--accent-danger)]" />
            <span className="text-sm font-medium text-[var(--accent-danger)]">High risk detected</span>
          </div>
        )}
      </header>

      {/* Stats grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardBody>
              <StatCard
                label={stat.label}
                value={stat.value}
                unit={stat.unit}
                icon={stat.icon}
                iconClassName={stat.iconClassName}
              />
            </CardBody>
          </Card>
        ))}
      </section>

      {/* Main content */}
      <div className="grid lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Left column */}
        <div className="lg:col-span-4 flex flex-col gap-6 lg:gap-8">
          {/* Average Risk */}
          <Card>
            <CardBody>
              <div className="flex flex-col items-center py-4">
                <p className="section-label mb-8">Average Risk</p>
                <RiskGauge score={averageRisk} size="lg" />
                <p className="text-sm text-theme-secondary mt-8 text-center max-w-[220px] leading-relaxed">
                  {averageRisk >= 85
                    ? 'Critical! Immediate action needed.'
                    : averageRisk >= 65
                    ? 'High risk. Prioritize your tasks.'
                    : averageRisk >= 40
                    ? 'Moderate risk. Stay focused.'
                    : 'Looking good! Keep it up.'}
                </p>
              </div>
            </CardBody>
          </Card>

          {/* Streak City */}
          <StreakCity />
        </div>

        {/* Right column */}
        <div className="lg:col-span-8 flex flex-col gap-6 lg:gap-8">
          {/* Riskiest Task */}
          <Card>
            <CardBody>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className="p-2.5 rounded-xl"
                    style={{ background: 'var(--stat-icon-bg)' }}
                  >
                    <Target className="w-4 h-4 text-[var(--accent-warm)]" />
                  </div>
                  <h3 className="section-title">Focus Priority</h3>
                </div>
                {riskiestTask && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <AccountabilityCallButton
                      task={riskiestTask}
                      onTrigger={() => setShowAccountabilityCall(true)}
                    />
                    <FocusModeToggle
                      task={riskiestTask}
                      onEnterFocus={() => setFocusTask(riskiestTask)}
                    />
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onRescue(riskiestTask)}
                    >
                      <Zap className="w-4 h-4" />
                      Rescue
                    </Button>
                  </div>
                )}
              </div>

              {riskiestTask ? (
                <div className="flex flex-col gap-6">
                  <TaskCard task={riskiestTask} onRescue={onRescue} />
                  <div className="flex justify-end">
                    <FutureSimulator task={riskiestTask} />
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center">
                  <div
                    className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5"
                    style={{ background: 'var(--bg-elevated)' }}
                  >
                    <Trophy className="w-8 h-8 text-theme-muted" />
                  </div>
                  <p className="text-theme-secondary font-medium">All caught up!</p>
                  <p className="text-sm text-theme-muted mt-2">Add tasks to see your focus priority</p>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Energy-based recommendation */}
          <div className="grid sm:grid-cols-2 gap-6 lg:gap-8">
            <Card>
              <CardBody>
                <h3 className="section-title mb-5">How are you feeling?</h3>
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  <Button
                    variant={userProfile?.energy === 'tired' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => handleEnergyChange('tired')}
                  >
                    Tired
                  </Button>
                  <Button
                    variant={userProfile?.energy === 'normal' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => handleEnergyChange('normal')}
                  >
                    Normal
                  </Button>
                  <Button
                    variant={userProfile?.energy === 'energetic' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => handleEnergyChange('energetic')}
                  >
                    Energetic
                  </Button>
                </div>
                <EnergyTaskRecommendation
                  tasks={activeTasks}
                  energy={userProfile?.energy || 'normal'}
                />
              </CardBody>
            </Card>

            {activeTasks.filter(t => t.postponeCount > 0).length > 0 && (
              <RoastFeedback tasks={activeTasks} />
            )}
          </div>
        </div>
      </div>

      {/* High Risk Tasks */}
      {activeTasks.filter((t) => t.riskScore >= 70).length > 0 && (
        <Card>
          <CardBody>
            <div className="flex items-center gap-3 mb-6">
              <div
                className="p-2.5 rounded-xl"
                style={{ background: 'color-mix(in srgb, var(--accent-danger) 12%, transparent)' }}
              >
                <AlertTriangle className="w-4 h-4 text-[var(--accent-danger)]" />
              </div>
              <h3 className="section-title">High Risk Tasks</h3>
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
              >
                {activeTasks.filter((t) => t.riskScore >= 70).length}
              </span>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 lg:gap-6">
              {activeTasks
                .filter((t) => t.riskScore >= 70)
                .slice(0, 4)
                .map((task) => (
                  <TaskCard key={task.id} task={task} onRescue={onRescue} compact />
                ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
