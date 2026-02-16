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
        {/* Top Left - Avatar */}
        <div className="absolute top-16 left-8 avatar avatar-lg opacity-70">
          JD
        </div>

        {/* Top Right - Chat Bubble */}
        <div className="absolute top-32 right-10 bg-white/10 backdrop-blur-sm rounded-2xl p-3 max-w-[110px] opacity-80">
          <p className="text-sm text-white">Hey there! 👋</p>
        </div>

        {/* Bottom Left - Chat Bubble */}
        <div className="absolute bottom-36 left-12 bg-white/10 backdrop-blur-sm rounded-2xl p-4 max-w-[130px] opacity-80">
          <p className="text-sm text-white">Let&apos;s connect! 💬</p>
        </div>

        {/* Bottom Right - Avatar */}
        <div className="absolute bottom-20 right-14 avatar avatar-md opacity-75">
          SK
        </div>

        {/* Middle Right - Small Avatar */}
        <div className="absolute top-1/2 right-8 avatar avatar-sm opacity-60">
          AM
        </div>

        {/* Center Content - Higher z-index */}
        <div className="text-center space-y-4 relative z-10">
          <img
            src={Logo}
            alt="Chatter Logo"
            className="w-24 h-24 rounded-2xl mb-6 mx-auto"
          />
          <h1 className="display-1 !text-white">{title}</h1>
          <p className="body-lg-regular !text-white/90">{tagline}</p>
        </div>
      </div>
      <div className="w-3/5 flex-center">
        <div className="card w-full max-w-md space-y-4">{children}</div>
      </div>
    </div>
  );
};

export default AuthLayout;
