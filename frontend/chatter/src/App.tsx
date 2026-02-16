import Login from './pages/auth/Login';
import { Routes, Route } from 'react-router-dom';
import Register from './pages/auth/Register';

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
};

export default App;
