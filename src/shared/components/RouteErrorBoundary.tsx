import { Component, ErrorInfo, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';

/**
 * Route-level error boundary
 *
 * Wraps a single module mount so a runtime crash inside one route shows a
 * friendly inline card instead of replacing the whole app with the
 * root-level "Something Went Wrong" screen. The visitor can still use the
 * sidebar to navigate to other modules without losing their session.
 *
 * Behaviour:
 *   - On error: renders an inline card with the module name + error message
 *     + Reload + Go Back buttons.
 *   - When the URL changes (visitor navigates elsewhere) the boundary
 *     resets automatically via the `routeKey` prop wrapper, so a previously
 *     errored module can recover the next time it's visited.
 *
 * Used in `RoofRunnerModule.tsx` to wrap each module-level splat route so
 * the demo stays navigable even if a specific module's data path crashes.
 */

interface Props {
  children: ReactNode;
  moduleName: string;
  /** Internal — passed by the wrapper component below to reset on route change. */
  routeKey: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class RouteErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Tag the log with the module name so it's findable in console.
    console.error(`[RouteErrorBoundary:${this.props.moduleName}]`, error, errorInfo);
  }

  componentDidUpdate(prevProps: Props) {
    // Reset error state whenever the visitor navigates to a different
    // route. Without this, the visitor stays stuck on the error screen
    // even after they click a different sidebar item.
    if (prevProps.routeKey !== this.props.routeKey && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex items-center justify-center p-8 min-h-[60vh]">
        <div className="max-w-lg w-full bg-surface-1 dark:bg-surface-d-1 rounded-2xl border border-edge-base dark:border-edge-d-base shadow-s2 p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="shrink-0 w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-amber-700 dark:text-amber-400" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-ink-1 dark:text-ink-d-1 mb-1">
                {this.props.moduleName} isn’t available right now
              </h2>
              <p className="text-sm text-ink-3 dark:text-ink-d-3">
                This part of the demo hit an unexpected error. The rest of the demo is still working — pick a different module from the sidebar, or try this one again.
              </p>
            </div>
          </div>

          {this.state.error && (
            <div className="mb-6 rounded-lg bg-surface-2 dark:bg-surface-d-2 border border-edge-soft dark:border-edge-d-soft p-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-ink-3 dark:text-ink-d-3 mb-1">
                Error detail
              </div>
              <code className="text-xs font-mono text-ink-2 dark:text-ink-d-2 break-all">
                {this.state.error.toString()}
              </code>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-signal-500 hover:bg-signal-600 text-white text-sm font-semibold transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            <button
              type="button"
              onClick={this.handleBack}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-2 dark:bg-surface-d-2 hover:bg-surface-3 dark:hover:bg-surface-d-3 text-ink-1 dark:text-ink-d-1 text-sm font-semibold border border-edge-base dark:border-edge-d-base transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }
}

/**
 * Public wrapper — passes the current pathname as `routeKey` so the class
 * boundary can reset on navigation. Functional component is the place
 * where we have access to `useLocation()`.
 */
export const RouteErrorBoundary: React.FC<{ children: ReactNode; moduleName: string }> = ({ children, moduleName }) => {
  const location = useLocation();
  return (
    <RouteErrorBoundaryClass moduleName={moduleName} routeKey={location.pathname}>
      {children}
    </RouteErrorBoundaryClass>
  );
};

export default RouteErrorBoundary;
