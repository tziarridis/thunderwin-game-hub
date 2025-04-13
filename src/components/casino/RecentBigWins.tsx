
import React, { useEffect, useRef, useState } from "react";
import { Trophy, CircleDollarSign } from "lucide-react";
import { useRecentWins } from "@/hooks/useRecentWins";
import { formatAmount } from "@/services/recentWinsService";

const RecentBigWins: React.FC = () => {
  const { filteredWins, loading, error } = useRecentWins();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // This effect sets up the continuous scrolling animation
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer || loading || error || filteredWins.length === 0) return;
    
    // Clone the wins to create a seamless loop
    const scrollContent = scrollContainer.querySelector(".scroll-content");
    if (scrollContent) {
      const scrollWidth = scrollContent.scrollWidth;
      const scroll = () => {
        if (scrollContainer.scrollLeft >= scrollWidth) {
          scrollContainer.scrollLeft = 0;
        } else {
          scrollContainer.scrollLeft += 1;
        }
      };
      
      const scrollInterval = setInterval(scroll, 30);
      return () => clearInterval(scrollInterval);
    }
  }, [filteredWins, loading, error]);

  // Duplicate the wins array to create a continuous loop effect
  const displayWins = [...filteredWins, ...filteredWins, ...filteredWins];

  if (loading) {
    return <div className="w-full bg-casino-thunder-dark/90 p-4 rounded-lg text-center">Loading recent wins...</div>;
  }

  if (error) {
    return <div className="w-full bg-casino-thunder-dark/90 p-4 rounded-lg text-center">Error loading recent wins</div>;
  }

  return (
    <div className="w-full bg-casino-thunder-dark/90 backdrop-blur-md rounded-lg border border-casino-thunder-green/30 overflow-hidden shadow-lg">
      <div className="p-4 border-b border-white/10 flex justify-between items-center">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <Trophy className="h-5 w-5 text-casino-thunder-green" />
          Recent Big Wins
        </h3>
        <div className="flex items-center gap-2">
          <CircleDollarSign className="h-4 w-4 text-casino-thunder-green animate-pulse" />
          <span className="text-sm text-white/80">LIVE</span>
        </div>
      </div>
      
      <div className="p-4">
        <div className="relative overflow-hidden rounded-lg border border-white/10 bg-[#1A1F2C]">
          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto py-4 px-2 hide-scrollbar"
            style={{ scrollBehavior: "smooth", whiteSpace: "nowrap" }}
          >
            <div className="scroll-content flex space-x-4">
              {displayWins.map((win, idx) => (
                <div key={`${win.id}-${idx}`} className="flex-none w-[180px]">
                  <div className="flex flex-col items-center p-2 rounded-lg">
                    <div className="relative mb-2">
                      <div className="w-16 h-16 rounded-full bg-casino-thunder-gray/50 overflow-hidden border-2 border-white/20 shadow-md">
                        <img 
                          src={win.game_image_url} 
                          alt={win.game_name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute -top-1 -right-1 bg-casino-thunder-green text-black text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
                        <Trophy className="h-3 w-3" />
                      </div>
                    </div>
                    
                    <div className="text-center w-full">
                      <div className="text-xs text-white/70 mb-1 truncate max-w-full">
                        {win.game_name}
                      </div>
                      <div className="text-xs text-white/50 mb-1">
                        {win.user_display_name}
                      </div>
                      <div className="text-sm font-bold text-casino-thunder-green">
                        {formatAmount(win.win_amount)} {win.currency}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Gradient fade effect on the edges */}
          <div className="absolute top-0 left-0 w-12 h-full bg-gradient-to-r from-[#1A1F2C] to-transparent pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-12 h-full bg-gradient-to-l from-[#1A1F2C] to-transparent pointer-events-none"></div>
        </div>
      </div>
      
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default RecentBigWins;
