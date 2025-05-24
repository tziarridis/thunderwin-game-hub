
import React from 'react';

interface CMSPageHeaderProps {
  title: string;
  description: string;
}

const CMSPageHeader = ({ title, description }: CMSPageHeaderProps) => {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
      <p className="text-gray-400">{description}</p>
    </div>
  );
};

export default CMSPageHeader;
