import { useEffect } from 'react';
import { useThemeStore } from './store/themeStore';
import Login from './pages/auth/Login';
import { Routes, Route } from 'react-router-dom';
import Register from './pages/auth/Register';
import ProtectedRoute from './components/ProtectedRoute';
import DashBoard from './pages/dashboard/DashBoard';
import Settings from './pages/settings/Settings';

const App = () => {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    if (theme) {
      document.documentElement.classList.add(theme);
    }
  }, [theme]);

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashBoard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;
