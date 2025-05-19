
import React from 'react';

const SiteLogo = ({ className }: { className?: string }) => {
  // You can replace this with your actual SVG or Image component
  return (
    <div className={className}>
      <svg xmlns="http://www.w3.org/2000/svg" width="100" height="40" viewBox="0 0 100 40">
        <rect width="100" height="40" rx="8" fill="#4A90E2"/>
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="16" fill="white">
          LOGO
        </text>
      </svg>
    </div>
  );
};

export default SiteLogo;
