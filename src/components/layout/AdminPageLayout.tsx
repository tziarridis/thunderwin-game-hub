
import React, { ReactNode } from 'react';

interface AdminPageLayoutProps {
  title: string;
  children: ReactNode;
  breadcrumbs?: { label: string; href?: string }[]; // Optional breadcrumbs
  headerActions?: ReactNode; // Optional actions for the header
}

const AdminPageLayout: React.FC<AdminPageLayoutProps> = ({ title, children, breadcrumbs, headerActions }) => {
  return (
    <div className="space-y-6">
      <header className="pb-4 border-b flex justify-between items-center">
        <div>
          {/* Render breadcrumbs if provided */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="mb-1 text-sm text-muted-foreground">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  {crumb.href ? (
                    <a href={crumb.href} className="hover:underline">{crumb.label}</a>
                  ) : (
                    <span>{crumb.label}</span>
                  )}
                  {index < breadcrumbs.length - 1 && <span className="mx-1">/</span>}
                </React.Fragment>
              ))}
            </nav>
          )}
          <h1 className="text-3xl font-bold">{title}</h1>
        </div>
        {/* Render header actions if provided */}
        {headerActions && <div>{headerActions}</div>}
      </header>
      <div>
        {children}
      </div>
    </div>
  );
};

export default AdminPageLayout;
