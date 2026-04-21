const ConversationSkeleton = () => {
  return (
    <div className="flex items-center gap-3 p-3">
      <div className="skeleton rounded-full w-10 h-10 shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <div className="skeleton-text w-32" />
        <div className="skeleton-text w-48" />
      </div>
      <div className="skeleton-text w-8" />
    </div>
  );
};

export default ConversationSkeleton;
