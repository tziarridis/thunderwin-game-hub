
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { 
  ArrowLeft,
  Star,
  Share,
  Heart,
  DollarSign,
  Zap,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Plus,
  Minus,
  History,
  RefreshCw
} from "lucide-react";

// Mock game data
const mockGames = [
  {
    id: "1",
    title: "Lightning Roulette",
    image: "https://images.unsplash.com/photo-1531059224353-8e56cd9eb9b2?auto=format&fit=crop&q=80&w=1200",
    provider: "Evolution Gaming",
    minBet: 1,
    maxBet: 1000,
    rtp: 97.3,
    volatility: "High",
    isPopular: true,
    description: "Lightning Roulette takes the classic Roulette game to the next level with electrifying lightning strikes that can multiply your winnings up to 500x.",
    category: "Live Casino"
  },
  {
    id: "2",
    title: "Book of Dead",
    image: "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&q=80&w=1200",
    provider: "Play'n GO",
    minBet: 0.10,
    maxBet: 100,
    rtp: 96.2,
    volatility: "High",
    isPopular: true,
    description: "Join Rich Wilde on his adventure through ancient Egypt in search of the Book of Dead and untold treasures.",
    category: "Slots"
  },
  {
    id: "3",
    title: "Sweet Bonanza",
    image: "https://images.unsplash.com/photo-1586899028174-e7098604235b?auto=format&fit=crop&q=80&w=1200",
    provider: "Pragmatic Play",
    minBet: 0.20,
    maxBet: 125,
    rtp: 96.5,
    volatility: "Medium",
    isNew: true,
    description: "A candy-filled adventure with tumbling reels and sweet multipliers for big win potential.",
    category: "Slots"
  }
];

const GameDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated, updateBalance } = useAuth();
  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [betAmount, setBetAmount] = useState(10);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameResult, setGameResult] = useState<{
    outcome: "win" | "lose" | null;
    amount: number;
    message: string;
  } | null>(null);
  const [gameHistory, setGameHistory] = useState<{
    timestamp: Date;
    bet: number;
    outcome: "win" | "lose";
    amount: number;
  }[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [quickBetAmounts, setQuickBetAmounts] = useState<number[]>([5, 10, 25, 50, 100]);
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      const foundGame = mockGames.find(g => g.id === id);
      setGame(foundGame || null);
      setLoading(false);
      
      // Initialize bet amount based on game min/max
      if (foundGame) {
        setBetAmount(Math.max(foundGame.minBet, Math.min(10, foundGame.maxBet)));
        
        // Generate quick bet amounts based on min/max
        const min = foundGame.minBet;
        const max = foundGame.maxBet;
        const spread = max - min;
        
        setQuickBetAmounts([
          Math.round(min + spread * 0.05),
          Math.round(min + spread * 0.1),
          Math.round(min + spread * 0.2),
          Math.round(min + spread * 0.3),
          Math.round(min + spread * 0.5)
        ]);
      }
    }, 800);
  }, [id]);

  const handlePlay = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to play this game.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (!user || user.balance < betAmount) {
      toast({
        title: "Insufficient Balance",
        description: "Please deposit funds to continue playing.",
        variant: "destructive",
      });
      return;
    }

    setIsPlaying(true);
    setGameResult(null);

    // Simulate gameplay (random outcome)
    setTimeout(() => {
      const isWin = Math.random() > 0.6; // 40% chance to win
      const winMultiplier = isWin ? (Math.random() * 3 + 1) : 0; // Random multiplier between 1x and 4x
      const winAmount = Math.round(betAmount * winMultiplier * 100) / 100;
      const newBalance = isWin 
        ? user.balance + winAmount - betAmount 
        : user.balance - betAmount;
      
      updateBalance(newBalance);
      
      const result = {
        outcome: isWin ? "win" : "lose",
        amount: isWin ? winAmount : betAmount,
        message: isWin 
          ? `Congratulations! You won ${winAmount.toFixed(2)}!` 
          : "Better luck next time!"
      };
      
      setGameResult(result);
      setIsPlaying(false);
      
      // Add to game history
      setGameHistory(prev => [{
        timestamp: new Date(),
        bet: betAmount,
        outcome: isWin ? "win" : "lose",
        amount: isWin ? winAmount : betAmount
      }, ...prev.slice(0, 9)]); // Keep last 10 games
      
      toast({
        title: isWin ? "You Won!" : "You Lost",
        description: isWin 
          ? `You've won $${winAmount.toFixed(2)}!` 
          : `You've lost $${betAmount.toFixed(2)}.`,
        variant: isWin ? "default" : "destructive",
      });
    }, 2000);
  };

  const decreaseBet = () => {
    if (betAmount > game.minBet) {
      setBetAmount(prev => Math.max(game.minBet, prev - 5));
    }
  };

  const increaseBet = () => {
    if (betAmount < game.maxBet) {
      setBetAmount(prev => Math.min(game.maxBet, prev + 5));
    }
  };
  
  const handleSetBetAmount = (amount: number) => {
    if (amount >= game.minBet && amount <= game.maxBet) {
      setBetAmount(amount);
    }
  };
  
  const toggleFavorite = () => {
    setFavorited(!favorited);
    toast({
      title: favorited ? "Removed from Favorites" : "Added to Favorites",
      description: favorited 
        ? `${game.title} has been removed from your favorites.` 
        : `${game.title} has been added to your favorites.`,
    });
  };
  
  const handleMaxBet = () => {
    if (user && user.balance > 0) {
      const maxPossible = Math.min(game.maxBet, user.balance);
      setBetAmount(maxPossible);
    } else {
      setBetAmount(game.maxBet);
    }
  };
  
  const handleShare = () => {
    // Copy the game URL to clipboard
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copied",
      description: "Game link has been copied to clipboard!",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-12 flex flex-col items-center justify-center bg-casino-thunder-darker">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-casino-thunder-green"></div>
        <p className="mt-4 text-white/70">Loading game...</p>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen pt-20 pb-12 flex flex-col items-center justify-center bg-casino-thunder-darker">
        <h1 className="text-2xl font-bold text-white mb-4">Game Not Found</h1>
        <p className="text-white/70 mb-6">The game you're looking for doesn't exist.</p>
        <Button 
          onClick={() => navigate("/casino")}
          className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
        >
          Back to Casino
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 bg-casino-thunder-darker">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="text-white/70 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Preview */}
          <div className="lg:col-span-2">
            <div className="thunder-card overflow-hidden relative aspect-video">
              {/* Game image as placeholder */}
              <img 
                src={game.image} 
                alt={game.title}
                className="w-full h-full object-cover"
              />
              
              {/* Play overlay */}
              {!isPlaying && !gameResult && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Button 
                    size="lg"
                    className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black text-xl px-10 py-6"
                    onClick={handlePlay}
                  >
                    <Zap className="mr-2 h-6 w-6" />
                    Play Now
                  </Button>
                </div>
              )}
              
              {/* Game in progress */}
              {isPlaying && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-casino-thunder-green mb-4"></div>
                  <p className="text-white text-xl">Game in progress...</p>
                </div>
              )}
              
              {/* Game result */}
              {gameResult && (
                <div className={`absolute inset-0 ${
                  gameResult.outcome === "win" 
                    ? "bg-green-900/80" 
                    : "bg-red-900/80"
                } flex flex-col items-center justify-center`}>
                  <h3 className="text-3xl font-bold text-white mb-2">
                    {gameResult.outcome === "win" ? "YOU WIN!" : "YOU LOSE"}
                  </h3>
                  <p className="text-white text-xl mb-4">
                    {gameResult.outcome === "win" 
                      ? `$${gameResult.amount.toFixed(2)}` 
                      : gameResult.message}
                  </p>
                  <div className="flex gap-3">
                    <Button 
                      className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
                      onClick={handlePlay}
                    >
                      Play Again
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setGameResult(null)}
                    >
                      Back to Game
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Game Controls */}
            <div className="thunder-card mt-6 p-4">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-white/70 mb-2">Your Bet Amount:</p>
                    <div className="flex items-center space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={decreaseBet}
                        disabled={betAmount <= game.minBet}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <div className="bg-white/5 px-4 py-2 rounded-md min-w-[100px] text-center">
                        <span className="text-casino-thunder-green font-semibold">${betAmount.toFixed(2)}</span>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={increaseBet}
                        disabled={betAmount >= game.maxBet}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Button 
                      variant={favorited ? "default" : "outline"} 
                      size="sm"
                      onClick={toggleFavorite}
                      className={favorited ? "bg-red-500 hover:bg-red-600 text-white" : ""}
                    >
                      <Heart className={`h-4 w-4 mr-2 ${favorited ? "fill-current" : ""}`} />
                      {favorited ? "Favorited" : "Favorite"}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleShare}
                    >
                      <Share className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    <Button 
                      size="sm"
                      className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
                      onClick={handlePlay}
                      disabled={isPlaying || !isAuthenticated || (user && user.balance < betAmount)}
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      {isAuthenticated 
                        ? (user && user.balance < betAmount 
                            ? "Deposit Needed" 
                            : "Place Bet")
                        : "Login to Play"}
                    </Button>
                  </div>
                </div>
                
                {/* Quick bet buttons */}
                <div>
                  <p className="text-white/70 mb-2">Quick Bet:</p>
                  <div className="flex flex-wrap gap-2">
                    {quickBetAmounts.map((amount) => (
                      <Button 
                        key={amount} 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleSetBetAmount(amount)}
                        className={betAmount === amount ? "border-casino-thunder-green text-casino-thunder-green" : ""}
                      >
                        ${amount}
                      </Button>
                    ))}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleMaxBet}
                      className="text-yellow-500 border-yellow-500/50 hover:border-yellow-500"
                    >
                      Max
                    </Button>
                  </div>
                </div>
                
                {/* Game History Toggle */}
                <div className="flex justify-between items-center">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowHistory(!showHistory)}
                    className="text-white/70 hover:text-casino-thunder-green"
                  >
                    <History className="h-4 w-4 mr-2" />
                    {showHistory ? "Hide History" : "Show History"}
                  </Button>
                  
                  {user && (
                    <div className="text-white/70 text-sm">
                      Balance: <span className="text-casino-thunder-green font-bold">${user.balance.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Game History */}
            {showHistory && (
              <div className="thunder-card mt-6 p-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <History className="mr-2 text-casino-thunder-green" />
                  Game History
                </h3>
                
                {gameHistory.length === 0 ? (
                  <p className="text-white/70 text-center py-4">No game history yet. Start playing!</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-2 px-4 text-white/70">Time</th>
                          <th className="text-left py-2 px-4 text-white/70">Bet</th>
                          <th className="text-left py-2 px-4 text-white/70">Outcome</th>
                          <th className="text-left py-2 px-4 text-white/70">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gameHistory.map((item, index) => (
                          <tr key={index} className="border-b border-white/5">
                            <td className="py-2 px-4 text-white/80">
                              {item.timestamp.toLocaleTimeString()}
                            </td>
                            <td className="py-2 px-4 text-white/80">
                              ${item.bet.toFixed(2)}
                            </td>
                            <td className="py-2 px-4">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                item.outcome === "win" 
                                  ? "bg-green-500/20 text-green-500" 
                                  : "bg-red-500/20 text-red-500"
                              }`}>
                                {item.outcome === "win" ? "Win" : "Loss"}
                              </span>
                            </td>
                            <td className={`py-2 px-4 font-medium ${
                              item.outcome === "win" 
                                ? "text-green-500" 
                                : "text-red-500"
                            }`}>
                              {item.outcome === "win" ? "+" : "-"}${item.amount.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Game Info */}
          <div className="thunder-card p-6">
            <h1 className="text-2xl font-bold text-white mb-1">{game.title}</h1>
            <p className="text-white/70 mb-4">By {game.provider}</p>
            
            <div className="flex items-center mb-6">
              <div className="flex">
                {Array(5).fill(0).map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-5 w-5 ${i < 4 ? "text-yellow-500 fill-yellow-500" : "text-white/30"}`} 
                  />
                ))}
              </div>
              <span className="text-white/70 ml-2">(143 reviews)</span>
            </div>
            
            <p className="text-white/80 mb-6">{game.description}</p>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-white/70">Category:</span>
                <span className="text-white font-medium">{game.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Min Bet:</span>
                <span className="text-white font-medium">${game.minBet.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Max Bet:</span>
                <span className="text-white font-medium">${game.maxBet.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">RTP:</span>
                <span className="text-white font-medium">{game.rtp}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Volatility:</span>
                <span className="text-white font-medium">{game.volatility}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="bg-white/10 px-3 py-1 rounded-full text-sm text-white/80 flex items-center">
                <ThumbsUp className="h-3 w-3 mr-1" /> 88%
              </span>
              <span className="bg-white/10 px-3 py-1 rounded-full text-sm text-white/80 flex items-center">
                <Clock className="h-3 w-3 mr-1" /> Fast Pays
              </span>
              <span className="bg-white/10 px-3 py-1 rounded-full text-sm text-white/80 flex items-center">
                <Zap className="h-3 w-3 mr-1" /> Multipliers
              </span>
            </div>
            
            <div className="bg-white/5 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">How to Play</h3>
              <ol className="text-white/80 space-y-2 list-decimal pl-5">
                <li>Set your bet amount using the controls</li>
                <li>Click the "Play Now" button to start</li>
                <li>Wait for the outcome to be determined</li>
                <li>Collect your winnings or try again!</li>
              </ol>
            </div>
            
            <div className="mt-6">
              <Button 
                className="w-full bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black mb-3"
                onClick={handlePlay}
                disabled={isPlaying || !isAuthenticated || (user && user.balance < betAmount)}
              >
                <Zap className="mr-2 h-5 w-5" />
                {isAuthenticated 
                  ? (user && user.balance < betAmount 
                      ? "Deposit to Play" 
                      : "Play Now")
                  : "Login to Play"}
              </Button>
              
              {/* Similar Games Suggestion */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-white mb-3">You Might Also Like</h3>
                <div className="grid grid-cols-2 gap-3">
                  {mockGames
                    .filter(g => g.id !== id)
                    .slice(0, 2)
                    .map(similarGame => (
                      <div 
                        key={similarGame.id} 
                        className="thunder-card overflow-hidden cursor-pointer"
                        onClick={() => navigate(`/casino/game/${similarGame.id}`)}
                      >
                        <div className="h-24 overflow-hidden">
                          <img 
                            src={similarGame.image} 
                            alt={similarGame.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-2">
                          <h4 className="text-sm font-medium text-white truncate">{similarGame.title}</h4>
                          <p className="text-xs text-white/60">{similarGame.provider}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDetails;
