
import React from "react";
import AppHeader from "./AppHeader";
import Footer from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-casino-thunder-darker text-white relative">
      {/* Background pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
      
      {/* Glow effects */}
      <div className="fixed -top-40 -left-40 w-80 h-80 bg-casino-thunder-green/20 rounded-full filter blur-[100px] opacity-30"></div>
      <div className="fixed top-1/2 -right-40 w-80 h-80 bg-purple-500/20 rounded-full filter blur-[100px] opacity-20"></div>
      
      <AppHeader />
      <main className="flex-1 relative z-10 pt-16">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
