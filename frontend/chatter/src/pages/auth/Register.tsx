import AuthLayout from '../../components/auth/AuthLayout';

const Register = () => {
  return (
    <AuthLayout
      title="Chatter"
      tagline="Join the conversation and connect with friends"
    >
      <div className="flex flex-col">
        <h2 className="h1-bold mb-6">Create an Account</h2>
        <input
          type="text"
          placeholder="Full Name"
          className="input w-full mb-4"
          name="fullName"
        />
        <input
          type="email"
          placeholder="Email"
          className="input w-full mb-4"
          name="email"
        />
        <input
          type="text"
          placeholder="Username"
          className="input w-full mb-4"
          name="username"
        />
        <input
          type="password"
          placeholder="Password"
          className="input w-full mb-4"
          name="password"
        />
        <input
          type="password"
          placeholder="Confirm Password"
          className="input w-full mb-4"
          name="confirmPassword"
        />
        <div className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            name="remember-me"
            id="remember-me"
            className="w-4 h-4"
          />
          <label htmlFor="remember-me" className="small-regular text-secondary">
            I agree to the{' '}
            <a href="#" className="text-brand-primary font-medium">
              Terms and Conditions
            </a>
          </label>
        </div>
        <button className="btn btn-primary w-full mb-4">Register</button>
        <div className="divider-text mb-4">or</div>
        <button className="btn btn-secondary w-full mb-6">
          🔍 Sign in with Google
        </button>
        <p className="text-center small-regular text-secondary">
          Already have an account?{' '}
          <a href="#" className="text-brand-primary font-medium">
            Sign In
          </a>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Register;
