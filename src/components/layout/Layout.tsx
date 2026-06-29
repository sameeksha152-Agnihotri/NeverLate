import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import type { BuddyPersonality } from '../../types';
import { Menu, X, LayoutDashboard, ListTodo, Trophy, Settings, LogOut, User } from 'lucide-react';
import { cn } from '../../utils/helpers';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { userProfile, logOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: ListTodo },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const personalityLabels: Record<BuddyPersonality, string> = {
    'strict-teacher': 'Strict Teacher',
    'supportive-friend': 'Supportive Friend',
    'professional-coach': 'Professional Coach',
    'funny-buddy': 'Funny Buddy',
    'drill-sergeant': 'Drill Sergeant',
  };

  const handleNavigate = (page: string) => {
    onNavigate(page);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-3 app-card"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-5 h-5 text-theme-secondary" /> : <Menu className="w-5 h-5 text-theme-secondary" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'app-sidebar fixed lg:sticky top-0 left-0 h-screen',
          'w-[280px] lg:w-[272px] flex-shrink-0',
          'z-40',
          'transform transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-6 py-6 border-b border-[var(--border-subtle)]">
            <h1 className="text-xl font-bold logo-text tracking-tight">
              NeverLate
            </h1>
            <p className="text-xs text-theme-muted mt-2 tracking-wide">AI Productivity Companion</p>
          </div>

          {/* User profile */}
          <div className="px-5 py-5">
            <div className="p-4 app-card" style={{ boxShadow: 'none', pointerEvents: 'none' }}>
              <div className="flex items-center gap-3">
                {userProfile?.photoURL ? (
                  <img
                    src={userProfile.photoURL}
                    alt={userProfile.displayName || 'User'}
                    className="w-12 h-12 rounded-full border-2 border-[var(--border-active)] object-cover"
                  />
                ) : (
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center border-2 border-[var(--border-active)]"
                    style={{ background: 'var(--bg-nav-active)' }}
                  >
                    <User className="w-5 h-5 text-theme-accent" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-theme-primary truncate">
                    {userProfile?.displayName || 'User'}
                  </p>
                  <p className="text-xs text-theme-muted mt-0.5">
                    Level {Math.floor((userProfile?.xp || 0) / 100) + 1}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <span className="section-label">XP</span>
                <div className="flex-1 progress-bar h-1.5">
                  <div
                    className="progress-bar__fill h-full"
                    style={{ width: `${((userProfile?.xp || 0) % 100)}%` }}
                  />
                </div>
                <span className="text-xs text-theme-secondary font-semibold tabular-nums">
                  {userProfile?.xp || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-2 overflow-y-auto">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={cn(
                    'nav-item',
                    currentPage === item.id && 'nav-item--active'
                  )}
                >
                  <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </nav>

          {/* Buddy personality */}
          <div className="px-5 py-5 border-t border-[var(--border-subtle)]">
            <p className="section-label mb-2">Buddy Mode</p>
            <p className="text-sm text-theme-primary font-medium">
              {userProfile?.personality && personalityLabels[userProfile.personality]}
            </p>
          </div>

          {/* Logout */}
          <div className="px-4 pb-6">
            <button
              onClick={logOut}
              className="nav-item w-full"
            >
              <LogOut className="w-[18px] h-[18px]" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  return (
    <div className="min-h-screen flex">
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
      <main className="flex-1 min-w-0 overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 pt-24 lg:pt-10">
          {children}
        </div>
      </main>
    </div>
  );
}
