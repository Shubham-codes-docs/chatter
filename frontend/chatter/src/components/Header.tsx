import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import Logo from '../assets/chatter-logo.jpg';

const Header = () => {
  // Access user info and logout function from auth store
  const { user, logOut } = useAuthStore();
  const navigate = useNavigate();

  // handle logout
  const handleLogout = () => {
    logOut(); // Clear auth state
    navigate('/login'); // Redirect to login page
  };

  return (
    <div className="h-18 bg-light50_dark300 border-b border-default flex-between px-6">
      <div className="flex items-center gap-3">
        <img src={Logo} alt="Chatter Logo" className="h-8" />
        <h1 className="h3-bold text-gradient-primary">Chatter</h1>
      </div>
      <div>
        <div className="flex-1 max-w-md mx-8">
          <input type="text" placeholder="Search..." className="input w-full" />
        </div>
      </div>
      <div className="flex-center gap-4">
        <button className="btn btn-ghost p-2">🌙</button>

        {
          // user dropdown
        }
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="avatar avatar-md cursor-pointer">
              {user?.fullName.charAt(0).toUpperCase()}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48" align="end">
            <DropdownMenuItem className="flex flex-col items-start">
              <span className="font-medium">{user?.fullName}</span>
              <span className="text-xs text-muted">@{user?.username}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-error" onClick={handleLogout}>
              LogOut
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default Header;
