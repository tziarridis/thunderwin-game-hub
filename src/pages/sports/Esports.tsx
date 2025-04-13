
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Monitor, Star, Clock, Trophy, Calendar, ArrowRight, Gamepad2, Zap } from "lucide-react";

const EsportsPage = () => {
  const navigate = useNavigate();

  // Mock data for popular matches
  const popularMatches = [
    { id: 1, game: "CS:GO", team1: "Natus Vincere", team2: "FaZe Clan", time: "Today, 18:00", team1Odds: 1.85, team2Odds: 2.0, isFeatured: true },
    { id: 2, game: "League of Legends", team1: "T1", team2: "G2 Esports", time: "Tomorrow, 15:30", team1Odds: 1.7, team2Odds: 2.25, isFeatured: true },
    { id: 3, game: "Dota 2", team1: "Team Secret", team2: "OG", time: "Today, 20:00", team1Odds: 1.9, team2Odds: 1.95, isFeatured: false },
    { id: 4, game: "Valorant", team1: "Sentinels", team2: "Team Liquid", time: "Tomorrow, 19:00", team1Odds: 2.1, team2Odds: 1.8, isFeatured: false },
    { id: 5, game: "Overwatch", team1: "San Francisco Shock", team2: "Shanghai Dragons", time: "Saturday, 22:30", team1Odds: 1.95, team2Odds: 1.9, isFeatured: false },
    { id: 6, game: "Rainbow Six Siege", team1: "Spacestation Gaming", team2: "Team BDS", time: "Sunday, 17:00", team1Odds: 1.85, team2Odds: 2.0, isFeatured: false },
  ];

  // Mock data for upcoming tournaments
  const tournaments = [
    { id: 1, name: "The International", game: "Dota 2", teams: 18, prizePool: "$40 million", startDate: "15 Aug 2025" },
    { id: 2, name: "League of Legends World Championship", game: "LoL", teams: 24, prizePool: "$2.5 million", startDate: "25 Sep 2025" },
    { id: 3, name: "CS:GO Major", game: "CS:GO", teams: 24, prizePool: "$2 million", startDate: "12 Oct 2025" },
    { id: 4, name: "Valorant Champions", game: "Valorant", teams: 16, prizePool: "$1 million", startDate: "05 Aug 2025" },
  ];

  // Mock data for popular games - Fixed the syntax errors by using string values instead of the "+" operator
  const popularGames = [
    { id: 1, name: "Counter-Strike: Global Offensive", activeEvents: 28, markets: "150+" },
    { id: 2, name: "League of Legends", activeEvents: 32, markets: "120+" },
    { id: 3, name: "Dota 2", activeEvents: 24, markets: "140+" },
    { id: 4, name: "Valorant", activeEvents: 22, markets: "90+" },
    { id: 5, name: "Overwatch", activeEvents: 18, markets: "75+" },
    { id: 6, name: "Rainbow Six Siege", activeEvents: 16, markets: "60+" },
    { id: 7, name: "Rocket League", activeEvents: 12, markets: "50+" },
    { id: 8, name: "FIFA", activeEvents: 20, markets: "85+" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1470&auto=format&fit=crop" 
          alt="Esports arena" 
          className="w-full h-[300px] object-cover object-center"
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-center p-8">
          <h1 className="text-4xl font-bold text-white mb-4">Esports Betting</h1>
          <p className="text-lg text-white/80 max-w-xl mb-6">
            Bet on popular esports competitions including CS:GO, Dota 2, League of Legends, and more. 
            Follow your favorite teams and place bets on matches and tournaments.
          </p>
          <div className="flex gap-4">
            <Button 
              className="bg-purple-600 hover:bg-purple-700 text-white"
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
          <TabsTrigger value="games">Esports Games</TabsTrigger>
        </TabsList>

        {/* Matches Tab */}
        <TabsContent value="matches" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularMatches.map(match => (
              <Card key={match.id} className={`bg-casino-thunder-darker border-white/10 hover:border-purple-400/50 transition-all ${match.isFeatured ? 'border-purple-400/50 shadow-lg shadow-purple-400/20' : ''}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Gamepad2 className="h-4 w-4 mr-2 text-purple-400" />
                      <CardTitle className="text-sm font-medium text-gray-300">{match.game}</CardTitle>
                    </div>
                    {match.isFeatured && (
                      <Badge className="bg-purple-600 text-xs text-white">
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
                    <div className="font-medium">{match.team1}</div>
                    <div className="text-sm text-gray-400">vs</div>
                    <div className="font-medium text-right">{match.team2}</div>
                  </div>
                </CardContent>
                <CardFooter className="border-t border-white/5 pt-3 flex justify-between">
                  <Button variant="outline" className="flex-1 h-10 text-sm bg-white/5 border-white/10 hover:bg-white/10 hover:text-purple-400">
                    {match.team1Odds}
                  </Button>
                  <Button variant="outline" className="flex-1 h-10 text-sm ml-1 bg-white/5 border-white/10 hover:bg-white/10 hover:text-purple-400">
                    {match.team2Odds}
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
              <Card key={tournament.id} className="bg-casino-thunder-darker border-white/10 hover:border-purple-400/20 transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Trophy className="h-5 w-5 mr-2 text-purple-400" />
                      <CardTitle>{tournament.name}</CardTitle>
                    </div>
                    <Badge className="bg-white/10 text-xs text-white">
                      {tournament.game}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center text-gray-400">
                    <Calendar className="h-3 w-3 mr-1" /> Starts: {tournament.startDate}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm">
                    <div className="text-gray-400">Teams: <span className="text-white">{tournament.teams}</span></div>
                    <div className="text-gray-400">Prize Pool: <span className="text-white">{tournament.prizePool}</span></div>
                  </div>
                </CardContent>
                <CardFooter className="border-t border-white/5 pt-3">
                  <Button
                    className="w-full bg-purple-600/80 hover:bg-purple-600 text-white" 
                    onClick={() => navigate("/sports")}
                  >
                    View Tournament Bets
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Games Tab */}
        <TabsContent value="games" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularGames.map(game => (
              <Card key={game.id} className="bg-casino-thunder-darker border-white/10 hover:border-purple-400/20 transition-all">
                <CardHeader className="pb-2">
                  <div className="flex items-center">
                    <Zap className="h-4 w-4 mr-2 text-purple-400" />
                    <CardTitle className="text-sm font-medium">{game.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Active Events:</span>
                      <span className="text-white font-medium">{game.activeEvents}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Betting Markets:</span>
                      <span className="text-white font-medium">{game.markets}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t border-white/5 pt-3">
                  <Button
                    variant="outline"
                    className="w-full border-purple-400/30 text-purple-400 hover:bg-purple-400/10" 
                    onClick={() => navigate("/sports")}
                  >
                    View Markets
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          <Card className="mt-8 bg-casino-thunder-darker border-white/10">
            <CardHeader>
              <CardTitle className="text-xl">Live Streaming</CardTitle>
              <CardDescription>Watch live esports matches while you bet</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                Our platform offers live streaming for selected esports matches. Watch the action unfold in real-time while placing in-play bets.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-white/10 rounded-lg p-4 bg-gradient-to-r from-purple-600/10 to-transparent">
                  <h3 className="text-lg font-medium mb-2 flex items-center">
                    <Monitor className="h-5 w-5 mr-2 text-purple-400" /> HD Streaming
                  </h3>
                  <p className="text-gray-400 text-sm">High-quality, low-latency streams for the best viewing experience.</p>
                </div>
                <div className="border border-white/10 rounded-lg p-4 bg-gradient-to-r from-blue-500/10 to-transparent">
                  <h3 className="text-lg font-medium mb-2 flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-blue-400" /> Live Stats
                  </h3>
                  <p className="text-gray-400 text-sm">Real-time statistics to help inform your betting decisions.</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                onClick={() => navigate("/sports")}
              >
                View Live Streams
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EsportsPage;
