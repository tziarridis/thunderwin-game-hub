
import React from "react";
import { Trophy, Dribbble, Gamepad, Goal, Zap, Medal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { navigateByButtonName } from "@/utils/navigationUtils";

const Sports = () => {
  const navigate = useNavigate();

  const handleNavigation = (sportName: string) => {
    navigateByButtonName(sportName, navigate);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-casino-thunder-dark rounded-2xl p-6 mb-8 border border-white/10 shadow-xl">
        <div className="flex items-center mb-6">
          <Trophy size={36} className="text-casino-thunder-green mr-3" />
          <h1 className="text-3xl font-bold text-white">Sports Betting</h1>
        </div>
        
        <p className="text-white/80 mb-6">
          Place bets on your favorite sports with competitive odds and exciting live betting options.
          Browse through popular sports categories below or search for specific events.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Button 
            variant="outline" 
            size="lg"
            className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white flex items-center justify-center h-16"
            onClick={() => handleNavigation("Football")}
          >
            <Dribbble className="mr-2 h-5 w-5 text-casino-thunder-green" />
            Football
          </Button>
          
          <Button 
            variant="outline"
            size="lg"
            className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white flex items-center justify-center h-16"
            onClick={() => handleNavigation("Basketball")}
          >
            <Gamepad className="mr-2 h-5 w-5 text-casino-thunder-green" />
            Basketball
          </Button>
          
          <Button 
            variant="outline"
            size="lg"
            className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white flex items-center justify-center h-16"
            onClick={() => handleNavigation("Tennis")}
          >
            <Goal className="mr-2 h-5 w-5 text-casino-thunder-green" />
            Tennis
          </Button>
          
          <Button 
            variant="outline"
            size="lg"
            className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white flex items-center justify-center h-16"
            onClick={() => handleNavigation("Hockey")}
          >
            <Zap className="mr-2 h-5 w-5 text-casino-thunder-green" />
            Hockey
          </Button>
          
          <Button 
            variant="outline"
            size="lg"
            className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white flex items-center justify-center h-16"
            onClick={() => handleNavigation("Esports")}
          >
            <Trophy className="mr-2 h-5 w-5 text-casino-thunder-green" />
            Esports
          </Button>
          
          <Button 
            variant="outline"
            size="lg"
            className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white flex items-center justify-center h-16"
            onClick={() => handleNavigation("Sports")}
          >
            <Medal className="mr-2 h-5 w-5 text-casino-thunder-green" />
            All Sports
          </Button>
        </div>
        
        <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20 mb-6">
          <p className="text-sm text-yellow-400">
            Coming soon: Enhanced betting experience with live stats, better odds, and more sports categories!
          </p>
        </div>
        
        <div className="mt-8">
          <h2 className="text-xl font-bold text-white mb-4">Featured Matches</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/10 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Dribbble className="h-5 w-5 text-casino-thunder-green mr-2" />
                  <span>Champions League</span>
                </div>
                <span className="text-xs bg-casino-thunder-green/20 text-casino-thunder-green px-2 py-1 rounded">Live</span>
              </div>
              <div className="flex justify-between items-center mt-4">
                <span className="text-white">Team A</span>
                <span className="text-white/70">1 - 0</span>
                <span className="text-white">Team B</span>
              </div>
              <div className="mt-3">
                <Button 
                  className="w-full bg-casino-thunder-green hover:bg-casino-thunder-green/80 text-black text-sm"
                  onClick={() => handleNavigation("Football")}
                >
                  Place Bet
                </Button>
              </div>
            </div>
            
            <div className="bg-white/5 border border-white/10 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Gamepad className="h-5 w-5 text-casino-thunder-green mr-2" />
                  <span>NBA</span>
                </div>
                <span className="text-xs bg-white/10 text-white/70 px-2 py-1 rounded">Today 21:00</span>
              </div>
              <div className="flex justify-between items-center mt-4">
                <span className="text-white">Team C</span>
                <span className="text-white/70">vs</span>
                <span className="text-white">Team D</span>
              </div>
              <div className="mt-3">
                <Button 
                  className="w-full bg-casino-thunder-green hover:bg-casino-thunder-green/80 text-black text-sm"
                  onClick={() => handleNavigation("Basketball")}
                >
                  Place Bet
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sports;
