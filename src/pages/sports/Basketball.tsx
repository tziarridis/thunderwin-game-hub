
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CircleDollarSign, Star, Clock, Trophy, Calendar, ArrowRight, Activity } from "lucide-react";

const BasketballPage = () => {
  const navigate = useNavigate();

  // Mock data for popular matches
  const popularMatches = [
    { id: 1, league: "NBA", home: "Los Angeles Lakers", away: "Boston Celtics", time: "Today, 03:30", homeOdds: 1.9, awayOdds: 2.1, isFeatured: true },
    { id: 2, league: "NBA", home: "Golden State Warriors", away: "Brooklyn Nets", time: "Tomorrow, 02:00", homeOdds: 1.75, awayOdds: 2.35, isFeatured: true },
    { id: 3, league: "Euroleague", home: "Real Madrid", away: "CSKA Moscow", time: "Today, 19:45", homeOdds: 1.65, awayOdds: 2.4, isFeatured: false },
    { id: 4, league: "NBA", home: "Miami Heat", away: "Chicago Bulls", time: "Tomorrow, 01:00", homeOdds: 2.1, awayOdds: 1.85, isFeatured: false },
    { id: 5, league: "Euroleague", home: "Barcelona", away: "Fenerbahce", time: "Saturday, 20:00", homeOdds: 1.55, awayOdds: 2.6, isFeatured: false },
    { id: 6, league: "NBA", home: "Denver Nuggets", away: "Dallas Mavericks", time: "Sunday, 04:30", homeOdds: 1.7, awayOdds: 2.3, isFeatured: false },
  ];

  // Mock data for upcoming tournaments
  const tournaments = [
    { id: 1, name: "NBA Playoffs", teams: 16, matches: 85, startDate: "15 Apr 2025" },
    { id: 2, name: "FIBA Basketball World Cup", teams: 32, matches: 92, startDate: "28 Aug 2025" },
    { id: 3, name: "EuroBasket", teams: 24, matches: 76, startDate: "02 Sep 2025" },
    { id: 4, name: "Basketball Champions League", teams: 32, matches: 152, startDate: "05 Oct 2025" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1546519638-68e109acd27d?q=80&w=1480&auto=format&fit=crop" 
          alt="Basketball court" 
          className="w-full h-[300px] object-cover object-center"
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-center p-8">
          <h1 className="text-4xl font-bold text-white mb-4">Basketball Betting</h1>
          <p className="text-lg text-white/80 max-w-xl mb-6">
            Bet on NBA, Euroleague, and other basketball competitions from around the world. 
            Enjoy competitive odds on all major leagues and tournaments.
          </p>
          <div className="flex gap-4">
            <Button 
              className="bg-casino-thunder-green hover:bg-casino-thunder-green/90 text-black"
              onClick={() => navigate("/sports")}
            >
              Place a Bet
            </Button>
            <Button 
              variant="outline" 
              className="border-white/20 text-white bg-black/30 backdrop-blur-sm hover:bg-white/10"
              onClick={() => navigate("/promotions")}
            >
              View Promotions
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="matches" className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
          <TabsTrigger value="matches">Live & Upcoming</TabsTrigger>
          <TabsTrigger value="tournaments">Tournaments</TabsTrigger>
          <TabsTrigger value="specials">Special Bets</TabsTrigger>
        </TabsList>

        {/* Matches Tab */}
        <TabsContent value="matches" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularMatches.map(match => (
              <Card key={match.id} className={`bg-casino-thunder-darker border-white/10 hover:border-casino-thunder-green/50 transition-all ${match.isFeatured ? 'border-casino-thunder-green/50 shadow-lg shadow-casino-thunder-green/20' : ''}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Activity className="h-4 w-4 mr-2 text-orange-400" />
                      <CardTitle className="text-sm font-medium text-gray-300">{match.league}</CardTitle>
                    </div>
                    {match.isFeatured && (
                      <Badge className="bg-orange-500 text-xs text-black">
                        <Star className="h-3 w-3 mr-1" /> Featured
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="flex items-center text-gray-400">
                    <Clock className="h-3 w-3 mr-1" /> {match.time}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center my-2">
                    <div className="font-medium">{match.home}</div>
                    <div className="text-sm text-gray-400">vs</div>
                    <div className="font-medium text-right">{match.away}</div>
                  </div>
                </CardContent>
                <CardFooter className="border-t border-white/5 pt-3 flex justify-between">
                  <Button variant="outline" className="flex-1 h-10 text-sm bg-white/5 border-white/10 hover:bg-white/10 hover:text-orange-400">
                    {match.homeOdds}
                  </Button>
                  <Button variant="outline" className="flex-1 h-10 text-sm ml-1 bg-white/5 border-white/10 hover:bg-white/10 hover:text-orange-400">
                    {match.awayOdds}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          <div className="flex justify-center mt-8">
            <Button 
              className="bg-white/10 hover:bg-white/20 text-white"
              onClick={() => navigate("/sports")}
            >
              View All Matches
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </TabsContent>

        {/* Tournaments Tab */}
        <TabsContent value="tournaments" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tournaments.map(tournament => (
              <Card key={tournament.id} className="bg-casino-thunder-darker border-white/10 hover:border-orange-400/20 transition-all">
                <CardHeader>
                  <div className="flex items-center">
                    <Trophy className="h-5 w-5 mr-2 text-orange-400" />
                    <CardTitle>{tournament.name}</CardTitle>
                  </div>
                  <CardDescription className="flex items-center text-gray-400">
                    <Calendar className="h-3 w-3 mr-1" /> Starts: {tournament.startDate}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm">
                    <div className="text-gray-400">Teams: <span className="text-white">{tournament.teams}</span></div>
                    <div className="text-gray-400">Matches: <span className="text-white">{tournament.matches}</span></div>
                  </div>
                </CardContent>
                <CardFooter className="border-t border-white/5 pt-3">
                  <Button
                    className="w-full bg-orange-500/80 hover:bg-orange-500 text-black" 
                    onClick={() => navigate("/sports")}
                  >
                    View Tournament Bets
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Special Bets Tab */}
        <TabsContent value="specials" className="space-y-4">
          <Card className="bg-casino-thunder-darker border-white/10">
            <CardHeader>
              <CardTitle className="text-2xl">Basketball Special Bets</CardTitle>
              <CardDescription>More ways to enjoy basketball betting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border border-white/10 rounded-lg p-4 bg-gradient-to-r from-orange-500/10 to-transparent">
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <Star className="h-5 w-5 mr-2 text-orange-400" /> Player Performance
                </h3>
                <p className="text-gray-300 mb-4">Bet on individual player performances including points, rebounds, assists, and more.</p>
                <Button 
                  variant="outline" 
                  className="border-orange-400 text-orange-400 hover:bg-orange-500/10"
                  onClick={() => navigate("/sports")}
                >
                  Explore Markets
                </Button>
              </div>
              
              <div className="border border-white/10 rounded-lg p-4 bg-gradient-to-r from-blue-500/10 to-transparent">
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <Star className="h-5 w-5 mr-2 text-blue-400" /> Quarter & Half Betting
                </h3>
                <p className="text-gray-300 mb-4">Place bets on individual quarters or halves rather than the full game.</p>
                <Button 
                  variant="outline" 
                  className="border-blue-400 text-blue-400 hover:bg-blue-500/10"
                  onClick={() => navigate("/sports")}
                >
                  View Markets
                </Button>
              </div>
              
              <div className="border border-white/10 rounded-lg p-4 bg-gradient-to-r from-purple-500/10 to-transparent">
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <Star className="h-5 w-5 mr-2 text-purple-400" /> Season Specials
                </h3>
                <p className="text-gray-300 mb-4">Long-term bets on season outcomes such as MVP, champions, and record breakers.</p>
                <Button 
                  variant="outline" 
                  className="border-purple-400 text-purple-400 hover:bg-purple-500/10"
                  onClick={() => navigate("/sports")}
                >
                  Season Bets
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-white/10 hover:bg-white/20 text-white"
                onClick={() => navigate("/sports")}
              >
                Explore All Basketball Markets
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BasketballPage;
