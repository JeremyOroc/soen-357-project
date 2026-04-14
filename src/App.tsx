import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Settings from './pages/Settings';
import Onboarding, { ONBOARDING_KEY } from './pages/Onboarding';
import { useWorkouts } from './hooks/useWorkouts';
import { useTheme } from './hooks/useTheme';

function AppRoutes() {
  const { entries, logWorkout, resetWorkouts } = useWorkouts();
  const { dark, toggle } = useTheme();
  const [hasOnboarded, setHasOnboarded] = useState(() =>
    localStorage.getItem(ONBOARDING_KEY) === 'true'
  );

  function handleReset() {
    resetWorkouts();
    setHasOnboarded(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f0d1a] text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <Routes>
        <Route path="/welcome" element={<Onboarding onComplete={() => setHasOnboarded(true)} />} />
        <Route
          path="/*"
          element={
            hasOnboarded ? (
              <>
                <Navbar dark={dark} onToggleTheme={toggle} />
                <Routes>
                  <Route path="/" element={<Dashboard entries={entries} onLog={logWorkout} />} />
                  <Route path="/history" element={<History entries={entries} />} />
                  <Route path="/settings" element={<Settings onReset={handleReset} />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
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

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
