import AuthLayout from '../../components/auth/AuthLayout';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '../../store/authStore';
import { loginSchema, type LoginInput } from '../../schemas/auth.schema';

const Login = () => {
  // navigate and auth store
  const navigate = useNavigate();
  const { login, isLoading, isAuthenticated } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace={true} />;
  }

  const isDisabled = isLoading || isSubmitting;

  // submit handler (to be implemented)
  const onSubmit = async (data: LoginInput) => {
    await login(data);
    if (useAuthStore.getState().isAuthenticated) {
      navigate('/dashboard');
    }
  };

  return (
    <AuthLayout>
      <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
        <h2 className="h1-bold mb-6">Welcome Back</h2>
        <div>
          <input
            type="email"
            placeholder="Email"
            className="input w-full mb-4"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-error text-sm mt-1">{errors.email.message}</p>
          )}
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            className="input w-full mb-4"
            {...register('password')}
          />
          {errors.password && (
            <p className="text-error text-sm mt-1">{errors.password.message}</p>
          )}
        </div>
        <div className="flex items-center gap-2 mb-4">
          <input
            {...register('rememberMe')}
            type="checkbox"
            id="rememberMe"
            className="w-4 h-4 text-brand-primary bg-surface border-border rounded focus:ring-brand-primary focus:ring-2"
            disabled={isSubmitting}
          />
          <label htmlFor="rememberMe" className="small-regular text-secondary">
            Remember me
          </label>
        </div>
        <button
          className="btn btn-primary w-full mb-4"
          type="submit"
          disabled={isDisabled}
        >
          {isDisabled ? 'Logging In...' : 'Log In'}
        </button>
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
      </form>
    </AuthLayout>
  );
};

export default Login;
