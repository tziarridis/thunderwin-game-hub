
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useGames } from '@/hooks/useGames';
import { useAuth } from '@/contexts/AuthContext';
import LaunchGame from '@/components/casino/LaunchGame';
import { Game } from '@/types';

const HomePage = () => {
  const { games, loading, error } = useGames({ limit: 6, featured: true });
  const [featuredGame, setFeaturedGame] = useState<Game | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Set a featured game from the loaded games
    if (games.length > 0) {
      setFeaturedGame(games[0]);
    }
  }, [games]);

  return (
    <div className="space-y-10 py-6">
      {/* Hero Section */}
      <section className="relative w-full">
        <div className="bg-gradient-to-r from-casino-thunder-dark to-black rounded-lg overflow-hidden">
          <div className="container mx-auto px-4 py-16 flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold">
                Experience the Thrill of <span className="text-casino-thunder-green">Online Casino</span>
              </h1>
              <p className="text-lg">
                Play the most exciting casino games with amazing bonuses and secure payouts
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black">
                  Play Now
                </Button>
                {!isAuthenticated && (
                  <Button variant="outline" size="lg">
                    Sign Up
                  </Button>
                )}
              </div>
            </div>
            <div className="md:w-1/2 mt-8 md:mt-0">
              {featuredGame && (
                <div className="relative rounded-lg overflow-hidden">
                  <img 
                    src={featuredGame.image || 'https://via.placeholder.com/500x300'} 
                    alt={featuredGame.title} 
                    className="w-full object-cover h-64 rounded-lg"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                    <h3 className="text-xl font-bold mb-2">{featuredGame.title}</h3>
                    <LaunchGame game={featuredGame} buttonText="Play Now" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Popular Games */}
      <section className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6">Popular Games</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <Card key={i} className="bg-casino-thunder-dark border-casino-thunder-green/40">
                <CardContent className="p-0">
                  <div className="h-40 bg-gray-800 animate-pulse"></div>
                </CardContent>
                <CardFooter className="p-4">
                  <div className="w-full space-y-2">
                    <div className="h-4 bg-gray-800 animate-pulse rounded"></div>
                    <div className="h-8 bg-gray-800 animate-pulse rounded"></div>
                  </div>
                </CardFooter>
              </Card>
            ))
          ) : error ? (
            <div className="col-span-full">
              <Card className="bg-red-900/20 border-red-900">
                <CardContent className="p-4">
                  <p>Failed to load games. Please try refreshing.</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            games.map(game => (
              <Card key={game.id} className="bg-casino-thunder-dark border-casino-thunder-green/40 overflow-hidden">
                <div className="relative">
                  <img 
                    src={game.image || 'https://via.placeholder.com/300x200'} 
                    alt={game.title} 
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-casino-thunder-green text-xs text-black px-2 py-1 rounded">
                    {game.provider}
                  </div>
                </div>
                <CardFooter className="p-4 flex flex-col items-start space-y-2">
                  <h3 className="font-semibold">{game.title}</h3>
                  <LaunchGame 
                    game={game} 
                    buttonText="Play Now" 
                    variant="default"
                    className="w-full"
                  />
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </section>

      {/* Features */}
      <section className="bg-casino-thunder-dark py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-black/50 border-casino-thunder-green/20">
              <CardHeader>
                <CardTitle>Secure Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Your funds are always safe with our secure payment systems and transparent transactions.</p>
              </CardContent>
            </Card>
            <Card className="bg-black/50 border-casino-thunder-green/20">
              <CardHeader>
                <CardTitle>24/7 Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Our dedicated support team is available around the clock to assist you with any questions.</p>
              </CardContent>
            </Card>
            <Card className="bg-black/50 border-casino-thunder-green/20">
              <CardHeader>
                <CardTitle>Fair Games</CardTitle>
              </CardHeader>
              <CardContent>
                <p>All our games are certified fair, ensuring an equal chance of winning for all players.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
