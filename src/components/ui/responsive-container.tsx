
import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({ children, className, ...props }) => {
  return (
    <div className={cn("container mx-auto px-4 sm:px-6 lg:px-8", className)} {...props}>
      {children}
    </div>
  );
};

// No default export, only named export.
// export default ResponsiveContainer; 
