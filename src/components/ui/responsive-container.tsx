
import { cn } from "@/lib/utils";

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  fullHeight?: boolean;
}

export function ResponsiveContainer({
  children,
  className,
  fullHeight = false,
}: ResponsiveContainerProps) {
  return (
    <div
      className={cn(
        "w-full px-4 sm:px-6 md:px-8 mx-auto max-w-7xl",
        fullHeight && "min-h-[calc(100vh-80px)]",
        className
      )}
    >
      {children}
    </div>
  );
}
