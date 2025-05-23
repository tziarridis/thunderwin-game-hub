
import React from 'react';

export interface UserLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const UserLayout: React.FC<UserLayoutProps> = ({ children, title }) => {
  return (
    <div className="container mx-auto p-6">
      {title && <h1 className="text-3xl font-bold mb-6">{title}</h1>}
      {children}
    </div>
  );
};

export default UserLayout;
