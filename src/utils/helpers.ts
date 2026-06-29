export function formatTimeRemaining(deadline: Date): string {
  const now = new Date();
  const diff = deadline.getTime() - now.getTime();

  if (diff < 0) {
    const hoursAgo = Math.abs(Math.round(diff / (1000 * 60 * 60)));
    if (hoursAgo < 24) {
      return `${hoursAgo}h ago`;
    }
    const daysAgo = Math.round(hoursAgo / 24);
    return `${daysAgo}d ago`;
  }

  const hours = Math.round(diff / (1000 * 60 * 60));

  if (hours < 1) {
    const minutes = Math.round(diff / (1000 * 60));
    return `${minutes}m left`;
  }

  if (hours < 24) {
    return `${hours}h left`;
  }

  const days = Math.round(hours / 24);
  return `${days}d left`;
}

export function formatDateTime(date: Date): string {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function getRiskColor(score: number): string {
  if (score >= 85) return '#ef4444';
  if (score >= 65) return '#f97316';
  if (score >= 40) return '#f59e0b';
  return '#10b981';
}

export function getRiskBgColor(score: number): string {
  if (score >= 85) return 'rgba(239, 68, 68, 0.15)';
  if (score >= 65) return 'rgba(249, 115, 22, 0.15)';
  if (score >= 40) return 'rgba(245, 158, 11, 0.15)';
  return 'rgba(16, 185, 129, 0.15)';
}

export function getBuddyMood(averageRisk: number): string {
  if (averageRisk >= 85) return '🚨';
  if (averageRisk >= 65) return '😟';
  if (averageRisk >= 40) return '😐';
  return '😊';
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function hoursToReadable(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)} mins`;
  }
  if (hours < 24) {
    const h = Math.floor(hours);
    const mins = Math.round((hours - h) * 60);
    return mins > 0 ? `${h}h ${mins}m` : `${h}h`;
  }
  const days = Math.floor(hours / 24);
  const remainingHours = Math.round(hours % 24);
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
}
