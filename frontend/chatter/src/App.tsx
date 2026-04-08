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

const App = () => {
  const theme = useThemeStore((state) => state.theme);

  useSocket();

  useEffect(() => {
    if (theme) {
      document.documentElement.classList.add(theme);
    }
  }, [theme]);

  const { callStatus, activeCall } = useCallStore();

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
      <IncomingCall />
      {callStatus !== 'idle' && callStatus !== 'ringing' && <CallWindow />}
      <div className="fixed top-0 left-0 z-[9999] bg-black/80 text-white text-xs p-2 max-w-xs">
        <p>callStatus: {callStatus}</p>
        <p>activeCall: {activeCall ? 'yes' : 'no'}</p>
      </div>
    </>
  );
};

export default App;
