
import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetKey?: any; // Key that will trigger reset when changed
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Send the error to a reporting service
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Update state with error details
    this.setState({ errorInfo });
    
    // Show a toast notification
    toast.error('An error occurred in the application');
  }

  // Allow parent components to reset the error boundary
  componentDidUpdate(prevProps: Props) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    }
  }

  render() {
    if (this.state.hasError) {
      // Return custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Return default error UI
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
          <AlertTriangle className="h-10 w-10 text-destructive mb-4" />
          <h2 className="text-2xl font-bold mb-4 text-destructive">Something went wrong</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
          </p>
          {this.state.error && (
            <div className="bg-card p-4 rounded-md mb-6 text-left max-w-lg overflow-auto">
              <p className="font-mono text-sm mb-2 text-destructive">Error: {this.state.error.toString()}</p>
              {this.state.errorInfo && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-muted-foreground">Stack trace</summary>
                  <pre className="mt-2 p-2 bg-muted text-xs overflow-auto max-h-[200px] rounded">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
          )}
          <Button 
            onClick={() => window.location.reload()} 
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
