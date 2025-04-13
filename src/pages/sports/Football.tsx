
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dribbble, Star, Clock, Trophy, Calendar, ArrowRight } from "lucide-react";

const FootballPage = () => {
  const navigate = useNavigate();

  // Mock data for popular matches
  const popularMatches = [
    { id: 1, league: "Premier League", home: "Manchester United", away: "Liverpool", time: "Today, 20:45", homeOdds: 2.5, drawOdds: 3.2, awayOdds: 2.8, isFeatured: true },
    { id: 2, league: "La Liga", home: "Barcelona", away: "Real Madrid", time: "Tomorrow, 21:00", homeOdds: 1.9, drawOdds: 3.5, awayOdds: 3.7, isFeatured: true },
    { id: 3, league: "Serie A", home: "Juventus", away: "Inter Milan", time: "Today, 18:30", homeOdds: 2.2, drawOdds: 3.1, awayOdds: 3.3, isFeatured: false },
    { id: 4, league: "Bundesliga", home: "Bayern Munich", away: "Borussia Dortmund", time: "Tomorrow, 19:30", homeOdds: 1.7, drawOdds: 3.8, awayOdds: 4.2, isFeatured: false },
    { id: 5, league: "Ligue 1", home: "PSG", away: "Marseille", time: "Saturday, 20:00", homeOdds: 1.5, drawOdds: 4.2, awayOdds: 5.5, isFeatured: false },
    { id: 6, league: "Premier League", home: "Arsenal", away: "Chelsea", time: "Sunday, 17:30", homeOdds: 2.3, drawOdds: 3.3, awayOdds: 3.1, isFeatured: false },
  ];

  // Mock data for upcoming tournaments
  const tournaments = [
    { id: 1, name: "UEFA Champions League", teams: 32, matches: 125, startDate: "15 Sep 2025" },
    { id: 2, name: "FIFA World Cup", teams: 48, matches: 104, startDate: "10 Jun 2026" },
    { id: 3, name: "UEFA Europa League", teams: 32, matches: 141, startDate: "18 Sep 2025" },
    { id: 4, name: "Copa America", teams: 16, matches: 38, startDate: "20 Jun 2025" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1508098682722-e99c643e7f66?q=80&w=1470&auto=format&fit=crop" 
          alt="Football stadium" 
          className="w-full h-[300px] object-cover object-center"
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-center p-8">
          <h1 className="text-4xl font-bold text-white mb-4">Football Betting</h1>
          <p className="text-lg text-white/80 max-w-xl mb-6">
            Get the best odds on football matches from leagues around the world. 
            From Premier League to Champions League, we've got you covered.
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
          <TabsTrigger value="promotions">Promotions</TabsTrigger>
        </TabsList>

        {/* Matches Tab */}
        <TabsContent value="matches" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularMatches.map(match => (
              <Card key={match.id} className={`bg-casino-thunder-darker border-white/10 hover:border-casino-thunder-green/50 transition-all ${match.isFeatured ? 'border-casino-thunder-green/50 shadow-lg shadow-casino-thunder-green/20' : ''}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Dribbble className="h-4 w-4 mr-2 text-casino-thunder-green" />
                      <CardTitle className="text-sm font-medium text-gray-300">{match.league}</CardTitle>
                    </div>
                    {match.isFeatured && (
                      <Badge className="bg-casino-thunder-green text-xs text-black">
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
                  <Button variant="outline" className="flex-1 h-10 text-sm bg-white/5 border-white/10 hover:bg-white/10 hover:text-casino-thunder-green">
                    {match.homeOdds}
                  </Button>
                  <Button variant="outline" className="flex-1 h-10 text-sm mx-1 bg-white/5 border-white/10 hover:bg-white/10 hover:text-casino-thunder-green">
                    {match.drawOdds}
                  </Button>
                  <Button variant="outline" className="flex-1 h-10 text-sm bg-white/5 border-white/10 hover:bg-white/10 hover:text-casino-thunder-green">
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
              <Card key={tournament.id} className="bg-casino-thunder-darker border-white/10 hover:border-casino-thunder-green/50 transition-all">
                <CardHeader>
                  <div className="flex items-center">
                    <Trophy className="h-5 w-5 mr-2 text-casino-thunder-green" />
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
                    className="w-full bg-casino-thunder-green/80 hover:bg-casino-thunder-green text-black" 
                    onClick={() => navigate("/sports")}
                  >
                    View Tournament Bets
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Promotions Tab */}
        <TabsContent value="promotions" className="space-y-4">
          <Card className="bg-casino-thunder-darker border-white/10">
            <CardHeader>
              <CardTitle className="text-2xl">Football Special Offers</CardTitle>
              <CardDescription>Take advantage of our exclusive football betting promotions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border border-white/10 rounded-lg p-4 bg-gradient-to-r from-casino-thunder-green/10 to-transparent">
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <Star className="h-5 w-5 mr-2 text-yellow-500" /> Accumulator Boost
                </h3>
                <p className="text-gray-300 mb-4">Get up to 50% extra on your winning accumulators! The more selections you add, the bigger the boost.</p>
                <Button 
                  variant="outline" 
                  className="border-casino-thunder-green text-casino-thunder-green hover:bg-casino-thunder-green/10"
                  onClick={() => navigate("/promotions")}
                >
                  Claim Offer
                </Button>
              </div>
              
              <div className="border border-white/10 rounded-lg p-4 bg-gradient-to-r from-purple-500/10 to-transparent">
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <Star className="h-5 w-5 mr-2 text-purple-400" /> Early Payout
                </h3>
                <p className="text-gray-300 mb-4">If your team goes 2 goals ahead, we'll pay out your bet as a winner - regardless of the final result!</p>
                <Button 
                  variant="outline" 
                  className="border-purple-400 text-purple-400 hover:bg-purple-500/10"
                  onClick={() => navigate("/promotions")}
                >
                  Learn More
                </Button>
              </div>
              
              <div className="border border-white/10 rounded-lg p-4 bg-gradient-to-r from-blue-500/10 to-transparent">
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <Star className="h-5 w-5 mr-2 text-blue-400" /> Money Back
                </h3>
                <p className="text-gray-300 mb-4">Money back as a free bet if your first goalscorer bet loses but the player scores later in the match.</p>
                <Button 
                  variant="outline" 
                  className="border-blue-400 text-blue-400 hover:bg-blue-500/10"
                  onClick={() => navigate("/promotions")}
                >
                  Get Offer
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-white/10 hover:bg-white/20 text-white"
                onClick={() => navigate("/promotions")}
              >
                View All Football Promotions
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FootballPage;
