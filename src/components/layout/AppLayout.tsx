
import React, { ReactNode, Suspense, useState, useEffect } from 'react';
import AppHeader from './AppHeader';
import Footer from './Footer';
import ErrorBoundary from '../ErrorBoundary';
import { Loader2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface AppLayoutProps {
  children: ReactNode;
}

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  const [resetKey, setResetKey] = useState(0);

  // Reset error boundary when route changes
  useEffect(() => {
    setResetKey(prev => prev + 1);
  }, [location.pathname]);

  // Log when AppLayout mounts and unmounts
  useEffect(() => {
    console.log('AppLayout mounted');
    return () => console.log('AppLayout unmounted');
  }, []);

  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error('AppLayout caught error:', error, errorInfo);
  };

  return (
    <ErrorBoundary onError={handleError} resetKey={resetKey}>
      <div className="min-h-screen bg-background flex flex-col">
        <AppHeader />
        <main className="flex-1 pt-16">
          <ErrorBoundary 
            onError={(error, info) => console.error('Content error:', error, info)}
            resetKey={location.pathname}
          >
            <Suspense fallback={<LoadingFallback />}>
              {children}
            </Suspense>
          </ErrorBoundary>
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
};

export default AppLayout;
