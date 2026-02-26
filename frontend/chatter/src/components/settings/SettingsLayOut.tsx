const SettingsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-light100_dark500 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="h1-bold mb-6">Settings</h1>
        <div className="card flex overflow-hidden">{children}</div>
      </div>
    </div>
  );
};

export default SettingsLayout;
