import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Search, Calendar, Clock, Users, Zap, Star, Flag, Timer, TrendingUp, Medal, BadgePercent } from "lucide-react";
import { Gamepad } from "lucide-react"; // Changed from Gamepad2 to Gamepad
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; // Added import for the Badge component
import { useNavigate } from "react-router-dom";
import GlowButton from "@/components/casino/GlowButton";
import { toast } from "sonner";
import { motion } from "framer-motion";

// Enhanced banner data with better images and descriptions
const banners = [
  {
    id: 5,
    title: "VIP Sports Betting Experience",
    description: "Exclusive odds, higher limits, and personalized service for our VIP sports bettors",
    imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c643e7f0b",
    ctaText: "Join VIP",
    ctaUrl: "/vip",
    backgroundColor: "from-blue-800 to-purple-900",
    textColor: "text-white"
  },
  {
    id: 6,
    title: "Premier League Special",
    description: "Enhanced odds on this weekend's top matches with 100% cashback on your first bet",
    imageUrl: "https://images.unsplash.com/photo-1522778526097-ce0a22ceb253",
    ctaText: "View Odds",
    ctaUrl: "/sports/football",
    backgroundColor: "from-green-800 to-blue-900",
    textColor: "text-white"
  },
  {
    id: 7,
    title: "Live Betting Bonus",
    description: "Get a 50% boost on all in-play bets placed during major tournaments",
    imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018",
    ctaText: "Bet Live Now",
    ctaUrl: "/sports",
    backgroundColor: "from-red-800 to-orange-700",
    textColor: "text-white"
  }
];

// More comprehensive sports data
const featuredLeagues = [
  { id: 1, name: "UEFA Champions League", icon: "🏆", route: "/sports/football/champions-league" },
  { id: 2, name: "English Premier League", icon: "⚽", route: "/sports/football/premier-league" },
  { id: 3, name: "NBA", icon: "🏀", route: "/sports/basketball/nba" },
  { id: 4, name: "Formula 1", icon: "🏎️", route: "/sports/formula1" },
  { id: 5, name: "Tennis Grand Slams", icon: "🎾", route: "/sports/tennis/grand-slams" },
  { id: 6, name: "UFC/MMA", icon: "🥊", route: "/sports/ufc" }
];

const Sports = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [showSportsSection, setShowSportsSection] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [currentBanner, setCurrentBanner] = useState(0);
  
  useEffect(() => {
    console.log("Sports component mounted");
    
    // Simulate loading state
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    // Banner rotation
    const bannerInterval = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % banners.length);
    }, 5000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(bannerInterval);
    };
  }, []);

  // Placeholder data for popular events
  const popularEvents = [
    { id: 1, league: "Premier League", team1: "Arsenal", team2: "Liverpool", time: "Today, 19:45", odds: { team1: 2.1, draw: 3.4, team2: 3.5 }, featured: true },
    { id: 2, league: "La Liga", team1: "Barcelona", team2: "Real Madrid", time: "Tomorrow, 20:00", odds: { team1: 1.9, draw: 3.6, team2: 3.8 }, featured: true },
    { id: 3, league: "Bundesliga", team1: "Bayern Munich", team2: "Dortmund", time: "Today, 17:30", odds: { team1: 1.65, draw: 4.0, team2: 4.5 }, featured: false },
    { id: 4, league: "Serie A", team1: "Juventus", team2: "Inter Milan", time: "Tomorrow, 14:00", odds: { team1: 2.3, draw: 3.2, team2: 2.9 }, featured: false },
    { id: 5, league: "NBA", team1: "Lakers", team2: "Celtics", time: "Today, 02:00", odds: { team1: 1.85, team2: 1.95 }, featured: true },
    { id: 6, league: "NHL", team1: "Maple Leafs", team2: "Canadiens", time: "Tomorrow, 01:30", odds: { team1: 2.25, team2: 1.65 }, featured: false },
    { id: 7, league: "UFC", team1: "Jon Jones", team2: "Israel Adesanya", time: "Saturday, 23:00", odds: { team1: 1.75, team2: 2.15 }, featured: true },
    { id: 8, league: "Formula 1", team1: "Monaco Grand Prix", team2: "Qualifying", time: "Saturday, 15:00", odds: { team1: 1.55, team2: 2.35 }, featured: false },
  ];

  // Filter events based on search and active tab
  const filteredEvents = popularEvents.filter(event => {
    const matchesSearch = 
      event.team1.toLowerCase().includes(searchTerm.toLowerCase()) || 
      event.team2.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.league.toLowerCase().includes(searchTerm.toLowerCase());
      
    if (activeTab === "featured") {
      return matchesSearch && event.featured;
    }
    
    return matchesSearch;
  });

  const handleTabClick = (value: string) => {
    console.log(`Tab clicked: ${value}`);
    setActiveTab(value);
    
    // Navigate to appropriate sports page based on tab value
    if (value !== "all" && value !== "live" && value !== "upcoming" && value !== "featured") {
      navigate(`/sports/${value}`);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-casino-thunder-darker min-h-screen pb-16 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-40 bg-white/10 rounded-md mb-4"></div>
          <div className="h-4 w-64 bg-white/10 rounded-md"></div>
        </div>
      </div>
    );
  }

  if (!showSportsSection) {
    return (
      <div className="bg-casino-thunder-darker min-h-screen pt-20 pb-16 flex items-center justify-center">
        <div className="text-center max-w-lg mx-auto p-8 bg-white/5 rounded-lg border border-white/10">
          <Trophy className="h-16 w-16 text-white/30 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Sports Section Unavailable</h2>
          <p className="text-white/70 mb-6">
            Our sports betting section is temporarily unavailable. 
            Please check back later or explore our casino games in the meantime.
          </p>
          <Button 
            onClick={() => navigate('/casino')} 
            className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
          >
            Explore Casino Games
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-casino-thunder-darker min-h-screen pb-16">
      <div className="pt-20 container mx-auto px-4">
        <div className="text-center mb-8">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Sports Betting
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-white/70 max-w-2xl mx-auto"
          >
            Experience the thrill of sports betting with competitive odds, live in-play betting, and exciting promotions.
          </motion.p>
        </div>
        
        {/* Premium Hero Banner with Carousel */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.6 }}
          className="mb-8 relative overflow-hidden rounded-xl shadow-xl"
        >
          <div className="relative h-80 w-full overflow-hidden">
            {banners.map((banner, index) => (
              <motion.div
                key={banner.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: index === currentBanner ? 1 : 0 }}
                transition={{ duration: 0.8 }}
                className={`absolute inset-0 ${index === currentBanner ? 'z-10' : 'z-0'}`}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${banner.backgroundColor}`}>
                  <img 
                    src={banner.imageUrl} 
                    alt={banner.title} 
                    className="w-full h-full object-cover mix-blend-overlay opacity-75"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute inset-0 flex flex-col justify-center p-8 z-10">
                  <div className="max-w-md">
                    <Badge variant="outline" className="mb-3 border-casino-thunder-green text-casino-thunder-green bg-white/10 backdrop-blur-sm">
                      <Star className="h-3 w-3 mr-1" /> Premium Offer
                    </Badge>
                    <h3 className={`text-3xl font-bold mb-2 ${banner.textColor}`}>
                      {banner.title}
                    </h3>
                    <p className={`${banner.textColor} mb-6 opacity-80 text-lg`}>
                      {banner.description}
                    </p>
                    <div>
                      <GlowButton 
                        className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black px-6 py-3 text-md"
                        onClick={() => navigate(banner.ctaUrl)}
                        glowColor="green"
                      >
                        {banner.ctaText}
                      </GlowButton>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* Banner Indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
              {banners.map((_, index) => (
                <button
                  key={index}
                  className={`h-2 rounded-full transition-all ${
                    currentBanner === index ? "w-8 bg-casino-thunder-green" : "w-2 bg-white/50"
                  }`}
                  onClick={() => setCurrentBanner(index)}
                />
              ))}
            </div>
          </div>
        </motion.div>
        
        {/* Featured Leagues */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Medal className="mr-2 h-5 w-5 text-casino-thunder-green" />
            Featured Leagues
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {featuredLeagues.map(league => (
              <Button
                key={league.id}
                variant="outline"
                onClick={() => navigate(league.route)}
                className="px-3 py-6 h-auto flex flex-col items-center justify-center gap-2 bg-white/5 border-white/10 hover:bg-casino-thunder-green/20 hover:border-casino-thunder-green/50 transition-all"
              >
                <span className="text-2xl">{league.icon}</span>
                <span className="text-sm text-center">{league.name}</span>
              </Button>
            ))}
          </div>
        </motion.div>
        
        {/* Search and Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-8"
        >
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
            <Input
              type="text"
              placeholder="Search leagues, teams, matches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white"
            />
          </div>
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabClick} className="w-full">
            <TabsList className="w-full flex overflow-x-auto py-2 justify-start bg-white/5 backdrop-blur-md">
              <TabsTrigger value="all" className="flex items-center">
                <TrendingUp className="h-4 w-4 mr-1.5" />
                All Sports
              </TabsTrigger>
              <TabsTrigger value="featured" className="flex items-center">
                <Star className="h-4 w-4 mr-1.5" />
                Featured
              </TabsTrigger>
              <TabsTrigger value="football" className="flex items-center">
                <Flag className="h-4 w-4 mr-1.5" />
                Football
              </TabsTrigger>
              <TabsTrigger value="basketball" className="flex items-center">
                <Trophy className="h-4 w-4 mr-1.5" />
                Basketball
              </TabsTrigger>
              <TabsTrigger value="tennis" className="flex items-center">
                <Medal className="h-4 w-4 mr-1.5" />
                Tennis
              </TabsTrigger>
              <TabsTrigger value="hockey" className="flex items-center">
                <Flag className="h-4 w-4 mr-1.5" />
                Hockey
              </TabsTrigger>
              <TabsTrigger value="esports" className="flex items-center">
                <Gamepad className="h-4 w-4 mr-1.5" />
                Esports
              </TabsTrigger>
              <TabsTrigger value="live" className="flex items-center">
                <Timer className="h-4 w-4 mr-1.5" />
                Live Now
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="flex items-center">
                <Calendar className="h-4 w-4 mr-1.5" />
                Upcoming
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="pt-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Trophy className="mr-2 h-6 w-6 text-casino-thunder-green" />
                Popular Events
              </h2>
              
              <div className="bg-casino-thunder-dark/90 backdrop-blur-md rounded-lg border border-white/10 overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-white/5">
                        <th className="py-3 px-4 text-left font-medium text-white/70">
                          <div className="flex items-center">
                            <Trophy className="h-4 w-4 mr-2" />
                            League
                          </div>
                        </th>
                        <th className="py-3 px-4 text-left font-medium text-white/70">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2" />
                            Match
                          </div>
                        </th>
                        <th className="py-3 px-4 text-left font-medium text-white/70">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            Time
                          </div>
                        </th>
                        <th className="py-3 px-4 text-center font-medium text-white/70" colSpan={3}>
                          <div className="flex items-center justify-center">
                            <Zap className="h-4 w-4 mr-2" />
                            Odds
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEvents.map((event) => (
                        <tr key={event.id} className={`border-t border-white/5 hover:bg-white/5 transition-colors ${event.featured ? 'bg-casino-thunder-green/5' : ''}`}>
                          <td className="py-4 px-4">
                            <div className="flex items-center">
                              {event.featured && <Star className="h-3 w-3 text-yellow-400 mr-1.5" />}
                              <span className="text-sm font-medium">{event.league}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div>
                              <span className="text-sm font-medium">{event.team1} vs {event.team2}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-white/40" />
                              <span className="text-sm text-white/70">{event.time}</span>
                            </div>
                          </td>
                          <td className="py-4 px-2 text-center">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-20 bg-white/5 border-white/10 hover:bg-casino-thunder-green hover:text-black transition-colors"
                              onClick={() => {
                                toast.success(`Bet placed on ${event.team1}`);
                              }}
                            >
                              {event.odds.team1}
                            </Button>
                          </td>
                          {event.odds.draw !== undefined && (
                            <td className="py-4 px-2 text-center">
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-20 bg-white/5 border-white/10 hover:bg-casino-thunder-green hover:text-black transition-colors"
                                onClick={() => {
                                  toast.success(`Bet placed on draw`);
                                }}
                              >
                                {event.odds.draw}
                              </Button>
                            </td>
                          )}
                          <td className="py-4 px-2 text-center">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-20 bg-white/5 border-white/10 hover:bg-casino-thunder-green hover:text-black transition-colors"
                              onClick={() => {
                                toast.success(`Bet placed on ${event.team2}`);
                              }}
                            >
                              {event.odds.team2}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {filteredEvents.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-white/60">No events match your search criteria.</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* Featured tab content */}
            <TabsContent value="featured" className="pt-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Star className="mr-2 h-6 w-6 text-yellow-400" />
                Featured Events
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {filteredEvents.filter(e => e.featured).slice(0, 2).map(event => (
                  <div key={event.id} className="bg-gradient-to-br from-casino-thunder-darker to-black/50 rounded-lg p-4 border border-white/10 hover:border-casino-thunder-green/50 transition-all">
                    <div className="flex justify-between mb-2">
                      <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-600/30">
                        <Star className="h-3 w-3 mr-1" /> Featured
                      </Badge>
                      <Badge variant="outline" className="text-white/70">{event.league}</Badge>
                    </div>
                    <h3 className="text-lg font-bold mb-1">{event.team1} vs {event.team2}</h3>
                    <div className="flex items-center mb-3 text-sm text-white/70">
                      <Clock className="h-4 w-4 mr-1" /> {event.time}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      <Button variant="outline" className="bg-white/5" onClick={() => toast.success(`Bet placed on ${event.team1}`)}>
                        {event.team1} <span className="ml-1 text-casino-thunder-green">{event.odds.team1}</span>
                      </Button>
                      
                      {event.odds.draw !== undefined ? (
                        <Button variant="outline" className="bg-white/5" onClick={() => toast.success(`Bet placed on draw`)}>
                          Draw <span className="ml-1 text-casino-thunder-green">{event.odds.draw}</span>
                        </Button>
                      ) : (
                        <div></div>
                      )}
                      
                      <Button variant="outline" className="bg-white/5" onClick={() => toast.success(`Bet placed on ${event.team2}`)}>
                        {event.team2} <span className="ml-1 text-casino-thunder-green">{event.odds.team2}</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="bg-casino-thunder-dark/90 backdrop-blur-md rounded-lg border border-white/10 overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-white/5">
                        <th className="py-3 px-4 text-left font-medium text-white/70">League</th>
                        <th className="py-3 px-4 text-left font-medium text-white/70">Match</th>
                        <th className="py-3 px-4 text-left font-medium text-white/70">Time</th>
                        <th className="py-3 px-4 text-center font-medium text-white/70" colSpan={3}>Odds</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEvents.map((event) => (
                        <tr key={event.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-center">
                              {event.featured && <Star className="h-3 w-3 text-yellow-400 mr-1.5" />}
                              <span className="text-sm font-medium">{event.league}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm font-medium">{event.team1} vs {event.team2}</span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-white/40" />
                              <span className="text-sm text-white/70">{event.time}</span>
                            </div>
                          </td>
                          <td className="py-4 px-2 text-center">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-20 bg-white/5 hover:bg-casino-thunder-green hover:text-black"
                              onClick={() => toast.success(`Bet placed on ${event.team1}`)}
                            >
                              {event.odds.team1}
                            </Button>
                          </td>
                          {event.odds.draw !== undefined && (
                            <td className="py-4 px-2 text-center">
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-20 bg-white/5 hover:bg-casino-thunder-green hover:text-black"
                                onClick={() => toast.success(`Bet placed on draw`)}
                              >
                                {event.odds.draw}
                              </Button>
                            </td>
                          )}
                          <td className="py-4 px-2 text-center">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-20 bg-white/5 hover:bg-casino-thunder-green hover:text-black"
                              onClick={() => toast.success(`Bet placed on ${event.team2}`)}
                            >
                              {event.odds.team2}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
            
            {/* Football tab content */}
            <TabsContent value="football" className="pt-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Flag className="mr-2 h-6 w-6 text-casino-thunder-green" />
                Football
              </h2>
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <Button variant="ghost" className="py-8 flex flex-col items-center justify-center bg-white/5 border border-white/10 hover:bg-casino-thunder-green/20" onClick={() => navigate('/sports/football/premier-league')}>
                    <Trophy className="h-8 w-8 mb-2 text-casino-thunder-green" />
                    <span className="text-lg font-semibold">Premier League</span>
                  </Button>
                  <Button variant="ghost" className="py-8 flex flex-col items-center justify-center bg-white/5 border border-white/10 hover:bg-casino-thunder-green/20" onClick={() => navigate('/sports/football/la-liga')}>
                    <Trophy className="h-8 w-8 mb-2 text-casino-thunder-green" />
                    <span className="text-lg font-semibold">La Liga</span>
                  </Button>
                  <Button variant="ghost" className="py-8 flex flex-col items-center justify-center bg-white/5 border border-white/10 hover:bg-casino-thunder-green/20" onClick={() => navigate('/sports/football/champions-league')}>
                    <Trophy className="h-8 w-8 mb-2 text-casino-thunder-green" />
                    <span className="text-lg font-semibold">Champions League</span>
                  </Button>
                </div>
                
                <div className="flex justify-center">
                  <Button 
                    onClick={() => navigate('/sports/football')} 
                    className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
                  >
                    View All Football Events
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
        
        {/* Bonus Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-10 mb-6"
        >
          <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-lg p-6 border border-white/10">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-4 md:mb-0 md:mr-6">
                <Badge className="mb-2 bg-purple-500/20 text-purple-300 border-purple-500/30">
                  <BadgePercent className="h-3 w-3 mr-1" /> Limited Time
                </Badge>
                <h3 className="text-2xl font-bold mb-2">New User Betting Bonus</h3>
                <p className="text-white/70 max-w-md">
                  Sign up now and get a 100% matched deposit bonus up to $200 plus 50 free spins on selected casino games!
                </p>
              </div>
              <GlowButton 
                className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black px-6 py-3"
                onClick={() => navigate('/register')}
                glowColor="green"
              >
                Claim Now
              </GlowButton>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Sports;
