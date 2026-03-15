import { useEffect } from 'react';
import { Toaster } from './components/ui/sonner';
import { useThemeStore } from './store/themeStore';
import Login from './pages/auth/Login';
import { Routes, Route } from 'react-router-dom';
import Register from './pages/auth/Register';
import ProtectedRoute from './components/ProtectedRoute';
import DashBoard from './pages/dashboard/DashBoard';
import Settings from './pages/settings/Settings';
import { useAuthStore } from './store/authStore';
import { initializeSocket } from './socket/socketClient';

const App = () => {
  const theme = useThemeStore((state) => state.theme);
  const { isAuthenticated, accessToken } = useAuthStore();

  useEffect(() => {
    if (theme) {
      document.documentElement.classList.add(theme);
    }
  }, [theme]);

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      // initialize socket connection
      initializeSocket(accessToken);
    }
  }, [isAuthenticated, accessToken]);

  return (
    <>
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
      <Toaster />
    </>
  );
};

export default App;
