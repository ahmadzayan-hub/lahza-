import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        this.props.fallback ?? (
          <div className="container-max flex min-h-[50vh] flex-col items-center justify-center gap-4 py-20 text-center">
            <span className="font-serif text-5xl font-bold text-cream-200">:(</span>
            <p className="text-coffee-600">Something went wrong. Please refresh the page.</p>
            <button
              type="button"
              onClick={() => this.setState({ error: null })}
              className="btn btn-primary"
            >
              Try again
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
