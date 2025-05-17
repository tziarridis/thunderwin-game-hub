
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGames } from '@/hooks/useGames';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const FeaturedGames = () => {
  const { games, isLoading } = useGames();
  const navigate = useNavigate();

  // Get featured games (either marked as featured or popular)
  const featuredGames = React.useMemo(() => {
    return games
      .filter(game => game.is_featured || game.isPopular)
      .slice(0, 6);
  }, [games]);

  const handleGameClick = (gameId: string) => {
    navigate(`/casino/game/${gameId}`);
  };

  return (
    <section className="py-16 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white">Featured Games</h2>
          <Button variant="outline" onClick={() => navigate('/casino/main')}>
            View All Games
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="bg-gray-800 border-gray-700">
                <Skeleton className="h-48 rounded-t-lg" />
                <CardContent className="p-4">
                  <Skeleton className="h-5 w-2/3 mb-2" />
                  <Skeleton className="h-4 w-1/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : featuredGames.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No featured games available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
            {featuredGames.map(game => (
              <Card 
                key={game.id} 
                className="group bg-gray-800 border-gray-700 overflow-hidden rounded-lg transition-all hover:shadow-lg hover:shadow-blue-500/20"
              >
                <div className="relative">
                  <img 
                    src={game.image || '/placeholder.svg'} 
                    alt={game.title || 'Casino Game'} 
                    className="w-full h-48 object-cover transition-transform group-hover:scale-105"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg'; 
                    }}
                  />
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button 
                      className="bg-blue-600 hover:bg-blue-500"
                      onClick={() => handleGameClick(game.id)}
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Play Now
                    </Button>
                  </div>
                  
                  {/* Tags */}
                  {game.isPopular && (
                    <div className="absolute top-2 left-2">
                      <span className="bg-yellow-500 text-black text-xs px-2 py-1 rounded-sm font-medium flex items-center">
                        <Star className="h-3 w-3 mr-1" /> Popular
                      </span>
                    </div>
                  )}
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-semibold text-white mb-1 truncate">{game.title}</h3>
                  <p className="text-gray-400 text-sm">{game.provider}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedGames;
