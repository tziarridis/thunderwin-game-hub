
import { Outlet, useLocation } from "react-router-dom"; 
import React, { useEffect } from "react";
import AppLayout from "./AppLayout";

// ScrollToTop component to be used inside Layout
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const Layout = ({ children }: { children?: React.ReactNode }) => {
  return (
    <>
      <ScrollToTop />
      {children || <Outlet />}
    </>
  );
};

export default Layout;
