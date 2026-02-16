import AuthLayout from '../../components/auth/AuthLayout';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../../schemas/auth.schema';
import type { LoginInput } from '../../types/auth.types';

const Login = () => {
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

  // submit handler (to be implemented)
  const onSubmit = async (data: LoginInput) => {
    try {
      console.log('Login Data:', data);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Login Error:', error);
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
            type="checkbox"
            name="remember-me"
            id="remember-me"
            className="w-4 h-4"
          />
          <label htmlFor="remember-me" className="small-regular text-secondary">
            Remember me
          </label>
        </div>
        <button
          className="btn btn-primary w-full mb-4"
          type="submit"
          disabled={isSubmitting}
        >
          Login
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
