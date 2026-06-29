import { useAuth } from '../contexts/AuthContext';
import { Card, CardBody } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { Trophy, Lock, CircleCheck as CheckCircle, Flame, Target, Clock, Zap } from 'lucide-react';
import { cn } from '../utils/helpers';

function ProgressRing({ percent }: { percent: number }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative flex-shrink-0">
      <svg width="96" height="96" viewBox="0 0 96 96" className="progress-ring">
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--accent-primary)" />
            <stop offset="100%" stopColor="var(--accent-secondary)" />
          </linearGradient>
        </defs>
        <circle className="progress-ring__track" cx="48" cy="48" r={radius} />
        <circle
          className="progress-ring__fill"
          cx="48"
          cy="48"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-theme-primary">{Math.round(percent)}%</span>
        <span className="text-[10px] text-theme-muted uppercase tracking-wider">Done</span>
      </div>
    </div>
  );
}

export function AchievementsPage() {
  const { userProfile } = useAuth();

  const badges = userProfile?.badges || [];
  const unlockedCount = badges.filter((b) => b.unlockedAt).length;
  const totalCount = badges.length || 1;
  const progressPercent = (unlockedCount / totalCount) * 100;

  const stats = [
    { icon: Flame, label: 'Day Streak', value: userProfile?.streakDays || 0, iconClassName: 'text-[var(--accent-warm)]' },
    { icon: Target, label: 'Completed', value: userProfile?.completedCount || 0, iconClassName: 'text-[var(--accent-secondary)]' },
    { icon: Zap, label: 'Total XP', value: userProfile?.xp || 0, iconClassName: 'text-[var(--accent-success)]' },
    { icon: Clock, label: 'Rewards', value: `${userProfile?.entertainmentMinutes || 0} mins`, iconClassName: 'text-[var(--accent-primary)]' },
  ];

  return (
    <div className="page-container pb-24">
      {/* Header */}
      <header>
        <h1 className="page-title">Achievements</h1>
        <p className="page-subtitle">
          {unlockedCount} of {totalCount} badges unlocked
        </p>
      </header>

      {/* Progress overview */}
      <section className="page-section">
        <Card hoverable={false}>
          <CardBody>
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <ProgressRing percent={progressPercent} />

              <div className="flex-1 w-full text-center sm:text-left">
                <h2 className="text-lg font-semibold text-theme-primary mb-1">Badge Progress</h2>
                <p className="text-sm text-theme-secondary mb-5">
                  Keep completing tasks to unlock more achievements
                </p>
                <div className="progress-bar mb-2">
                  <div
                    className="progress-bar__fill"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-xs text-theme-muted">
                  {unlockedCount} unlocked · {totalCount - unlockedCount} remaining
                </p>
              </div>

              <div
                className="hidden sm:flex w-16 h-16 rounded-2xl items-center justify-center flex-shrink-0 gaming-glow"
                style={{
                  background: 'var(--progress-gradient)',
                  boxShadow: '0 8px 24px color-mix(in srgb, var(--accent-primary) 30%, transparent)',
                }}
              >
                <Trophy className="w-8 h-8 text-white" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:gap-6 mt-8 pt-8 border-t border-[var(--border-subtle)]">
              <div
                className="text-center p-5 rounded-xl"
                style={{ background: 'var(--bg-elevated)' }}
              >
                <p className="text-3xl font-bold text-[var(--accent-warm)] tabular-nums">{unlockedCount}</p>
                <p className="text-xs text-theme-muted mt-2 font-medium uppercase tracking-wider">Unlocked</p>
              </div>
              <div
                className="text-center p-5 rounded-xl"
                style={{ background: 'var(--bg-elevated)' }}
              >
                <p className="text-3xl font-bold text-theme-muted tabular-nums">{totalCount - unlockedCount}</p>
                <p className="text-xs text-theme-muted mt-2 font-medium uppercase tracking-wider">Remaining</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </section>

      {/* Badges grid */}
      <section className="page-section">
        <h2 className="section-title mb-1">All Badges</h2>
        <p className="text-sm text-theme-muted mb-4">Earn badges by hitting productivity milestones</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {badges.map((badge) => {
            const isUnlocked = !!badge.unlockedAt;

            return (
              <Card
                key={badge.id}
                variant={isUnlocked ? 'achievement-unlocked' : 'achievement-locked'}
                hoverable={isUnlocked}
              >
                <CardBody>
                  <div
                    className={cn(
                      'achievement-badge',
                      isUnlocked ? 'achievement-badge--unlocked' : 'achievement-badge--locked'
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className="achievement-badge__icon">
                        {isUnlocked ? (
                          <span className="text-2xl">{badge.icon}</span>
                        ) : (
                          <Lock className="w-5 h-5 text-theme-muted" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <h3 className="achievement-badge__title text-sm font-semibold text-theme-primary">
                          {badge.name}
                        </h3>
                        <p className="achievement-badge__desc text-xs text-theme-secondary mt-2 leading-relaxed">
                          {badge.description}
                        </p>
                        {isUnlocked && (
                          <div className="achievement-unlocked-tag">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Unlocked
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Stats */}
      <section className="page-section">
        <Card>
          <CardBody>
            <h3 className="section-title mb-6">Your Stats</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="p-5 rounded-xl"
                  style={{ background: 'var(--bg-elevated)' }}
                >
                  <StatCard
                    label={stat.label}
                    value={stat.value}
                    icon={stat.icon}
                    iconClassName={stat.iconClassName}
                  />
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </section>
    </div>
  );
}
