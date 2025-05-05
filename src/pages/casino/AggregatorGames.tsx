
import React from 'react';
import AggregatorGameSection from '@/components/casino/AggregatorGameSection';
import { scrollToTop } from '@/utils/scrollUtils';
import { useEffect } from 'react';

const AggregatorGames = () => {
  useEffect(() => {
    scrollToTop();
  }, []);

  return (
    <div className="relative bg-casino-thunder-darker min-h-screen overflow-hidden">
      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Aggregator Games</h1>
          <p className="text-white/70 max-w-2xl mx-auto">
            Explore our collection of games from our partner providers.
          </p>
        </div>
        
        {/* Pass showAllGames prop as true to display all games */}
        <AggregatorGameSection showAllGames={true} />
      </div>
    </div>
  );
};

export default AggregatorGames;
