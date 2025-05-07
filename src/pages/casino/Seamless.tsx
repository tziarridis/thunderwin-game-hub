import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, FilterX } from "lucide-react";
import { GameProvider } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useGames } from "@/hooks/useGames";
import { Game } from "@/types";
import GameLauncher from '@/components/casino/GameLauncher';
import { availableProviders } from '@/config/gameProviders';

const Seamless = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [selectedProvider, setSelectedProvider] = useState(null);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const { games, loading, error } = useGames();
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);

  useEffect(() => {
    if (games) {
      applyFilters();
    }
  }, [games, searchText, selectedProvider]);

  const applyFilters = () => {
    let filtered = [...games];

    // Apply search filter
    if (searchText) {
      filtered = filtered.filter(game =>
        game.title.toLowerCase().includes(searchText.toLowerCase()) ||
        game.provider.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Apply provider filter
    if (selectedProvider) {
      filtered = filtered.filter(game => game.provider === selectedProvider.name);
    }

    setFilteredGames(filtered);
  };

  const handleClearSearch = () => {
    setSearchText("");
  };

  const handleProviderSelection = (provider: any) => {
    setSelectedProvider(provider);
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-12">Loading games...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-12">Error loading games: {error.message}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Seamless Integration</h1>
        <p className="text-white/70 max-w-2xl mx-auto">
          Explore games from our integrated providers.
        </p>
      </div>

      <div className="relative mb-8">
        <Input
          type="text"
          placeholder="Search games..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="pl-10 py-6 bg-casino-thunder-gray/30 border-white/10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        {searchText && (
          <Button
            variant="ghost"
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
            onClick={handleClearSearch}
          >
            <FilterX size={18} />
          </Button>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6 thunder-glow">Select Provider</h2>
        <div className="flex flex-wrap gap-4">
          {availableProviders.map(provider => (
            <Button
              key={provider.id}
              variant={selectedProvider?.id === provider.id ? "default" : "outline"}
              onClick={() => handleProviderSelection(provider)}
            >
              {provider.name}
            </Button>
          ))}
        </div>
      </div>

      {filteredGames.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl mb-4">No games match your search criteria.</p>
          <Button
            variant="outline"
            className="border-casino-thunder-green text-casino-thunder-green"
            onClick={handleClearSearch}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredGames.map(game => (
            <Card key={game.id} className="bg-casino-thunder-gray/30 border border-white/10">
              <CardContent className="p-4">
                <h3 className="font-medium text-white truncate">{game.title}</h3>
                <p className="text-white/60 text-xs">{game.provider}</p>
                <GameLauncher gameId={game.id} gameName={game.title} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Seamless;
