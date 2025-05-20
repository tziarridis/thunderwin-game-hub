
import React from 'react';

export interface CMSPageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode; // For buttons or other action elements
}

const CMSPageHeader: React.FC<CMSPageHeaderProps> = ({ title, description, actions }) => {
  return (
    <div className="mb-6 pb-4 border-b border-border">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex-shrink-0 mt-4 sm:mt-0">{actions}</div>}
      </div>
    </div>
  );
};

export default CMSPageHeader;
