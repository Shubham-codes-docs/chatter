interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState = ({
  icon = '💬',
  title,
  description,
  action,
}: EmptyStateProps) => {
  return (
    <div className="flex-center flex-col h-full gap-6">
      <div className="text-8xl opacity-20">{icon}</div>
      <div className="text-center">
        <h2 className="h2-bold text-primary mb-2">{title}</h2>
        <p className="body-regular text-secondary">{description}</p>
      </div>
      {action && (
        <button className="btn btn-primary" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
