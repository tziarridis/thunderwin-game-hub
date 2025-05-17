
import React from "react";
import GameManagementComponent from "@/components/admin/backoffice/GameManagement";
import AdminLayout from "@/components/layout/AdminLayout"; // This component is read-only

const GameManagementPage = () => {
  const [collapsed, setCollapsed] = React.useState(false);
  
  // If AdminLayout is correctly typed to accept children, this is the standard usage.
  // The error "Property 'children' does not exist on type 'IntrinsicAttributes'"
  // implies AdminLayout's props type doesn't include 'children'.
  // This cannot be fixed here if AdminLayout.tsx is read-only and incorrectly typed.
  return (
    <AdminLayout collapsed={collapsed} setCollapsed={setCollapsed}>
      <GameManagementComponent />
    </AdminLayout>
  );
};

export default GameManagementPage;

