import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error Boundary caught', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
          <div className="text-4xl">⚠️</div>
          <h2 className="h3-bold text-primary">Something went wrong</h2>
          <p className="body-regular text-secondary text-center">
            {this.state.error?.message ?? 'An unexpected error occurred'}
          </p>
          <div className="flex gap-3">
            <button
              className="btn btn-secondary"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Try Again
            </button>
            <button
              className="btn btn-primary"
              onClick={() => (window.location.href = '/dashboard')}
            >
              Go to Dashboard
            </button>
            <button
              className="btn btn-ghost text-error"
              onClick={() => {
                localStorage.clear();
                window.location.href = '/login';
              }}
            >
              Sign out and reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
