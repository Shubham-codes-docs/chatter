import { useEffect } from 'react';
import { Toaster } from './components/ui/sonner';
import { useThemeStore } from './store/themeStore';
import Login from './pages/auth/Login';
import { Routes, Route } from 'react-router-dom';
import Register from './pages/auth/Register';
import ProtectedRoute from './components/ProtectedRoute';
import DashBoard from './pages/dashboard/DashBoard';
import Settings from './pages/settings/Settings';
import { useSocket } from './hooks/useSocket';
import IncomingCall from './components/call/IncomingCall';
import { useCallStore } from './store/callStore';
import CallWindow from './components/call/CallWindow';
import ErrorBoundary from './components/common/ErrorBoundary';

const App = () => {
  const theme = useThemeStore((state) => state.theme);

  useSocket();

  useEffect(() => {
    if (theme) {
      document.documentElement.classList.add(theme);
    }
  }, [theme]);

  const { callStatus } = useCallStore();

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
              <ErrorBoundary>
                <DashBoard />
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <ErrorBoundary>
                <Settings />
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />
      </Routes>
      <Toaster />
      <ErrorBoundary fallback={null}>
        <IncomingCall />
      </ErrorBoundary>
      <ErrorBoundary fallback={null}>
        {callStatus !== 'idle' && callStatus !== 'ringing' && <CallWindow />}
      </ErrorBoundary>
    </>
  );
};

export default App;
