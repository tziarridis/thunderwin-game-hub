
import { Outlet, useLocation } from "react-router-dom"; // Added useLocation
import React, { useEffect } from "react"; // Added useEffect
import AppHeader from "./AppHeader";
import Footer from "./Footer";

// ScrollToTop component to be used inside Layout
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const Layout = ({ children }: { children?: React.ReactNode }) => { // Made children optional
  return (
    <div className="flex flex-col min-h-screen bg-casino-thunder-darker text-white relative">
      <ScrollToTop /> {/* Added ScrollToTop here */}
      {/* Background pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
      
      {/* Glow effects */}
      <div className="fixed -top-40 -left-40 w-80 h-80 bg-casino-thunder-green/20 rounded-full filter blur-[100px] opacity-30"></div>
      <div className="fixed top-1/2 -right-40 w-80 h-80 bg-purple-500/20 rounded-full filter blur-[100px] opacity-20"></div>
      
      <AppHeader />
      <main className="flex-1 relative z-10 pt-16"> {/* Added pt-16 for fixed header */}
        {children || <Outlet />} {/* Render children if passed, otherwise Outlet */}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
