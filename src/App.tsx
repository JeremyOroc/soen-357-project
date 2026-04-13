import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import { useWorkouts } from './hooks/useWorkouts';
import { useTheme } from './hooks/useTheme';

export default function App() {
  const { entries, logWorkout } = useWorkouts();
  const { dark, toggle } = useTheme();

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 dark:bg-[#0f0d1a] text-slate-800 dark:text-slate-100 transition-colors duration-300">
        <Navbar dark={dark} onToggleTheme={toggle} />
        <Routes>
          <Route path="/" element={<Dashboard entries={entries} onLog={logWorkout} />} />
          <Route path="/history" element={<History entries={entries} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
