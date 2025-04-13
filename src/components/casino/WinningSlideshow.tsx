
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Coins, Zap, ArrowRight } from "lucide-react";

interface Winner {
  id: number;
  username: string;
  game: string;
  amount: number;
  time: string;
}

const WinningSlideshow = () => {
  const [winners, setWinners] = useState<Winner[]>([
    { id: 1, username: "Lucky777", game: "Book of Dead", amount: 1250.75, time: "2 min ago" },
    { id: 2, username: "JackpotHunter", game: "Starburst", amount: 875.50, time: "15 min ago" },
    { id: 3, username: "SpinMaster", game: "Sweet Bonanza", amount: 3100.25, time: "32 min ago" },
    { id: 4, username: "GoldenTouch", game: "Gonzo's Quest", amount: 950.00, time: "1 hour ago" },
    { id: 5, username: "BetBaron", game: "Buffalo King", amount: 2200.50, time: "1 hour ago" },
    { id: 6, username: "RoyalRoller", game: "Reactoonz", amount: 1650.75, time: "2 hours ago" }
  ]);
  
  useEffect(() => {
    // Rotate winners every 5 seconds
    const interval = setInterval(() => {
      setWinners(prevWinners => {
        const rotatedWinners = [...prevWinners];
        const firstWinner = rotatedWinners.shift();
        if (firstWinner) {
          rotatedWinners.push(firstWinner);
        }
        return rotatedWinners;
      });
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-casino-thunder-dark/90 backdrop-blur-md rounded-lg border border-casino-thunder-green/30 overflow-hidden shadow-lg">
      <div className="p-4 border-b border-white/10">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <Trophy className="h-5 w-5 text-casino-thunder-green" />
          Live Winnings Feed
        </h3>
      </div>
      
      <div className="relative max-h-[400px] overflow-hidden p-4">
        <div className="absolute top-0 right-0 p-2 bg-casino-thunder-green/20 text-white/80 text-xs rounded-bl-lg">
          LIVE
        </div>
        
        <div className="space-y-3">
          <AnimatePresence>
            {winners.slice(0, 5).map((winner, index) => (
              <motion.div
                key={winner.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ 
                  duration: 0.5,
                  delay: index * 0.1
                }}
                className="bg-casino-thunder-darker/50 rounded-lg p-3 flex items-center justify-between border-l-4 border-casino-thunder-green"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-casino-thunder-green/20 rounded-full p-2 animate-pulse">
                    {winner.amount > 2000 ? (
                      <Trophy className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <Coins className="h-5 w-5 text-casino-thunder-green" />
                    )}
                  </div>
                  
                  <div>
                    <span className="font-bold text-white">{winner.username}</span>
                    <div className="flex items-center gap-1 text-sm">
                      <ArrowRight className="h-3 w-3 text-casino-thunder-green mr-1" />
                      <span className="text-white/90 font-medium">{winner.game}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end">
                  <div className="flex items-center">
                    <Zap className="h-3.5 w-3.5 text-casino-thunder-green mr-1" />
                    <span className="font-bold text-casino-thunder-green">
                      ${winner.amount.toFixed(2)}
                    </span>
                  </div>
                  <span className="text-white/50 text-xs">{winner.time}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default WinningSlideshow;
