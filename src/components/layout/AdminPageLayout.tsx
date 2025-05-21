
import React, { ReactNode } from 'react';

interface AdminPageLayoutProps {
  title: string;
  children: ReactNode;
  // Add any other props you might need, e.g., breadcrumbs, actions
}

const AdminPageLayout: React.FC<AdminPageLayoutProps> = ({ title, children }) => {
  return (
    <div className="space-y-6">
      {/* You can add a more structured header here if needed */}
      {/* <header className="pb-4 border-b">
        <h1 className="text-3xl font-bold">{title}</h1>
      </header> */}
      <div>
        {children}
      </div>
    </div>
  );
};

export default AdminPageLayout;
