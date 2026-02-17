import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

const DashBoard = () => {
  const navigate = useNavigate();
  const { user, logOut } = useAuthStore();

  const handleLogout = () => {
    logOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-light100_dark500 flex-center">
      <div className="card max-w-md text-center">
        <h1 className="h1-bold mb-4">Welcome to Chat! 🎉</h1>
        <p className="body-regular text-secondary mb-2">
          Hello, {user?.fullName}!
        </p>
        <p className="small-regular text-muted mb-6">
          Username: @{user?.username}
        </p>
        <p className="body-regular text-secondary mb-6">
          Chat interface coming soon...
        </p>
        <button onClick={handleLogout} className="btn btn-secondary">
          Logout
        </button>
      </div>
    </div>
  );
};

export default DashBoard;
