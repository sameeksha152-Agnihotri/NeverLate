import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { CircleAlert as AlertCircle, Mail, Lock, User, Settings } from 'lucide-react';

type AuthMode = 'login' | 'signup';

export function AuthPage() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, isConfigured } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        await signInWithEmail(email, password);
      } else {
        if (!displayName.trim()) {
          throw new Error('Please enter your name');
        }
        await signUpWithEmail(email, password, displayName.trim());
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      await signInWithGoogle();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Google sign-in failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3 tracking-tight">
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-orange-500 bg-clip-text text-transparent">
              NeverLate
            </span>
          </h1>
          <p className="text-slate-400 text-sm">Your AI Productivity Companion</p>
        </div>

        {/* Setup required message */}
        {!isConfigured && (
          <div className="bg-slate-900/80 border border-amber-500/25 rounded-2xl p-6 backdrop-blur-xl shadow-xl shadow-black/20 mb-4">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                <Settings className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-base font-semibold text-slate-100 mb-2">Setup Required</h2>
                <p className="text-sm text-slate-400 mb-3">
                  Configure Firebase to unlock all features.
                </p>
                <ol className="text-xs text-slate-500 space-y-1.5">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 font-medium">1.</span>
                    Create project at <span className="text-slate-400">console.firebase.google.com</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 font-medium">2.</span>
                    Enable Authentication + Firestore
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 font-medium">3.</span>
                    Add keys to <span className="text-slate-400">.env</span> file
                  </li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Auth card */}
        <div className="bg-slate-900/80 border border-slate-700/50 rounded-2xl backdrop-blur-xl shadow-xl shadow-black/20">
          {/* Tabs */}
          <div className="flex p-1.5 m-4 bg-slate-800/30 rounded-xl">
            <button
              onClick={() => setMode('login')}
              className={`
                flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200
                ${mode === 'login'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                  : 'text-slate-500 hover:text-slate-300'
                }
              `}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`
                flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200
                ${mode === 'signup'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                  : 'text-slate-500 hover:text-slate-300'
                }
              `}
            >
              Sign Up
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="mx-4 mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2.5 text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p className="text-xs">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
            {mode === 'signup' && (
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <Input
                  type="text"
                  placeholder="Your name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="pl-10"
                  required={mode === 'signup'}
                  disabled={!isConfigured}
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
                disabled={!isConfigured}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
                minLength={6}
                disabled={!isConfigured}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={loading}
              disabled={!isConfigured}
            >
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          {/* Divider */}
          <div className="mx-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-700/50" />
            <span className="text-xs text-slate-600">or continue with</span>
            <div className="flex-1 h-px bg-slate-700/50" />
          </div>

          {/* Google sign in */}
          <div className="p-6 pt-4">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={loading || !isConfigured}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </Button>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-slate-600">
          By signing in, you agree to let Buddy help keep you on track.
        </p>
      </div>
    </div>
  );
}
