
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Coins, Zap } from "lucide-react";

interface Winner {
  id: number;
  username: string;
  game: string;
  amount: number;
  time: string;
}

const WinningRoller = () => {
  const [winners, setWinners] = useState<Winner[]>([
    { id: 1, username: "Lucky777", game: "Book of Dead", amount: 1250.75, time: "2 min ago" },
    { id: 2, username: "JackpotHunter", game: "Starburst", amount: 875.50, time: "15 min ago" },
    { id: 3, username: "SpinMaster", game: "Sweet Bonanza", amount: 3100.25, time: "32 min ago" },
    { id: 4, username: "GoldenTouch", game: "Gonzo's Quest", amount: 950.00, time: "1 hour ago" },
    { id: 5, username: "BetBaron", game: "Buffalo King", amount: 2200.50, time: "1 hour ago" },
    { id: 6, username: "RoyalRoller", game: "Reactoonz", amount: 1650.75, time: "2 hours ago" }
  ]);

  const [visibleWinners, setVisibleWinners] = useState<Winner[]>([]);
  
  useEffect(() => {
    // Display first 3 winners initially
    setVisibleWinners(winners.slice(0, 3));
    
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
      
      setVisibleWinners(winners.slice(0, 3));
    }, 5000);
    
    return () => clearInterval(interval);
  }, [winners]);

  return (
    <div className="w-full overflow-hidden bg-casino-thunder-dark/50 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-3 flex items-center">
        <Trophy className="h-5 w-5 text-casino-thunder-green mr-2" />
        Latest Winners
      </h3>
      
      <div className="space-y-3">
        <AnimatePresence>
          {visibleWinners.map((winner, index) => (
            <motion.div
              key={winner.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ 
                duration: 0.5,
                delay: index * 0.1
              }}
              className="bg-casino-thunder-darker/50 rounded-lg p-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="bg-casino-thunder-green/20 rounded-full p-2 animate-pulse-glow">
                  {winner.amount > 2000 ? (
                    <Trophy className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <Coins className="h-5 w-5 text-casino-thunder-green" />
                  )}
                </div>
                
                <div>
                  <span className="font-bold text-white">{winner.username}</span>
                  <div className="flex items-center gap-1 text-sm">
                    <span className="text-white/70">won on</span>
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
  );
};

export default WinningRoller;
