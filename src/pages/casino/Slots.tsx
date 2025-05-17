
import React, { useEffect, useState, useMemo } from 'react';
import { useGames } from '@/hooks/useGames';
import { Game } from '@/types';
import GameGrid from '@/components/casino/GameGrid'; // Using the /casino/GameGrid
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext'; // For launching games


const Slots = () => {
  const { 
    games, // all games from context, for initial filtering if needed
    isLoading, 
    error, 
    filterGames, // context's filter function
    providers,
    categories, // get categories to find 'slots' slug dynamically if needed
    filteredGames, // games filtered by context
    launchGame
  } = useGames();
  const { isAuthenticated, user } = useAuth();


  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string | undefined>(undefined);
  
  // Find the 'slots' category slug dynamically. Fallback to 'slots' if not found.
  const slotsCategorySlug = useMemo(() => {
    const slotsCat = categories.find(cat => cat.name.toLowerCase().includes('slots') || cat.slug.toLowerCase().includes('slots'));
    return slotsCat?.slug || 'slots'; // Default to 'slots' if not found
  }, [categories]);

  useEffect(() => {
    // Filter by search term, the 'slots' category, and selected provider
    filterGames(searchTerm, slotsCategorySlug, selectedProvider);
  }, [searchTerm, selectedProvider, slotsCategorySlug, filterGames]);

  // displayedGames will be the 'filteredGames' from the context,
  // which are already filtered by category in the useEffect above.
  const displayedGames = filteredGames;

  const handleGameClick = async (game: Game) => {
    if (!isAuthenticated || !user) {
      toast.error("Please log in to play.");
      return;
    }
    const gameUrl = await launchGame(game, {
      mode: 'real',
      playerId: user.id,
      currency: user.currency || 'EUR',
      platform: 'web',
    });
    if (gameUrl) {
      window.open(gameUrl, '_blank');
    }
  };

  if (error) return <p className="text-red-500 text-center py-10">Error loading slot games: {error}</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-white">Slot Games</h1>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
        <div className="relative flex-grow w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            type="search"
            placeholder="Search slot games..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full bg-card border-border focus:ring-primary text-white"
          />
        </div>
        <Select value={selectedProvider} onValueChange={(value) => setSelectedProvider(value === 'all' ? undefined : value)}>
          <SelectTrigger className="w-full md:w-[200px] bg-card border-border text-white">
            <SelectValue placeholder="All Providers" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border text-white">
            <SelectItem value="all">All Providers</SelectItem>
            {providers.map(provider => (
              <SelectItem key={provider.id} value={provider.slug}>{provider.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Pass loading state and onGameClick to GameGrid */}
      <GameGrid 
        games={displayedGames} 
        loading={isLoading && displayedGames.length === 0} // Show loader only if no games yet and loading
        onGameClick={handleGameClick} 
        emptyMessage="No slot games found matching your criteria."
      />
    </div>
  );
};

export default Slots;

