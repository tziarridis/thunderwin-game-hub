
import React from "react";
import GameManagementComponent from "@/components/admin/backoffice/GameManagement";
// AdminLayout is typically part of the route structure, wrapping GameManagementComponent via <Outlet />
// No need to wrap it here if routing is set up correctly in App.tsx

const GameManagementPage = () => {
  // If AdminLayout is a wrapper component for styling/context and not part of routing structure itself,
  // then it might be used here. But typically, it's a layout route.
  // For now, assuming GameManagementComponent is rendered within an <Outlet /> of AdminLayout.
  return (
    <GameManagementComponent />
  );
};

export default GameManagementPage;

