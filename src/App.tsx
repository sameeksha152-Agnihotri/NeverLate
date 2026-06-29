import { useState, Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { TaskProvider } from './contexts/TaskContext';
import { Layout } from './components/layout/Layout';
import { AIBuddy } from './components/buddy/AIBuddy';
import { PanicButton } from './components/modals/PanicButton';
import { RescueMode } from './components/modals/RescueMode';
import { AuthPage } from './pages/AuthPage';
import type { Task } from './types';
import './styles/globals.css';

const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const TasksPage = lazy(() => import('./pages/TasksPage').then(m => ({ default: m.TasksPage })));
const AchievementsPage = lazy(() => import('./pages/AchievementsPage').then(m => ({ default: m.AchievementsPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div
        className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
        style={{ borderColor: 'var(--accent-primary)', borderTopColor: 'transparent' }}
      />
    </div>
  );
}

function AppContent() {
  const { firebaseUser, loading: authLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [rescueTask, setRescueTask] = useState<Task | null>(null);
  const [showRescue, setShowRescue] = useState(false);

  const handleRescue = (task: Task) => {
    setRescueTask(task);
    setShowRescue(true);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div
            className="w-12 h-12 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: 'var(--accent-primary)', borderTopColor: 'transparent' }}
          />
          <p className="text-theme-secondary">Loading NeverLate...</p>
        </div>
      </div>
    );
  }

  if (!firebaseUser) {
    return <AuthPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <Dashboard onRescue={handleRescue} />
          </Suspense>
        );
      case 'tasks':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <TasksPage onRescue={handleRescue} />
          </Suspense>
        );
      case 'achievements':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <AchievementsPage />
          </Suspense>
        );
      case 'settings':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <SettingsPage />
          </Suspense>
        );
      default:
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <Dashboard onRescue={handleRescue} />
          </Suspense>
        );
    }
  };

  return (
    <TaskProvider>
      <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
        {renderPage()}
      </Layout>
      <AIBuddy />
      <PanicButton />
      <RescueMode
        task={rescueTask}
        isOpen={showRescue}
        onClose={() => {
          setShowRescue(false);
          setRescueTask(null);
        }}
      />
    </TaskProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
