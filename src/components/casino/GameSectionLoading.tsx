
import React from 'react';

const GameSectionLoading = () => {
  return (
    <div className="animate-pulse grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-casino-thunder-gray/30 rounded-lg h-48"></div>
      ))}
    </div>
  );
};

export default GameSectionLoading;
