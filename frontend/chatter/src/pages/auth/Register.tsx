import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';
import { registerSchema, type RegisterInput } from '../../schemas/auth.schema';
import { handleApiError } from '../../utils/errorHandler';

const Register = () => {
  // use navigate and auth store
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  // submit handler (to be implemented)
  const onSubmit = async (data: RegisterInput) => {
    try {
      const response = await authService.register(data);
      setAuth(response.user, response.accessToken, response.refreshToken);
      navigate('/dashboard');
      toast.success('Registration successful! Welcome to Chatter!');
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
    }
  };

  return (
    <AuthLayout
      title="Chatter"
      tagline="Join the conversation and connect with friends"
    >
      <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
        <h2 className="h1-bold mb-6">Create an Account</h2>
        <input
          type="text"
          placeholder="Full Name"
          className="input w-full mb-4"
          {...register('fullName')}
        />
        {errors.fullName && (
          <p className="text-error text-sm mt-1">{errors.fullName.message}</p>
        )}
        <input
          type="email"
          placeholder="Email"
          className="input w-full mb-4"
          {...register('email')}
        />
        {errors.email && (
          <p className="text-error text-sm mt-1">{errors.email.message}</p>
        )}
        <input
          type="text"
          placeholder="Username"
          className="input w-full mb-4"
          {...register('username')}
        />
        {errors.username && (
          <p className="text-error text-sm mt-1">{errors.username.message}</p>
        )}
        <input
          type="password"
          placeholder="Password"
          className="input w-full mb-4"
          {...register('password')}
        />
        {errors.password && (
          <p className="text-error text-sm mt-1">{errors.password.message}</p>
        )}
        <input
          type="password"
          placeholder="Confirm Password"
          className="input w-full mb-4"
          {...register('confirmPassword')}
        />
        {errors.confirmPassword && (
          <p className="text-error text-sm mt-1">
            {errors.confirmPassword.message}
          </p>
        )}
        <div className="flex items-center gap-2 mb-4">
          <input
            {...register('rememberMe')}
            type="checkbox"
            id="rememberMe"
            className="w-4 h-4 text-brand-primary bg-surface border-border rounded focus:ring-brand-primary focus:ring-2"
          />
          <label htmlFor="rememberMe" className="small-regular text-secondary">
            I agree to the{' '}
            <a href="#" className="text-brand-primary font-medium">
              Terms and Conditions
            </a>
          </label>
        </div>
        <button
          className="btn btn-primary w-full mb-4"
          type="submit"
          disabled={isSubmitting}
        >
          Register
        </button>
        <div className="divider-text mb-4">or</div>
        <button className="btn btn-secondary w-full mb-6">
          🔍 Sign in with Google
        </button>
        <p className="text-center small-regular text-secondary">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-primary font-medium">
            Sign In
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Register;
