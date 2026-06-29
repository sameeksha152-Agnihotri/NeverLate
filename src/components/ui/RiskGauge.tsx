import { cn, getRiskColor } from '../../utils/helpers';

interface RiskGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animate?: boolean;
}

export function RiskGauge({ score, size = 'md', showLabel = true, animate = true }: RiskGaugeProps) {
  const sizes = {
    sm: { width: 72, stroke: 5 },
    md: { width: 100, stroke: 6 },
    lg: { width: 140, stroke: 7 },
  };

  const { width, stroke } = sizes[size];
  const radius = (width / 2) - stroke - 4;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color = getRiskColor(score);
  const isCritical = score >= 85;

  const labelColor = isCritical ? 'text-red-400' : score >= 65 ? 'text-orange-400' : score >= 40 ? 'text-amber-400' : 'text-emerald-400';
  const labelText = isCritical ? 'Critical' : score >= 65 ? 'High' : score >= 40 ? 'Moderate' : 'Safe';

  return (
    <div className={cn('flex flex-col items-center gap-3', isCritical && animate && 'animate-pulse-slow')}>
      <div className="relative" style={{ width, height: width }}>
        {/* Background glow for critical */}
        {isCritical && (
          <div
            className="absolute inset-0 rounded-full opacity-30 blur-xl"
            style={{ backgroundColor: color }}
          />
        )}

        <svg
          width={width}
          height={width}
          viewBox={`0 0 ${width} ${width}`}
          className="relative z-10"
        >
          {/* Track */}
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-slate-800"
          />

          {/* Progress */}
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            transform={`rotate(-90 ${width / 2} ${width / 2})`}
            className={cn(
              'transition-all duration-700 ease-out',
              isCritical && animate && 'animate-heartbeat'
            )}
            style={{
              filter: isCritical ? `drop-shadow(0 0 10px ${color})` : undefined,
            }}
          />

          {/* Inner decorative ring */}
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius - stroke - 4}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-slate-700/30"
            strokeDasharray="4 4"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
          <span
            className="font-bold font-mono tracking-tight"
            style={{
              fontSize: size === 'sm' ? '1.25rem' : size === 'md' ? '1.75rem' : '2.5rem',
              color,
            }}
          >
            {score}
          </span>
          {size === 'lg' && (
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-medium mt-0.5">
              Risk
            </span>
          )}
        </div>
      </div>

      {showLabel && (
        <div
          className={cn(
            'text-xs font-semibold px-3 py-1 rounded-full border',
            labelColor,
            isCritical ? 'bg-red-500/10 border-red-500/30' :
            score >= 65 ? 'bg-orange-500/10 border-orange-500/30' :
            score >= 40 ? 'bg-amber-500/10 border-amber-500/30' :
            'bg-emerald-500/10 border-emerald-500/30'
          )}
        >
          {labelText}
        </div>
      )}
    </div>
  );
}
