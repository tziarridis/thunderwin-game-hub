
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CircleDollarSign, Star, Clock, Trophy, Calendar, ArrowRight, Activity } from "lucide-react";

const TennisPage = () => {
  const navigate = useNavigate();

  // Mock data for popular matches
  const popularMatches = [
    { id: 1, tournament: "Wimbledon", player1: "Novak Djokovic", player2: "Carlos Alcaraz", time: "Today, 14:00", player1Odds: 1.85, player2Odds: 2.0, isFeatured: true },
    { id: 2, tournament: "French Open", player1: "Rafael Nadal", player2: "Daniil Medvedev", time: "Tomorrow, 12:30", player1Odds: 1.7, player2Odds: 2.25, isFeatured: true },
    { id: 3, tournament: "US Open", player1: "Iga Swiatek", player2: "Aryna Sabalenka", time: "Today, 18:00", player1Odds: 1.9, player2Odds: 1.95, isFeatured: false },
    { id: 4, tournament: "Australian Open", player1: "Coco Gauff", player2: "Naomi Osaka", time: "Tomorrow, 10:00", player1Odds: 2.1, player2Odds: 1.8, isFeatured: false },
    { id: 5, tournament: "ATP Masters", player1: "Alexander Zverev", player2: "Stefanos Tsitsipas", time: "Saturday, 16:30", player1Odds: 1.95, player2Odds: 1.9, isFeatured: false },
    { id: 6, tournament: "WTA Finals", player1: "Elena Rybakina", player2: "Jessica Pegula", time: "Sunday, 19:00", player1Odds: 1.85, player2Odds: 2.0, isFeatured: false },
  ];

  // Mock data for upcoming tournaments
  const tournaments = [
    { id: 1, name: "Wimbledon", players: 128, matches: 254, startDate: "28 Jun 2025", type: "Grand Slam" },
    { id: 2, name: "US Open", players: 128, matches: 254, startDate: "24 Aug 2025", type: "Grand Slam" },
    { id: 3, name: "ATP Finals", players: 8, matches: 15, startDate: "10 Nov 2025", type: "Championship" },
    { id: 4, name: "WTA Finals", players: 8, matches: 15, startDate: "01 Nov 2025", type: "Championship" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1622279457486-28f70f4118e5?q=80&w=1470&auto=format&fit=crop" 
          alt="Tennis court" 
          className="w-full h-[300px] object-cover object-center"
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-center p-8">
          <h1 className="text-4xl font-bold text-white mb-4">Tennis Betting</h1>
          <p className="text-lg text-white/80 max-w-xl mb-6">
            Bet on tennis tournaments including Grand Slams, ATP and WTA tours. 
            Place bets on match winners, set scores, and more.
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
          <TabsTrigger value="stats">Player Stats</TabsTrigger>
        </TabsList>

        {/* Matches Tab */}
        <TabsContent value="matches" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularMatches.map(match => (
              <Card key={match.id} className={`bg-casino-thunder-darker border-white/10 hover:border-green-400/50 transition-all ${match.isFeatured ? 'border-green-400/50 shadow-lg shadow-green-400/10' : ''}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Activity className="h-4 w-4 mr-2 text-green-400" />
                      <CardTitle className="text-sm font-medium text-gray-300">{match.tournament}</CardTitle>
                    </div>
                    {match.isFeatured && (
                      <Badge className="bg-green-600 text-xs text-white">
                        <Star className="h-3 w-3 mr-1" /> Featured
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="flex items-center text-gray-400">
                    <Clock className="h-3 w-3 mr-1" /> {match.time}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-1 my-2">
                    <div className="font-medium">{match.player1}</div>
                    <div className="text-sm text-gray-400">vs</div>
                    <div className="font-medium">{match.player2}</div>
                  </div>
                </CardContent>
                <CardFooter className="border-t border-white/5 pt-3 flex justify-between">
                  <Button variant="outline" className="flex-1 h-10 text-sm bg-white/5 border-white/10 hover:bg-white/10 hover:text-green-400">
                    {match.player1Odds}
                  </Button>
                  <Button variant="outline" className="flex-1 h-10 text-sm ml-1 bg-white/5 border-white/10 hover:bg-white/10 hover:text-green-400">
                    {match.player2Odds}
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
              <Card key={tournament.id} className="bg-casino-thunder-darker border-white/10 hover:border-green-400/20 transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Trophy className="h-5 w-5 mr-2 text-green-400" />
                      <CardTitle>{tournament.name}</CardTitle>
                    </div>
                    <Badge className="bg-white/10 text-xs text-white">
                      {tournament.type}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center text-gray-400">
                    <Calendar className="h-3 w-3 mr-1" /> Starts: {tournament.startDate}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm">
                    <div className="text-gray-400">Players: <span className="text-white">{tournament.players}</span></div>
                    <div className="text-gray-400">Matches: <span className="text-white">{tournament.matches}</span></div>
                  </div>
                </CardContent>
                <CardFooter className="border-t border-white/5 pt-3">
                  <Button
                    className="w-full bg-green-600/80 hover:bg-green-600 text-white" 
                    onClick={() => navigate("/sports")}
                  >
                    View Tournament Bets
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Player Stats Tab */}
        <TabsContent value="stats" className="space-y-4">
          <Card className="bg-casino-thunder-darker border-white/10">
            <CardHeader>
              <CardTitle className="text-2xl">Player Performance Stats</CardTitle>
              <CardDescription>Use player statistics to make more informed betting decisions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border border-white/10 rounded-lg p-4 bg-gradient-to-r from-green-600/10 to-transparent">
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <Star className="h-5 w-5 mr-2 text-green-400" /> Form Guide
                </h3>
                <p className="text-gray-300 mb-4">View recent form and head-to-head statistics for upcoming matches.</p>
                <Button 
                  variant="outline" 
                  className="border-green-400 text-green-400 hover:bg-green-600/10"
                  onClick={() => navigate("/sports")}
                >
                  View Stats
                </Button>
              </div>
              
              <div className="border border-white/10 rounded-lg p-4 bg-gradient-to-r from-blue-500/10 to-transparent">
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <Star className="h-5 w-5 mr-2 text-blue-400" /> Surface Performance
                </h3>
                <p className="text-gray-300 mb-4">Check player performance on different court surfaces (clay, grass, hard court).</p>
                <Button 
                  variant="outline" 
                  className="border-blue-400 text-blue-400 hover:bg-blue-500/10"
                  onClick={() => navigate("/sports")}
                >
                  Compare Players
                </Button>
              </div>
              
              <div className="border border-white/10 rounded-lg p-4 bg-gradient-to-r from-yellow-500/10 to-transparent">
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <Star className="h-5 w-5 mr-2 text-yellow-400" /> Tournament History
                </h3>
                <p className="text-gray-300 mb-4">Review players' historical performance at specific tournaments.</p>
                <Button 
                  variant="outline" 
                  className="border-yellow-400 text-yellow-400 hover:bg-yellow-500/10"
                  onClick={() => navigate("/sports")}
                >
                  View History
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-white/10 hover:bg-white/20 text-white"
                onClick={() => navigate("/sports")}
              >
                Access Advanced Stats
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TennisPage;
