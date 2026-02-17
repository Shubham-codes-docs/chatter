import Login from './pages/auth/Login';
import { Routes, Route } from 'react-router-dom';
import Register from './pages/auth/Register';
import ProtectedRoute from './components/ProtectedRoute';
import DashBoard from './pages/dashboard/DashBoard';

const App = () => {
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
    </Routes>
  );
};

export default App;
