
import React from "react";

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  return (
    <div className="theme-thunder">
      {/* Global theme styles that affect the entire app */}
      <style jsx global>{`
        .theme-thunder {
          --spacing-xs: 0.25rem;
          --spacing-sm: 0.5rem;
          --spacing-md: 1rem;
          --spacing-lg: 1.5rem;
          --spacing-xl: 2rem;
          --spacing-2xl: 3rem;

          --radius-sm: 0.25rem;
          --radius-md: 0.375rem;
          --radius-lg: 0.5rem;
          --radius-xl: 0.75rem;
          --radius-full: 9999px;
        }
      `}</style>
      {children}
    </div>
  );
};

export default ThemeProvider;
