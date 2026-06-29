import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme, type ThemeMode } from '../contexts/ThemeContext';
import { updateUserPersonality, updateUserEnergy } from '../services/firestore';
import type { BuddyPersonality, EnergyLevel } from '../types';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import {
  User,
  Shield,
  Zap,
  Smile,
  Briefcase,
  Laugh,
  Swords,
  Battery,
  Coffee,
  Sun,
  Moon,
  Gamepad2,
  Palette,
} from 'lucide-react';
import { cn } from '../utils/helpers';

const PERSONALITIES: { id: BuddyPersonality; name: string; icon: React.ElementType; description: string }[] = [
  {
    id: 'strict-teacher',
    name: 'Strict Teacher',
    icon: Shield,
    description: 'Firm, direct, and holds you accountable',
  },
  {
    id: 'supportive-friend',
    name: 'Supportive Friend',
    icon: Smile,
    description: 'Warm, encouraging, and friendly',
  },
  {
    id: 'professional-coach',
    name: 'Professional Coach',
    icon: Briefcase,
    description: 'Strategic and action-oriented',
  },
  {
    id: 'funny-buddy',
    name: 'Funny Buddy',
    icon: Laugh,
    description: 'Witty with plenty of humor',
  },
  {
    id: 'drill-sergeant',
    name: 'Drill Sergeant',
    icon: Swords,
    description: 'Intense with military urgency',
  },
];

const ENERGY_LEVELS: { id: EnergyLevel; name: string; icon: React.ElementType; description: string }[] = [
  {
    id: 'tired',
    name: 'Tired',
    icon: Battery,
    description: 'Low energy mode',
  },
  {
    id: 'normal',
    name: 'Normal',
    icon: Coffee,
    description: 'Standard recommendations',
  },
  {
    id: 'energetic',
    name: 'Energetic',
    icon: Zap,
    description: 'High energy mode',
  },
];

const THEMES: { id: ThemeMode; name: string; icon: React.ElementType; description: string }[] = [
  { id: 'light', name: 'Light', icon: Sun, description: 'Clean and minimal' },
  { id: 'dark', name: 'Dark', icon: Moon, description: 'Deep navy, default' },
  { id: 'gaming', name: 'Gaming', icon: Gamepad2, description: 'Cyber RPG aesthetic' },
];

export function SettingsPage() {
  const { userProfile, firebaseUser, refreshUserProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const [selectedPersonality, setSelectedPersonality] = useState<BuddyPersonality>('supportive-friend');
  const [selectedEnergy, setSelectedEnergy] = useState<EnergyLevel>('normal');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setSelectedPersonality(userProfile.personality);
      setSelectedEnergy(userProfile.energy);
    }
  }, [userProfile]);

  const handlePersonalityChange = async (personality: BuddyPersonality) => {
    if (!firebaseUser) return;
    setSaving(true);
    try {
      await updateUserPersonality(firebaseUser.uid, personality);
      setSelectedPersonality(personality);
      await refreshUserProfile();
    } catch (error) {
      console.error('Failed to update personality:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleEnergyChange = async (energy: EnergyLevel) => {
    if (!firebaseUser) return;
    setSaving(true);
    try {
      await updateUserEnergy(firebaseUser.uid, energy);
      setSelectedEnergy(energy);
      await refreshUserProfile();
    } catch (error) {
      console.error('Failed to update energy:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container max-w-3xl mx-auto pb-24">
      {/* Header */}
      <header>
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Customize your NeverLate experience</p>
      </header>

      {/* Appearance / Theme */}
      <Card hoverable={false}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-xl"
              style={{ background: 'var(--stat-icon-bg)' }}
            >
              <Palette className="w-4 h-4 text-theme-accent" />
            </div>
            <h2 className="section-title">Appearance</h2>
          </div>
        </CardHeader>
        <CardBody>
          <p className="text-sm text-theme-secondary mb-5">
            Choose a visual theme for your dashboard
          </p>
          <div className="grid grid-cols-3 gap-4">
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id)}
                className={cn(
                  'theme-option',
                  theme === t.id && 'theme-option--active'
                )}
              >
                <div className={cn('theme-preview', `theme-preview--${t.id}`)} />
                <t.icon className={cn('w-4 h-4', theme === t.id ? 'text-theme-accent' : 'text-theme-muted')} />
                <span className={cn('text-sm font-medium', theme === t.id ? 'text-theme-accent' : 'text-theme-primary')}>
                  {t.name}
                </span>
                <span className="text-[10px] text-theme-muted leading-tight">{t.description}</span>
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Profile section */}
      <Card hoverable={false}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
              <User className="w-4 h-4 text-theme-muted" />
            </div>
            <h2 className="section-title">Profile</h2>
          </div>
        </CardHeader>
        <CardBody>
          <div className="flex items-center gap-5">
            {userProfile?.photoURL ? (
              <img
                src={userProfile.photoURL}
                alt={userProfile.displayName || 'User'}
                className="w-16 h-16 rounded-full border-2 border-[var(--border-active)] object-cover"
              />
            ) : (
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center border-2 border-[var(--border-active)]"
                style={{ background: 'var(--bg-nav-active)' }}
              >
                <User className="w-7 h-7 text-theme-accent" />
              </div>
            )}
            <div>
              <p className="text-base font-semibold text-theme-primary">
                {userProfile?.displayName || 'User'}
              </p>
              <p className="text-sm text-theme-secondary mt-0.5">{userProfile?.email}</p>
              <p className="text-xs text-theme-muted mt-1">
                Level {Math.floor((userProfile?.xp || 0) / 100) + 1}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Buddy Personality */}
      <Card hoverable={false}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl" style={{ background: 'var(--stat-icon-bg)' }}>
              <Smile className="w-4 h-4 text-[var(--accent-warm)]" />
            </div>
            <h2 className="section-title">Buddy Personality</h2>
          </div>
        </CardHeader>
        <CardBody>
          <p className="text-sm text-theme-secondary mb-5">
            Choose how Buddy communicates with you
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {PERSONALITIES.map((p) => (
              <button
                key={p.id}
                onClick={() => handlePersonalityChange(p.id)}
                disabled={saving}
                className={cn(
                  'p-5 rounded-xl text-left transition-all duration-200 border',
                  selectedPersonality === p.id
                    ? 'border-[var(--border-active)]'
                    : 'border-[var(--border-subtle)] hover:border-[var(--border-active)]'
                )}
                style={{
                  background: selectedPersonality === p.id ? 'var(--bg-nav-active)' : 'var(--bg-elevated)',
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <p.icon
                    className={cn(
                      'w-4 h-4',
                      selectedPersonality === p.id ? 'text-theme-accent' : 'text-theme-muted'
                    )}
                  />
                  <span
                    className={cn(
                      'text-sm font-semibold',
                      selectedPersonality === p.id ? 'text-theme-accent' : 'text-theme-primary'
                    )}
                  >
                    {p.name}
                  </span>
                </div>
                <p className="text-xs text-theme-muted leading-relaxed">{p.description}</p>
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Energy Level */}
      <Card hoverable={false}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-xl"
              style={{ background: 'color-mix(in srgb, var(--accent-success) 12%, transparent)' }}
            >
              <Zap className="w-4 h-4 text-[var(--accent-success)]" />
            </div>
            <h2 className="section-title">Current Energy Level</h2>
          </div>
        </CardHeader>
        <CardBody>
          <p className="text-sm text-theme-secondary mb-5">
            Set your current energy level for better task recommendations
          </p>
          <div className="grid grid-cols-3 gap-4">
            {ENERGY_LEVELS.map((e) => (
              <button
                key={e.id}
                onClick={() => handleEnergyChange(e.id)}
                disabled={saving}
                className={cn(
                  'p-5 rounded-xl text-center transition-all duration-200 border',
                  selectedEnergy === e.id
                    ? 'border-[var(--border-active)]'
                    : 'border-[var(--border-subtle)] hover:border-[var(--border-active)]'
                )}
                style={{
                  background: selectedEnergy === e.id ? 'var(--bg-nav-active)' : 'var(--bg-elevated)',
                }}
              >
                <e.icon
                  className={cn(
                    'w-5 h-5 mx-auto mb-3',
                    selectedEnergy === e.id ? 'text-theme-accent' : 'text-theme-muted'
                  )}
                />
                <span
                  className={cn(
                    'block text-sm font-semibold mb-1.5',
                    selectedEnergy === e.id ? 'text-theme-accent' : 'text-theme-primary'
                  )}
                >
                  {e.name}
                </span>
                <p className="text-xs text-theme-muted">{e.description}</p>
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      
    </div>
  );
}
