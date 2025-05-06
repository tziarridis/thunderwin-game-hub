
import React from 'react';
import { Loader2 } from 'lucide-react';

const GameSectionLoading = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="h-12 w-12 animate-spin text-casino-thunder-green mb-4" />
      <p className="text-white/70">Loading games...</p>
    </div>
  );
};

export default GameSectionLoading;
