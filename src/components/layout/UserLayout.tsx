
import React, { ReactNode } from 'react';

interface UserLayoutProps {
  children: ReactNode;
  title?: string;
}

const UserLayout: React.FC<UserLayoutProps> = ({ children, title }) => {
  return (
    <div className="container mx-auto p-6">
      {title && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
      )}
      {children}
    </div>
  );
};

export default UserLayout;
