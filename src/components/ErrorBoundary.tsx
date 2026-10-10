import { Component, type ErrorInfo, type ReactNode } from "react";
import { ErrorState } from "./ui";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * App-level safety net. A render error - or, more commonly in production, a
 * failed lazy-chunk import when a visitor keeps a tab open across a redeploy and
 * the old hashed chunk URL 404s - would otherwise blank the entire page with no
 * way out. We catch it, log the real error for diagnostics, and show a calm
 * recovery screen whose single action, a full reload, re-fetches the current
 * HTML and asset manifest.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Keep the technical detail in the console only - never on screen.
    console.error("App ErrorBoundary caught:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-paper px-6">
          <ErrorState
            title="Something went wrong"
            description="The app hit an unexpected snag. Reloading usually fixes it - nothing you've saved is lost."
            onRetry={() => window.location.reload()}
          />
        </div>
      );
    }
    return this.props.children;
  }
}
