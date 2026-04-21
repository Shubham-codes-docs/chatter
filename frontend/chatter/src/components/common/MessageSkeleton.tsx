const MessageSkeleton = ({ isSent = false }: { isSent?: boolean }) => {
  return (
    <div
      className={`flex items-end gap-3 mb-4 ${isSent ? 'justify-end' : 'justify-start'}`}
    >
      {!isSent && <div className="skeleton w-8 h-8 rounded-full shrink-0" />}
      <div
        className={`flex flex-col gap-1 ${isSent ? 'items-end' : 'items-start'}`}
      >
        <div className="skeleton h-10 w-48 rounded-2xl" />
        <div className="skeleton-text w-16" />
      </div>
      {isSent && <div className="w-8 shrink-0" />}
    </div>
  );
};

export default MessageSkeleton;
