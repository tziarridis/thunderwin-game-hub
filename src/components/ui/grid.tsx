
import React from 'react';
import { cn } from '@/lib/utils';

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  columns?: number;
  gap?: number;
}

export const Grid: React.FC<GridProps> = ({
  children,
  columns = 3,
  gap = 4,
  className,
  ...props
}) => {
  return (
    <div 
      className={cn(
        `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-${columns} gap-${gap}`,
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
};
