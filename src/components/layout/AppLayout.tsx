
import React from "react";
import { Outlet } from "react-router-dom";
import AppHeader from "./AppHeader";
import Footer from "./Footer";

const AppLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-casino-thunder-darker text-white">
      <AppHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default AppLayout;
