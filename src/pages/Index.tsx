import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { navigateByButtonName } from "@/utils/navigationUtils";
import { Button } from "@/components/ui/button";
import { Gamepad2, Zap, Trophy, Gift, CreditCard, HelpCircle, UserPlus } from "lucide-react";
import { useGames } from "@/hooks/useGames";
import FeaturedGames from "@/components/casino/FeaturedGames";
import GameCategories from "@/components/casino/GameCategories";
import PromoBanner from "@/components/casino/PromoBanner";
import PopularProviders from "@/components/casino/PopularProviders";
import RecentWinners from "@/components/casino/RecentWinners";
import GameCard from "@/components/games/GameCard";
import RecentBigWins from "@/components/casino/RecentBigWins";
import { useAuth } from "@/contexts/AuthContext";
import { scrollToTop } from "@/utils/scrollUtils";
import WalletBalance from "@/components/user/WalletBalance";
import DepositButton from "@/components/user/DepositButton";
import { useIsMobile } from "@/hooks/use-mobile";
import GameLauncher from "@/components/games/GameLauncher";

const Index = () => {
  const navigate = useNavigate();
  const { games, loading, error, launchGame } = useGames();
  const { isAuthenticated, user } = useAuth();
  const isMobile = useIsMobile();
  
  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const buttonName = e.currentTarget.textContent?.trim() || "";
    
    // If the user is not authenticated and clicks on buttons that require authentication
    if (!isAuthenticated && (buttonName === "Play Now" || buttonName === "Claim Bonus" || buttonName === "Bonuses" || buttonName === "Deposit")) {
      navigate('/register');
      scrollToTop();
      return;
    }
    
    navigateByButtonName(buttonName, navigate);
  };

  // Direct navigation handlers
  const handleNavigation = (path: string) => {
    navigate(path);
    scrollToTop();
  };
  
  // Game launch handler for aggregator games
  const handleGameLaunch = async (game: any) => {
    if (!isAuthenticated) {
      navigate('/login');
      scrollToTop();
      return;
    }
    
    try {
      const gameUrl = await launchGame(game, {
        mode: 'real',
        playerId: user?.id || 'guest',
        currency: 'USD',
        language: 'en',
        platform: isMobile ? 'mobile' : 'web'
      });
      
      if (gameUrl) {
        window.open(gameUrl, '_blank');
      }
    } catch (error) {
      console.error("Error launching game:", error);
    }
  };
  
  // Filter games for different sections
  const popularGames = games.filter(game => game.isPopular).slice(0, 12);
  const newGames = games.filter(game => game.isNew).slice(0, 6);
  const slotGames = games.filter(game => game.category === "slots").slice(0, 12);
  const tableGames = games.filter(game => game.category === "table").slice(0, 6);
  const jackpotGames = games.filter(game => game.jackpot).slice(0, 6);
  
  return (
    <div className="relative min-h-screen bg-casino-thunder-darker overflow-hidden">
      <div className="container mx-auto px-4 py-8 pt-20">
        {/* Hero Banner */}
        <div className="relative rounded-xl overflow-hidden mb-8">
          <img 
            src="/lovable-uploads/2dc5015b-5024-411b-8ee9-4b422be630fa.png" 
            alt="ThunderWin Casino" 
            className="w-full h-auto md:h-[400px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex flex-col justify-center px-8">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 thunder-glow">
              Welcome to ThunderWin
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-6 max-w-md">
              Experience the thrill of over 1000+ games and massive jackpots
            </p>
            
            {isAuthenticated ? (
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="bg-black/40 backdrop-blur p-4 rounded-lg">
                  <WalletBalance showRefresh={true} />
                </div>
                <DepositButton variant="highlight" className="md:self-start" />
              </div>
            ) : (
              <div className="flex flex-wrap gap-4">
                <Button 
                  size="lg" 
                  className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black font-bold"
                  onClick={() => {
                    navigate('/register');
                    scrollToTop();
                  }}
                >
                  <UserPlus className="h-5 w-5 mr-2" />
                  Join Now
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white/10"
                  onClick={() => {
                    navigate('/login');
                    scrollToTop();
                  }}
                >
                  Learn More
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          <Button 
            variant="outline" 
            className="flex flex-col items-center justify-center h-24 bg-casino-thunder-dark hover:bg-casino-thunder-highlight hover:text-black border-white/10"
            onClick={() => handleNavigation('/casino/slots')}
          >
            <Gamepad2 className="h-8 w-8 mb-2" />
            <span>Slots</span>
          </Button>
          <Button 
            variant="outline" 
            className="flex flex-col items-center justify-center h-24 bg-casino-thunder-dark hover:bg-casino-thunder-highlight hover:text-black border-white/10"
            onClick={() => handleNavigation('/casino/live-casino')}
          >
            <Zap className="h-8 w-8 mb-2" />
            <span>Live Casino</span>
          </Button>
          <Button 
            variant="outline" 
            className="flex flex-col items-center justify-center h-24 bg-casino-thunder-dark hover:bg-casino-thunder-highlight hover:text-black border-white/10"
            onClick={() => handleNavigation('/casino/jackpots')}
          >
            <Trophy className="h-8 w-8 mb-2" />
            <span>Jackpots</span>
          </Button>
          <Button 
            variant="outline" 
            className="flex flex-col items-center justify-center h-24 bg-casino-thunder-dark hover:bg-casino-thunder-highlight hover:text-black border-white/10"
            onClick={() => {
              if (!isAuthenticated) {
                navigate('/register');
                scrollToTop();
              } else {
                navigate('/bonuses');
                scrollToTop();
              }
            }}
          >
            <Gift className="h-8 w-8 mb-2" />
            <span>{!isAuthenticated ? "Join Now" : "Bonuses"}</span>
          </Button>
          <Button 
            variant="outline" 
            className="flex flex-col items-center justify-center h-24 bg-casino-thunder-dark hover:bg-casino-thunder-highlight hover:text-black border-white/10"
            onClick={() => handleNavigation('/support/help')}
          >
            <HelpCircle className="h-8 w-8 mb-2" />
            <span>Help Center</span>
          </Button>
          <Button 
            variant="outline" 
            className="flex flex-col items-center justify-center h-24 bg-casino-thunder-dark hover:bg-casino-thunder-highlight hover:text-black border-white/10"
            onClick={() => {
              if (!isAuthenticated) {
                navigate('/register');
                scrollToTop();
              } else {
                navigate('/profile');
                scrollToTop();
              }
            }}
          >
            <CreditCard className="h-8 w-8 mb-2" />
            <span>{!isAuthenticated ? "Join Now" : "Deposit"}</span>
          </Button>
        </div>
        
        {/* Recent Big Wins - Full Width */}
        <div className="mb-12">
          <RecentBigWins />
        </div>
        
        {/* Featured Games */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 thunder-glow">Featured Games</h2>
          <FeaturedGames games={popularGames.slice(0, 5)} />
        </div>
        
        {/* Game Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 thunder-glow">Game Categories</h2>
          <GameCategories onCategoryClick={(category) => {
            navigate(`/casino/${category}`);
            scrollToTop();
          }} />
        </div>
        
        {/* Popular Games */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold thunder-glow">Popular Games</h2>
            <Button 
              variant="link" 
              className="text-casino-thunder-green"
              onClick={() => handleNavigation('/casino/popular')}
            >
              View All
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {popularGames.map(game => (
              <GameCard 
                key={game.id}
                id={game.id}
                title={game.title}
                image={game.image}
                provider={game.provider}
                isPopular={game.isPopular}
                isNew={game.isNew}
                rtp={game.rtp}
                isFavorite={game.isFavorite}
                minBet={game.minBet}
                maxBet={game.maxBet}
                onClick={() => handleGameLaunch(game)}
              />
            ))}
          </div>
        </div>
        
        {/* Promo Banner */}
        <div className="mb-12">
          <PromoBanner 
            title="Welcome Bonus" 
            description="Get 100% up to $500 + 100 Free Spins on your first deposit!" 
            buttonText="Claim Now"
            onButtonClick={() => {
              if (!isAuthenticated) {
                navigate('/register');
                scrollToTop();
              } else {
                navigate('/bonuses');
                scrollToTop();
              }
            }}
          />
        </div>
        
        {/* New Games */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold thunder-glow">New Games</h2>
            <Button 
              variant="link" 
              className="text-casino-thunder-green"
              onClick={() => handleNavigation('/casino/new')}
            >
              View All
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {newGames.map(game => (
              <GameCard 
                key={game.id}
                id={game.id}
                title={game.title}
                image={game.image}
                provider={game.provider}
                isPopular={game.isPopular}
                isNew={game.isNew}
                rtp={game.rtp}
                isFavorite={game.isFavorite}
                minBet={game.minBet}
                maxBet={game.maxBet}
                onClick={() => handleNavigation(`/casino/game/${game.id}`)}
              />
            ))}
          </div>
        </div>
        
        {/* Popular Providers */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 thunder-glow">Popular Providers</h2>
          <PopularProviders onProviderClick={(provider) => handleNavigation(`/casino/provider/${provider}`)} />
        </div>
        
        {/* Jackpot Games */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold thunder-glow">Jackpot Games</h2>
            <Button 
              variant="link" 
              className="text-casino-thunder-green"
              onClick={() => handleNavigation('/casino/jackpots')}
            >
              View All
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {jackpotGames.map(game => (
              <GameCard 
                key={game.id}
                id={game.id}
                title={game.title}
                image={game.image}
                provider={game.provider}
                isPopular={game.isPopular}
                isNew={game.isNew}
                rtp={game.rtp}
                isFavorite={game.isFavorite}
                minBet={game.minBet}
                maxBet={game.maxBet}
                onClick={() => handleNavigation(`/casino/game/${game.id}`)}
              />
            ))}
          </div>
        </div>
        
        {/* Recent Winners */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 thunder-glow">Recent Winners</h2>
          <RecentWinners />
        </div>
        
        {/* Table Games */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold thunder-glow">Table Games</h2>
            <Button 
              variant="link" 
              className="text-casino-thunder-green"
              onClick={() => handleNavigation('/casino/table-games')}
            >
              View All
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {tableGames.map(game => (
              <GameCard 
                key={game.id}
                id={game.id}
                title={game.title}
                image={game.image}
                provider={game.provider}
                isPopular={game.isPopular}
                isNew={game.isNew}
                rtp={game.rtp}
                isFavorite={game.isFavorite}
                minBet={game.minBet}
                maxBet={game.maxBet}
                onClick={() => handleNavigation(`/casino/game/${game.id}`)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
