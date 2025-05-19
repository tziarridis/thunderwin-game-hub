
import React from 'react';

const AdminSidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-gray-800 text-white p-4">
      <h2 className="text-xl font-bold mb-4">Admin Menu</h2>
      <nav>
        {/* Add sidebar links here */}
        <p>Dashboard</p>
        <p>Users</p>
        <p>Games</p>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
