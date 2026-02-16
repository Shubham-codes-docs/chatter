import Logo from '../../assets/chatter-logo.jpg';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  tagline?: string;
}

const AuthLayout = ({
  children,
  title = 'Chatter',
  tagline = 'Connect with your friends and family',
}: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-light100_dark500 flex">
      <div className="w-2/5 gradient-primary flex-center p-12 text-white relative overflow-hidden">
        {/* Background Glowing Orbs */}
        <div className="absolute top-20 -left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-40 -right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-primary-400/20 rounded-full blur-3xl" />

        {/* Chat Bubbles - More of them */}
        <div className="absolute top-16 left-12 bg-white/15 backdrop-blur-sm rounded-2xl p-3 max-w-[130px] shadow-lg">
          <p className="text-sm text-white">Hey there! 👋</p>
        </div>

        <div className="absolute top-40 right-16 bg-white/15 backdrop-blur-sm rounded-2xl p-3 max-w-[120px] shadow-lg">
          <p className="text-xs text-white">Ready to chat? 💬</p>
        </div>

        <div className="absolute bottom-36 left-16 bg-white/15 backdrop-blur-sm rounded-2xl p-4 max-w-[140px] shadow-lg">
          <p className="text-sm text-white">Let&apos;s connect! ✨</p>
        </div>

        <div className="absolute bottom-20 right-20 bg-white/15 backdrop-blur-sm rounded-2xl p-3 max-w-[100px] shadow-lg rotate-3">
          <p className="text-xs text-white">Join now! 🚀</p>
        </div>

        {/* Avatars */}
        <div className="absolute top-20 left-8 avatar avatar-lg opacity-60">
          JD
        </div>
        <div className="absolute bottom-28 right-12 avatar avatar-md opacity-50">
          SK
        </div>
        <div className="absolute top-1/2 right-10 avatar avatar-sm opacity-40">
          AM
        </div>

        {/* Center Content - Enhanced */}
        <div className="text-center space-y-6 relative z-10 max-w-md">
          {/* Decorative top line */}
          <div className="w-20 h-1 bg-white/30 rounded-full mx-auto mb-8" />

          {/* Logo - Bigger with ring */}
          <img
            src={Logo}
            alt="Chatter Logo"
            className="w-28 h-28 rounded-2xl mx-auto shadow-2xl ring-4 ring-white/20"
          />

          {/* App Name - Bigger */}
          <h1 className="text-6xl font-display font-bold text-white tracking-tight">
            {title}
          </h1>

          {/* Tagline - Better sized */}
          <p className="text-xl text-white/90 font-medium leading-relaxed">
            {tagline}
          </p>

          {/* Feature bullets (optional) */}
          <div className="flex justify-center gap-6 pt-4 text-white/80 text-sm">
            <div className="flex items-center gap-2">
              <span>✓</span>
              <span>Instant</span>
            </div>
            <div className="flex items-center gap-2">
              <span>✓</span>
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <span>✓</span>
              <span>Free</span>
            </div>
          </div>

          {/* Decorative bottom line */}
          <div className="w-20 h-1 bg-white/30 rounded-full mx-auto mt-8" />
        </div>
      </div>
      <div className="w-3/5 flex-center">
        <div className="card w-full max-w-md space-y-4">{children}</div>
      </div>
    </div>
  );
};

export default AuthLayout;
