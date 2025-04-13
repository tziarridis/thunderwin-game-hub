
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, Trophy, Filter, Calendar, Star, Zap, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import DepositButton from "@/components/user/DepositButton";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

// Mock data for configurable banners
const banners = [
  {
    id: 1,
    title: "Champions League Finals",
    description: "Bet on the biggest football event of the year with boosted odds",
    imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    ctaText: "Place Bet",
    ctaUrl: "/sports/football",
    backgroundColor: "from-blue-900 to-indigo-900"
  },
  {
    id: 2,
    title: "NBA Playoffs",
    description: "Special betting markets available for all playoff games",
    imageUrl: "https://images.unsplash.com/photo-1546519638-68e109acd27d",
    ctaText: "View Markets",
    ctaUrl: "/sports/basketball",
    backgroundColor: "from-orange-800 to-red-900"
  }
];

const Sports = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const handlePlaceBet = () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to place a bet");
      return;
    }
    toast.success("Bet placed successfully!");
  };
  
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
  
  const categories = [
    { id: "all", name: "All Sports", icon: <Trophy className="h-4 w-4" /> },
    { id: "football", name: "Football", icon: <Star className="h-4 w-4" /> },
    { id: "basketball", name: "Basketball", icon: <Star className="h-4 w-4" /> },
    { id: "tennis", name: "Tennis", icon: <Star className="h-4 w-4" /> },
    { id: "baseball", name: "Baseball", icon: <Star className="h-4 w-4" /> },
    { id: "hockey", name: "Hockey", icon: <Star className="h-4 w-4" /> },
    { id: "soccer", name: "Soccer", icon: <Star className="h-4 w-4" /> },
    { id: "boxing", name: "Boxing", icon: <Star className="h-4 w-4" /> },
    { id: "mma", name: "MMA", icon: <Star className="h-4 w-4" /> }
  ];
  
  const upcomingMatches = [
    { 
      id: 1, 
      title: "Premier League: Arsenal vs Chelsea", 
      startTime: "2h 30m", 
      odds: { win: 2.10, draw: 3.40, lose: 3.20 },
      featured: true,
      teams: ["Arsenal", "Chelsea"], 
      league: "Premier League"
    },
    { 
      id: 2, 
      title: "NBA: Lakers vs Warriors", 
      startTime: "4h 15m", 
      odds: { win: 1.85, draw: 0, lose: 1.95 },
      featured: true,
      teams: ["Lakers", "Warriors"], 
      league: "NBA"
    },
    { 
      id: 3, 
      title: "Tennis: US Open Final", 
      startTime: "1d 2h", 
      odds: { win: 2.25, draw: 0, lose: 1.65 },
      featured: false,
      teams: ["Djokovic", "Alcaraz"], 
      league: "Grand Slam"
    }
  ];

  return (
    <div className="bg-casino-thunder-darker min-h-screen pt-8 pb-16">
      {/* Banner Section (replacing WinningRoller) */}
      <div className="container mx-auto px-4 mb-8">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {banners.map(banner => (
              <motion.div
                key={banner.id}
                whileHover={{ scale: 1.02 }}
                className={`rounded-lg overflow-hidden relative h-64 bg-gradient-to-r ${banner.backgroundColor}`}
              >
                <div className="absolute inset-0 opacity-60 bg-black">
                  <img 
                    src={banner.imageUrl} 
                    alt={banner.title} 
                    className="w-full h-full object-cover mix-blend-overlay"
                  />
                </div>
                <div className="absolute inset-0 flex flex-col justify-center p-8 z-10">
                  <h3 className="text-2xl font-bold mb-2 text-white">
                    {banner.title}
                  </h3>
                  <p className="text-white/80 mb-4 max-w-md">
                    {banner.description}
                  </p>
                  <div>
                    <Button 
                      className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
                      onClick={() => navigate(banner.ctaUrl)}
                    >
                      {banner.ctaText}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
      
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Sports Betting</h1>
            <p className="text-white/60">Place your bets on top sporting events worldwide</p>
          </div>
          
          <DepositButton variant="highlight" />
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <motion.div 
              className="glass-card p-4 mb-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Trophy className="mr-2 h-5 w-5 text-casino-thunder-green" />
                Sports Categories
              </h3>
              
              <motion.div 
                className="space-y-2"
                variants={container}
                initial="hidden"
                animate="show"
              >
                {categories.map((category) => (
                  <motion.div key={category.id} variants={item}>
                    <Button 
                      variant={activeCategory === category.id ? "default" : "outline"}
                      className={`w-full justify-start ${
                        activeCategory === category.id 
                          ? "bg-casino-thunder-green text-black hover:bg-casino-thunder-green/90" 
                          : "text-white hover:text-casino-thunder-green glass-button"
                      }`}
                      onClick={() => setActiveCategory(category.id)}
                    >
                      {category.icon}
                      <span className="ml-2">{category.name}</span>
                    </Button>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="glass-card p-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Filter className="mr-2 h-5 w-5 text-casino-thunder-green" />
                Quick Filters
              </h3>
              
              <div className="space-y-2">
                <Button 
                  variant="outline"
                  className="w-full justify-start text-white hover:text-casino-thunder-green glass-button"
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Live Now
                </Button>
                <Button 
                  variant="outline"
                  className="w-full justify-start text-white hover:text-casino-thunder-green glass-button"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Today's Events
                </Button>
                <Button 
                  variant="outline"
                  className="w-full justify-start text-white hover:text-casino-thunder-green glass-button"
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Featured Matches
                </Button>
              </div>
            </motion.div>
          </div>
          
          <div className="lg:col-span-3">
            <Tabs defaultValue="upcoming" className="w-full enhanced-tabs">
              <TabsList className="mb-4 bg-casino-thunder-gray/30 backdrop-blur-md w-full justify-start">
                <TabsTrigger value="upcoming" className="tab-highlight">
                  <Calendar className="mr-2 h-4 w-4" />
                  Upcoming
                </TabsTrigger>
                <TabsTrigger value="live" className="tab-highlight">
                  <Zap className="mr-2 h-4 w-4" />
                  Live
                </TabsTrigger>
                <TabsTrigger value="popular" className="tab-highlight">
                  <Star className="mr-2 h-4 w-4" />
                  Popular
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="upcoming" className="mt-0">
                <motion.div 
                  className="space-y-4"
                  variants={container}
                  initial="hidden"
                  animate="show"
                >
                  {upcomingMatches.map((match, index) => (
                    <motion.div 
                      key={match.id} 
                      variants={item} 
                      className="glass-card p-5 hover:neo-glow card-hover-lift"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            {match.featured && (
                              <span className="bg-casino-thunder-green/20 text-casino-thunder-green px-2 py-0.5 rounded-full text-xs flex items-center gap-1">
                                <Star className="h-3 w-3" />
                                Featured
                              </span>
                            )}
                            <span className="text-white/60 text-xs">{match.league}</span>
                          </div>
                          <div className="text-white font-semibold text-lg mt-1">{match.title}</div>
                          <div className="flex items-center text-white/60 text-sm mt-1">
                            <Clock className="mr-1.5 h-3.5 w-3.5 text-casino-thunder-green" />
                            Starts in {match.startTime}
                          </div>
                        </div>
                        <Button 
                          className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black mt-3 md:mt-0"
                          onClick={handlePlaceBet}
                        >
                          <Wallet className="mr-2 h-4 w-4" />
                          Place Bet
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3 mt-4 bg-white/5 rounded-lg p-3">
                        <Button 
                          variant="outline" 
                          className="w-full backdrop-blur-sm hover:bg-casino-thunder-green/20 hover:text-casino-thunder-green hover:border-casino-thunder-green/40"
                          onClick={handlePlaceBet}
                        >
                          {match.teams[0]}: {match.odds.win}
                        </Button>
                        
                        {match.odds.draw ? (
                          <Button 
                            variant="outline" 
                            className="w-full backdrop-blur-sm hover:bg-casino-thunder-green/20 hover:text-casino-thunder-green hover:border-casino-thunder-green/40"
                            onClick={handlePlaceBet}
                          >
                            Draw: {match.odds.draw}
                          </Button>
                        ) : (
                          <div className="flex items-center justify-center text-white/40">
                            VS
                          </div>
                        )}
                        
                        <Button 
                          variant="outline" 
                          className="w-full backdrop-blur-sm hover:bg-casino-thunder-green/20 hover:text-casino-thunder-green hover:border-casino-thunder-green/40"
                          onClick={handlePlaceBet}
                        >
                          {match.teams[1]}: {match.odds.lose}
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </TabsContent>
              
              <TabsContent value="live" className="mt-0">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-card p-10 text-center"
                >
                  <Zap className="h-12 w-12 text-casino-thunder-green/50 mx-auto mb-4" />
                  <div className="text-white text-xl font-semibold mb-2">No live events at the moment</div>
                  <div className="text-white/70 mb-6">Check back later for live betting opportunities</div>
                  <Button 
                    className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
                    onClick={() => navigate("/sports")}
                  >
                    View Upcoming Events
                  </Button>
                </motion.div>
              </TabsContent>
              
              <TabsContent value="popular" className="mt-0">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-card p-10 text-center"
                >
                  <Star className="h-12 w-12 text-yellow-500/50 mx-auto mb-4" />
                  <div className="text-white text-xl font-semibold mb-2">Popular events coming soon</div>
                  <div className="text-white/70 mb-6">Stay tuned for featured matches with special promotions</div>
                  <Button 
                    className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
                    onClick={() => navigate("/sports")}
                  >
                    View All Events
                  </Button>
                </motion.div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sports;
