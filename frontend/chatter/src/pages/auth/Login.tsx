import AuthLayout from '../../components/auth/AuthLayout';
import { Link } from 'react-router-dom';

const Login = () => {
  return (
    <AuthLayout>
      <div className="flex flex-col">
        <h2 className="h1-bold mb-6">Welcome Back</h2>
        <input
          type="text"
          placeholder="Username"
          className="input w-full mb-4"
        />
        <input
          type="password"
          placeholder="Password"
          className="input w-full mb-4"
        />
        <div className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            name="remember-me"
            id="remember-me"
            className="w-4 h-4"
          />
          <label htmlFor="remember-me" className="small-regular text-secondary">
            Remember me
          </label>
        </div>
        <button className="btn btn-primary w-full mb-4">Login</button>
        <div className="divider-text mb-4">or</div>
        <button className="btn btn-secondary w-full mb-6">
          🔍 Sign in with Google
        </button>
        <p className="text-center small-regular text-secondary">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-brand-primary font-medium">
            Sign Up
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Login;
