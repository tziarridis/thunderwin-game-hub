
import React from "react";
import { Trophy, Coins } from "lucide-react";

const RecentWinners = () => {
  const winners = [
    { id: 1, username: "Lucky777", game: "Book of Dead", amount: 1250.75, time: "2 min ago" },
    { id: 2, username: "JackpotHunter", game: "Starburst", amount: 875.50, time: "15 min ago" },
    { id: 3, username: "SpinMaster", game: "Sweet Bonanza", amount: 3100.25, time: "32 min ago" },
    { id: 4, username: "GoldenTouch", game: "Gonzo's Quest", amount: 950.00, time: "1 hour ago" },
    { id: 5, username: "BetBaron", game: "Buffalo King", amount: 2200.50, time: "1 hour ago" },
    { id: 6, username: "RoyalRoller", game: "Reactoonz", amount: 1650.75, time: "2 hours ago" }
  ];
  
  return (
    <div className="thunder-card p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {winners.map((winner) => (
          <div key={winner.id} className="flex items-start p-4 bg-casino-thunder-dark/30 rounded-lg hover:bg-casino-thunder-dark transition-colors">
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
                <span className="text-casino-thunder-green font-semibold">${winner.amount.toFixed(2)}</span>
                <span className="text-white/50 text-xs">{winner.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentWinners;
