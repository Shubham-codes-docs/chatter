const EmptyState = () => {
  return (
    <div className="flex-center flex-col h-full gap-6">
      {/* Large Icon */}
      <div className="text-8xl opacity-20">💬</div>

      {/* Text */}
      <div className="text-center">
        <h2 className="h2-bold text-primary mb-2">No chat selected</h2>
        <p className="body-regular text-secondary">
          Select a conversation or start a new chat
        </p>
      </div>

      {/* Button */}
      <button className="btn btn-primary">Start New Chat</button>
    </div>
  );
};

export default EmptyState;
