
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CircleDollarSign, Star, Clock, Trophy, Calendar, ArrowRight, Activity } from "lucide-react";

const HockeyPage = () => {
  const navigate = useNavigate();

  // Mock data for popular matches
  const popularMatches = [
    { id: 1, league: "NHL", home: "Toronto Maple Leafs", away: "Montreal Canadiens", time: "Today, 00:00", homeOdds: 2.1, drawOdds: 3.8, awayOdds: 2.5, isFeatured: true },
    { id: 2, league: "NHL", home: "Boston Bruins", away: "New York Rangers", time: "Tomorrow, 01:30", homeOdds: 1.85, drawOdds: 4.0, awayOdds: 2.9, isFeatured: true },
    { id: 3, league: "KHL", home: "CSKA Moscow", away: "SKA St. Petersburg", time: "Today, 17:00", homeOdds: 2.3, drawOdds: 3.5, awayOdds: 2.3, isFeatured: false },
    { id: 4, league: "NHL", home: "Edmonton Oilers", away: "Calgary Flames", time: "Tomorrow, 03:00", homeOdds: 2.2, drawOdds: 3.7, awayOdds: 2.4, isFeatured: false },
    { id: 5, league: "SHL", home: "Frölunda HC", away: "Luleå HF", time: "Saturday, 18:30", homeOdds: 2.1, drawOdds: 3.6, awayOdds: 2.5, isFeatured: false },
    { id: 6, league: "NHL", home: "Pittsburgh Penguins", away: "Washington Capitals", time: "Sunday, 23:00", homeOdds: 2.0, drawOdds: 3.9, awayOdds: 2.7, isFeatured: false },
  ];

  // Mock data for upcoming tournaments
  const tournaments = [
    { id: 1, name: "Stanley Cup Playoffs", teams: 16, matches: 105, startDate: "10 Apr 2025" },
    { id: 2, name: "IIHF World Championship", teams: 16, matches: 64, startDate: "02 May 2025" },
    { id: 3, name: "Champions Hockey League", teams: 32, matches: 125, startDate: "04 Sep 2025" },
    { id: 4, name: "Spengler Cup", teams: 6, matches: 15, startDate: "26 Dec 2025" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1580891804432-c7a9a6e4af72?q=80&w=1470&auto=format&fit=crop" 
          alt="Hockey arena" 
          className="w-full h-[300px] object-cover object-center"
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-center p-8">
          <h1 className="text-4xl font-bold text-white mb-4">Hockey Betting</h1>
          <p className="text-lg text-white/80 max-w-xl mb-6">
            Bet on NHL, KHL, and other hockey leagues from around the world. 
            Place pre-match and live bets on your favorite hockey teams and events.
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
          <TabsTrigger value="betting">Betting Guide</TabsTrigger>
        </TabsList>

        {/* Matches Tab */}
        <TabsContent value="matches" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularMatches.map(match => (
              <Card key={match.id} className={`bg-casino-thunder-darker border-white/10 hover:border-blue-400/50 transition-all ${match.isFeatured ? 'border-blue-400/50 shadow-lg shadow-blue-400/20' : ''}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Activity className="h-4 w-4 mr-2 text-blue-400" />
                      <CardTitle className="text-sm font-medium text-gray-300">{match.league}</CardTitle>
                    </div>
                    {match.isFeatured && (
                      <Badge className="bg-blue-500 text-xs text-white">
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
                  <Button variant="outline" className="flex-1 h-10 text-sm bg-white/5 border-white/10 hover:bg-white/10 hover:text-blue-400">
                    {match.homeOdds}
                  </Button>
                  <Button variant="outline" className="flex-1 h-10 text-sm mx-1 bg-white/5 border-white/10 hover:bg-white/10 hover:text-blue-400">
                    {match.drawOdds}
                  </Button>
                  <Button variant="outline" className="flex-1 h-10 text-sm bg-white/5 border-white/10 hover:bg-white/10 hover:text-blue-400">
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
              <Card key={tournament.id} className="bg-casino-thunder-darker border-white/10 hover:border-blue-400/20 transition-all">
                <CardHeader>
                  <div className="flex items-center">
                    <Trophy className="h-5 w-5 mr-2 text-blue-400" />
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
                    className="w-full bg-blue-600/80 hover:bg-blue-600 text-white" 
                    onClick={() => navigate("/sports")}
                  >
                    View Tournament Bets
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Betting Guide Tab */}
        <TabsContent value="betting" className="space-y-4">
          <Card className="bg-casino-thunder-darker border-white/10">
            <CardHeader>
              <CardTitle className="text-2xl">Hockey Betting Guide</CardTitle>
              <CardDescription>Learn how to bet on hockey and improve your chances of winning</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border border-white/10 rounded-lg p-4 bg-gradient-to-r from-blue-600/10 to-transparent">
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <Star className="h-5 w-5 mr-2 text-blue-400" /> Moneyline Betting
                </h3>
                <p className="text-gray-300 mb-4">The simplest form of hockey betting is picking which team will win the game outright.</p>
                <Button 
                  variant="outline" 
                  className="border-blue-400 text-blue-400 hover:bg-blue-600/10"
                  onClick={() => navigate("/sports")}
                >
                  Learn More
                </Button>
              </div>
              
              <div className="border border-white/10 rounded-lg p-4 bg-gradient-to-r from-purple-500/10 to-transparent">
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <Star className="h-5 w-5 mr-2 text-purple-400" /> Puck Line
                </h3>
                <p className="text-gray-300 mb-4">Similar to point spread betting in other sports, the puck line in hockey is typically set at +/- 1.5 goals.</p>
                <Button 
                  variant="outline" 
                  className="border-purple-400 text-purple-400 hover:bg-purple-500/10"
                  onClick={() => navigate("/sports")}
                >
                  Read Guide
                </Button>
              </div>
              
              <div className="border border-white/10 rounded-lg p-4 bg-gradient-to-r from-red-500/10 to-transparent">
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <Star className="h-5 w-5 mr-2 text-red-400" /> Totals (Over/Under)
                </h3>
                <p className="text-gray-300 mb-4">Bet on whether the total number of goals scored in a game will be over or under a specified number.</p>
                <Button 
                  variant="outline" 
                  className="border-red-400 text-red-400 hover:bg-red-500/10"
                  onClick={() => navigate("/sports")}
                >
                  Learn Strategies
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-white/10 hover:bg-white/20 text-white"
                onClick={() => navigate("/support/help")}
              >
                View Complete Betting Guide
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HockeyPage;
