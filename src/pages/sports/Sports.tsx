
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Search, Calendar, Clock, Users, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import GlowButton from "@/components/casino/GlowButton";
import { toast } from "sonner";

// Mock data for configurable banners from backend
const banners = [
  {
    id: 5,
    title: "Sports Betting Bonus",
    description: "Get a free bet up to $50 on your first sports wager",
    imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c643e7f0b",
    ctaText: "Bet Now",
    ctaUrl: "/sports",
    backgroundColor: "from-blue-800 to-purple-900",
    textColor: "text-white"
  },
  {
    id: 6,
    title: "Premier League Special",
    description: "Enhanced odds on this weekend's top matches",
    imageUrl: "https://images.unsplash.com/photo-1522778526097-ce0a22ceb253",
    ctaText: "View Odds",
    ctaUrl: "/sports/football",
    backgroundColor: "from-green-800 to-blue-900",
    textColor: "text-white"
  }
];

const Sports = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [showSportsSection, setShowSportsSection] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    console.log("Sports component mounted");
    
    // Check if sports section should be hidden from localStorage
    const interfaceSettings = localStorage.getItem("backoffice_interface_settings");
    if (interfaceSettings) {
      try {
        const settings = JSON.parse(interfaceSettings);
        if (settings.showSportsSection === false) {
          // Instead of redirecting, we'll just show a message
          setShowSportsSection(false);
          toast.error("Sports section is temporarily unavailable");
        }
      } catch (error) {
        console.error("Error parsing interface settings:", error);
      }
    }
    
    // Simulate loading state
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  // Placeholder data for popular events
  const popularEvents = [
    { id: 1, league: "Premier League", team1: "Arsenal", team2: "Liverpool", time: "Today, 19:45", odds: { team1: 2.1, draw: 3.4, team2: 3.5 } },
    { id: 2, league: "La Liga", team1: "Barcelona", team2: "Real Madrid", time: "Tomorrow, 20:00", odds: { team1: 1.9, draw: 3.6, team2: 3.8 } },
    { id: 3, league: "Bundesliga", team1: "Bayern Munich", team2: "Dortmund", time: "Today, 17:30", odds: { team1: 1.65, draw: 4.0, team2: 4.5 } },
    { id: 4, league: "Serie A", team1: "Juventus", team2: "Inter Milan", time: "Tomorrow, 14:00", odds: { team1: 2.3, draw: 3.2, team2: 2.9 } },
    { id: 5, league: "NBA", team1: "Lakers", team2: "Celtics", time: "Today, 02:00", odds: { team1: 1.85, team2: 1.95 } },
    { id: 6, league: "NHL", team1: "Maple Leafs", team2: "Canadiens", time: "Tomorrow, 01:30", odds: { team1: 2.25, team2: 1.65 } },
  ];

  // Filter events based on search
  const filteredEvents = popularEvents.filter(event => 
    event.team1.toLowerCase().includes(searchTerm.toLowerCase()) || 
    event.team2.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.league.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTabClick = (value: string) => {
    console.log(`Tab clicked: ${value}`);
    // Navigate to appropriate sports page based on tab value
    if (value !== "all" && value !== "live" && value !== "upcoming") {
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
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Sports Betting</h1>
          <p className="text-white/70 max-w-2xl mx-auto">
            Bet on a wide range of sports events with competitive odds and exciting promotions.
          </p>
        </div>
        
        {/* Configurable Banners Section */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {banners.map(banner => (
              <div
                key={banner.id}
                className={`rounded-lg overflow-hidden relative h-60 bg-gradient-to-r ${banner.backgroundColor}`}
              >
                <div className="absolute inset-0 opacity-60 bg-black">
                  <img 
                    src={banner.imageUrl} 
                    alt={banner.title} 
                    className="w-full h-full object-cover mix-blend-overlay"
                  />
                </div>
                <div className="absolute inset-0 flex flex-col justify-center p-8 z-10">
                  <h3 className={`text-2xl font-bold mb-2 ${banner.textColor}`}>
                    {banner.title}
                  </h3>
                  <p className={`${banner.textColor} mb-4 opacity-80 max-w-md`}>
                    {banner.description}
                  </p>
                  <div>
                    <GlowButton 
                      className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
                      onClick={() => navigate(banner.ctaUrl)}
                      glowColor="green"
                    >
                      {banner.ctaText}
                    </GlowButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Search and Filters */}
        <div className="mb-8">
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
          
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full flex overflow-x-auto py-2 justify-start bg-white/5 backdrop-blur-md">
              <TabsTrigger value="all">All Sports</TabsTrigger>
              <TabsTrigger value="football" onClick={() => handleTabClick('football')}>Football</TabsTrigger>
              <TabsTrigger value="basketball" onClick={() => handleTabClick('basketball')}>Basketball</TabsTrigger>
              <TabsTrigger value="tennis" onClick={() => handleTabClick('tennis')}>Tennis</TabsTrigger>
              <TabsTrigger value="hockey" onClick={() => handleTabClick('hockey')}>Hockey</TabsTrigger>
              <TabsTrigger value="esports" onClick={() => handleTabClick('esports')}>Esports</TabsTrigger>
              <TabsTrigger value="live">Live Now</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
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
                        <tr key={event.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-center">
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
            
            {/* Other tabs would have similar content structure */}
            <TabsContent value="football" className="pt-6">
              <h2 className="text-2xl font-bold mb-6">Football</h2>
              <p className="text-white/70 mb-4">Popular football matches from around the world.</p>
              
              <Button 
                onClick={() => navigate('/sports/football')} 
                className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
              >
                View All Football Events
              </Button>
            </TabsContent>
            
            {/* For brevity, not implementing all tab contents */}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Sports;
