import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AppShell } from './components/AppShell';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { PlannerPage } from './pages/PlannerPage';
import { TasksPage } from './pages/TasksPage';
import { ExecutionPage } from './pages/ExecutionPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AnimatePresence, motion } from 'motion/react';

const AppContent: React.FC = () => {
  const { currentPage, authInitialized, dataSyncing, user, tasks } = useApp();

  if (!authInitialized) {
    return (
      <div className="min-h-screen bg-[#020204] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-mono font-bold text-sm tracking-tighter text-white animate-pulse">
            D
          </div>
          <div className="text-zinc-500 font-mono text-[10px] tracking-widest uppercase animate-pulse">Initializing Environment...</div>
        </div>
      </div>
    );
  }

  // Render standalone views (No sidebar, no headers)
  if (currentPage === 'landing') {
    return (
      <AnimatePresence mode="wait">
        <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
          <LandingPage />
        </motion.div>
      </AnimatePresence>
    );
  }

  if (currentPage === 'auth') {
    return (
      <AnimatePresence mode="wait">
        <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
          <AuthPage />
        </motion.div>
      </AnimatePresence>
    );
  }

  // Render main application shell views
  return (
    <AppShell>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.2 }}
          className="h-full"
        >
          {(() => {
            switch (currentPage) {
              case 'dashboard':
                return <DashboardPage />;
              case 'planner':
                return <PlannerPage />;
              case 'tasks':
                return <TasksPage />;
              case 'execution':
                return <ExecutionPage />;
              case 'analytics':
                return <AnalyticsPage />;
              case 'settings':
                return <SettingsPage />;
              case 'profile':
                return <ProfilePage />;
              default:
                return <DashboardPage />;
            }
          })()}
        </motion.div>
      </AnimatePresence>
    </AppShell>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
