
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Gamepad2, 
  Dices, 
  Table2, 
  Video,
  Trophy,
  CircleDollarSign
} from "lucide-react";

// Mock data structure based on your suggested schema
interface RecentWin {
  id: number;
  user_display_name: string;
  game_name: string;
  game_image_url: string;
  win_amount: number;
  currency: string;
  created_at: string;
}

const mockRecentWins: RecentWin[] = [
  {
    id: 1,
    user_display_name: "Mupfpj...",
    game_name: "Sweet Bonanza",
    game_image_url: "/lovable-uploads/2dc5015b-5024-411b-8ee9-4b422be630fa.png",
    win_amount: 227.93,
    currency: "USDT",
    created_at: "2023-04-10T10:23:45Z"
  },
  {
    id: 2,
    user_display_name: "Hidden***",
    game_name: "Aviator",
    game_image_url: "/lovable-uploads/2dc5015b-5024-411b-8ee9-4b422be630fa.png",
    win_amount: 156.42,
    currency: "BCD",
    created_at: "2023-04-10T10:20:15Z"
  },
  {
    id: 3,
    user_display_name: "Jackp...",
    game_name: "Gates of Olympus",
    game_image_url: "/lovable-uploads/2dc5015b-5024-411b-8ee9-4b422be630fa.png",
    win_amount: 893.51,
    currency: "USDT",
    created_at: "2023-04-10T10:15:33Z"
  },
  {
    id: 4,
    user_display_name: "Kron***",
    game_name: "Fruit Party",
    game_image_url: "/lovable-uploads/2dc5015b-5024-411b-8ee9-4b422be630fa.png",
    win_amount: 543.21,
    currency: "USDT",
    created_at: "2023-04-10T10:10:45Z"
  },
  {
    id: 5,
    user_display_name: "TheLu...",
    game_name: "Book of Dead",
    game_image_url: "/lovable-uploads/2dc5015b-5024-411b-8ee9-4b422be630fa.png",
    win_amount: 1250.75,
    currency: "BCD",
    created_at: "2023-04-10T10:05:22Z"
  },
  {
    id: 6,
    user_display_name: "Casino***",
    game_name: "Wolf Gold",
    game_image_url: "/lovable-uploads/2dc5015b-5024-411b-8ee9-4b422be630fa.png",
    win_amount: 647.32,
    currency: "USDT",
    created_at: "2023-04-10T10:00:11Z"
  },
  {
    id: 7,
    user_display_name: "BetMa...",
    game_name: "Buffalo King",
    game_image_url: "/lovable-uploads/2dc5015b-5024-411b-8ee9-4b422be630fa.png",
    win_amount: 3421.90,
    currency: "USDT",
    created_at: "2023-04-10T09:55:33Z"
  },
  {
    id: 8,
    user_display_name: "Lucky***",
    game_name: "Reactoonz",
    game_image_url: "/lovable-uploads/2dc5015b-5024-411b-8ee9-4b422be630fa.png",
    win_amount: 1987.65,
    currency: "BCD",
    created_at: "2023-04-10T09:50:21Z"
  },
  {
    id: 9,
    user_display_name: "Thund...",
    game_name: "Gonzo's Quest",
    game_image_url: "/lovable-uploads/2dc5015b-5024-411b-8ee9-4b422be630fa.png",
    win_amount: 754.18,
    currency: "USDT",
    created_at: "2023-04-10T09:45:12Z"
  },
  {
    id: 10,
    user_display_name: "Rich***",
    game_name: "Starburst",
    game_image_url: "/lovable-uploads/2dc5015b-5024-411b-8ee9-4b422be630fa.png",
    win_amount: 503.25,
    currency: "USDT",
    created_at: "2023-04-10T09:40:05Z"
  },
];

// Helper function to format currency amounts
const formatAmount = (amount: number): string => {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(2)}M`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(2)}K`;
  } else {
    return amount.toFixed(2);
  }
};

const RecentBigWins: React.FC = () => {
  const [wins, setWins] = useState<RecentWin[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // In a real implementation, this would fetch from your API
    setWins(mockRecentWins);
    
    // This effect sets up the continuous scrolling animation
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;
    
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
  }, []);

  // Filter wins based on selected tab
  const getFilteredWins = () => {
    switch (activeTab) {
      case "slots":
        return wins.filter(win => win.game_name.includes("Bonanza") || win.game_name.includes("Party") || win.game_name.includes("Book"));
      case "live":
        return wins.filter(win => win.game_name.includes("Table") || win.game_name.includes("Roulette") || win.game_name.includes("Blackjack"));
      case "originals":
        return wins.filter(win => win.game_name.includes("Aviator") || win.game_name.includes("Crash"));
      default:
        return wins;
    }
  };

  const filteredWins = getFilteredWins();
  
  // Duplicate the wins array to create a continuous loop effect
  const displayWins = [...filteredWins, ...filteredWins, ...filteredWins];

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
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full mb-4">
          <TabsList className="w-full flex overflow-x-auto py-2 justify-start">
            <TabsTrigger value="all" className="flex items-center gap-1">
              <Trophy className="h-4 w-4" />
              <span>All</span>
            </TabsTrigger>
            <TabsTrigger value="originals" className="flex items-center gap-1">
              <Gamepad2 className="h-4 w-4" />
              <span>BC Originals</span>
            </TabsTrigger>
            <TabsTrigger value="slots" className="flex items-center gap-1">
              <Dices className="h-4 w-4" />
              <span>Slots</span>
            </TabsTrigger>
            <TabsTrigger value="live" className="flex items-center gap-1">
              <Video className="h-4 w-4" />
              <span>Live Casino</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="relative max-h-[250px] overflow-hidden rounded-lg border border-white/10 bg-[#1A1F2C]">
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
      
      <style jsx>{`
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
