
import React from "react";
import { Trophy, Coins, Zap, Clock } from "lucide-react";
import { motion } from "framer-motion";

const RecentWinners = () => {
  const winners = [
    { id: 1, username: "Lucky777", game: "Book of Dead", amount: 1250.75, time: "2 min ago" },
    { id: 2, username: "JackpotHunter", game: "Starburst", amount: 875.50, time: "15 min ago" },
    { id: 3, username: "SpinMaster", game: "Sweet Bonanza", amount: 3100.25, time: "32 min ago" },
    { id: 4, username: "GoldenTouch", game: "Gonzo's Quest", amount: 950.00, time: "1 hour ago" },
    { id: 5, username: "BetBaron", game: "Buffalo King", amount: 2200.50, time: "1 hour ago" },
    { id: 6, username: "RoyalRoller", game: "Reactoonz", amount: 1650.75, time: "2 hours ago" }
  ];
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  
  return (
    <div className="thunder-card p-6 glass-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center">
          <Zap className="mr-2 h-5 w-5 text-casino-thunder-green" />
          Recent Big Wins
        </h3>
        <span className="text-white/60 text-sm">Last 24 hours</span>
      </div>
      
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {winners.map((winner) => (
          <motion.div 
            key={winner.id} 
            variants={item}
            className="backdrop-blur-sm bg-white/5 rounded-xl border border-white/10 p-4 hover:border-casino-thunder-green/30 transition-all duration-300"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-casino-thunder-green/20 rounded-full flex items-center justify-center mr-4">
                {winner.amount > 2000 ? (
                  <Trophy className="h-5 w-5 text-yellow-500" />
                ) : (
                  <Coins className="h-5 w-5 text-casino-thunder-green" />
                )}
              </div>
              
              <div className="flex-grow">
                <h4 className="font-medium text-white mb-1">{winner.username}</h4>
                <p className="text-white/70 text-sm mb-2">Won on {winner.game}</p>
                <div className="flex justify-between items-center">
                  <motion.span 
                    className="text-casino-thunder-green font-semibold"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", damping: 10, stiffness: 100 }}
                  >
                    ${winner.amount.toFixed(2)}
                  </motion.span>
                  <span className="text-white/50 text-xs flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {winner.time}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default RecentWinners;
