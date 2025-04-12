
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { gamesApi } from "@/services/apiService";
import { GameProvider, Game } from "@/types";
import { Card } from "@/components/ui/card";
import { BadgeCheck, Search, SlidersHorizontal, Trophy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

const ProvidersPage = () => {
  const [providers, setProviders] = useState<GameProvider[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const gamesData = await gamesApi.getGames();
        setGames(gamesData);
        
        // Extract unique providers from games
        const uniqueProviders = extractProvidersFromGames(gamesData);
        setProviders(uniqueProviders);
      } catch (error) {
        console.error("Error fetching providers data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const extractProvidersFromGames = (games: Game[]): GameProvider[] => {
    const providersMap = new Map<string, { count: number, games: Game[] }>();
    
    // Count games by provider
    games.forEach(game => {
      if (!providersMap.has(game.provider)) {
        providersMap.set(game.provider, { count: 0, games: [] });
      }
      const providerData = providersMap.get(game.provider);
      if (providerData) {
        providerData.count++;
        providerData.games.push(game);
      }
    });
    
    // Convert to GameProvider array
    return Array.from(providersMap.entries()).map(([name, data]) => ({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      logo: `/lovable-uploads/placeholder.svg`, // Placeholder for logo
      gamesCount: data.count,
      isActive: true
    }));
  };
  
  const filteredProviders = providers.filter(provider => 
    provider.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const getProviderGames = (providerName: string) => {
    return games.filter(game => game.provider === providerName);
  };
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            Game Providers
            <BadgeCheck className="ml-2 text-casino-thunder-green" size={24} />
          </h1>
          <p className="text-white/70">
            Browse games from the world's top gaming providers
          </p>
        </div>
        <div className="mt-4 md:mt-0 relative w-full md:w-auto">
          <Input
            type="text"
            placeholder="Search providers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 bg-casino-thunder-gray/30 border-white/10 w-full md:w-64"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" size={16} />
        </div>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-casino-thunder-gray/30 border border-white/5 rounded-lg p-6">
              <Skeleton className="h-12 w-40 mb-4" />
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-4 w-full mb-6" />
              <div className="flex gap-2">
                {[...Array(3)].map((_, idx) => (
                  <Skeleton key={idx} className="h-8 w-16 rounded-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {filteredProviders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/70">No providers found matching "{searchTerm}"</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setSearchTerm("")}
              >
                Clear Search
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProviders.map((provider) => {
                const providerGames = getProviderGames(provider.name);
                const topGames = providerGames.slice(0, 3).map(game => game.title).join(", ");
                const categories = Array.from(new Set(providerGames.map(game => game.category)));
                
                return (
                  <Card key={provider.id} className="bg-casino-thunder-gray/30 border border-white/5 overflow-hidden hover:border-casino-thunder-green transition-colors">
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-1">{provider.name}</h3>
                      <p className="text-white/60 text-sm mb-2">{provider.gamesCount} games available</p>
                      
                      {topGames && (
                        <p className="text-white/80 text-sm mb-4 line-clamp-1">
                          <span className="text-casino-thunder-green font-medium">Top games:</span> {topGames}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {categories.map(category => (
                          <Badge key={category} variant="outline" className="bg-white/5 hover:bg-white/10">
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </Badge>
                        ))}
                      </div>
                      
                      <Button 
                        className="w-full bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
                        onClick={() => navigate(`/casino?provider=${provider.name}`)}
                      >
                        Browse Games
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProvidersPage;
