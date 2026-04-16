// Root application — handles routing, onboarding gate, and global state (workouts + theme)
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Settings from './pages/Settings';
import Compare from './pages/Compare';
import StudyData from './pages/StudyData';
import Onboarding, { ONBOARDING_KEY } from './pages/Onboarding';
import { useWorkouts } from './hooks/useWorkouts';
import { useTheme } from './hooks/useTheme';

function AppRoutes() {
  const { entries, logWorkout, resetWorkouts } = useWorkouts();
  const { dark, toggle } = useTheme();

  // Check if the user has completed onboarding before
  const [hasOnboarded, setHasOnboarded] = useState(() =>
    localStorage.getItem(ONBOARDING_KEY) === 'true'
  );

  // Wipes all data and sends the user back to onboarding
  function handleReset() {
    resetWorkouts();
    setHasOnboarded(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f0d1a] text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <Routes>
        {/* Onboarding is shown before any other route if the user hasn't completed it */}
        <Route path="/welcome" element={<Onboarding onComplete={() => setHasOnboarded(true)} />} />
        <Route
          path="/*"
          element={
            hasOnboarded ? (
              <>
              <div className="min-h-screen transition-colors duration-500 ease-in-out bg-slate-50 dark:bg-[#0f0d1a] text-slate-800 dark:text-slate-100">
                <Navbar dark={dark} onToggleTheme={toggle} />
                <Routes>
                  <Route path="/" element={<Dashboard entries={entries} onLog={logWorkout} />} />
                  <Route path="/history" element={<History entries={entries} />} />
                  <Route path="/settings" element={<Settings onReset={handleReset} />} />
                  <Route path="/compare" element={<Compare />} />
                  {/* Hidden route — only accessible by direct URL for study facilitators */}
                  <Route path="/study-data" element={<StudyData />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
              </>
            ) : (
              <Navigate to="/welcome" replace />
            )
          }
        />
      </Routes>
    </div>
  );
}

// Wraps everything in BrowserRouter for client-side navigation
export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
