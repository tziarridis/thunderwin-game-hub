
import React from "react";
import GameManagementComponent from "@/components/admin/backoffice/GameManagement";
import AdminLayout from "@/components/layout/AdminLayout";

const GameManagementPage = () => {
  const [collapsed, setCollapsed] = React.useState(false);
  
  return (
    <AdminLayout collapsed={collapsed} setCollapsed={setCollapsed}>
      <GameManagementComponent />
    </AdminLayout>
  );
};

export default GameManagementPage;
