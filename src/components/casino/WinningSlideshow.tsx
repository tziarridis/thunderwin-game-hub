
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

const WinningSlideshow = () => {
  const [currentWinnerIndex, setCurrentWinnerIndex] = useState(0);
  
  const winners: Winner[] = [
    { id: 1, username: "Lucky777", game: "Book of Dead", amount: 1250.75, time: "2 min ago" },
    { id: 2, username: "JackpotHunter", game: "Starburst", amount: 875.50, time: "15 min ago" },
    { id: 3, username: "SpinMaster", game: "Sweet Bonanza", amount: 3100.25, time: "32 min ago" },
    { id: 4, username: "GoldenTouch", game: "Gonzo's Quest", amount: 950.00, time: "1 hour ago" },
    { id: 5, username: "BetBaron", game: "Buffalo King", amount: 2200.50, time: "1 hour ago" },
    { id: 6, username: "RoyalRoller", game: "Reactoonz", amount: 1650.75, time: "2 hours ago" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWinnerIndex((prevIndex) => (prevIndex + 1) % winners.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const currentWinner = winners[currentWinnerIndex];

  return (
    <div className="fixed top-20 z-50 w-full pointer-events-none overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentWinner.id}
          initial={{ x: "-100%" }}  // Changed from 100% to -100%
          animate={{ x: 0 }}
          exit={{ x: "100%" }}  // Changed from -100% to 100%
          transition={{ 
            x: { duration: 1, ease: "easeInOut" },
          }}
          className="glass-card p-3 inline-flex items-center gap-3 shadow-lg neo-glow absolute left-0"  // Changed from right-0 to left-0
        >
          <div className="bg-casino-thunder-green/20 rounded-full p-2 animate-pulse-glow">
            {currentWinner.amount > 2000 ? (
              <Trophy className="h-5 w-5 text-yellow-500" />
            ) : (
              <Coins className="h-5 w-5 text-casino-thunder-green" />
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-sm">{currentWinner.username}</span>
            <span className="text-white/70 text-xs">won on</span>
            <span className="text-white/90 text-sm font-medium">{currentWinner.game}</span>
            <Zap className="h-3.5 w-3.5 text-casino-thunder-green" />
            <span className="font-bold text-casino-thunder-green">
              <motion.span
                key={currentWinner.id + "-amount"}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                ${currentWinner.amount.toFixed(2)}
              </motion.span>
            </span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default WinningSlideshow;

