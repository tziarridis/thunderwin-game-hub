import { useState, useEffect } from "react";
import { useGames } from "@/hooks/useGames";
import { Game } from "@/types";
import { useIsMobile } from "@/hooks/use-mobile";
import GamesGrid from "@/components/games/GamesGrid"; 
import GamesGridMobile from "@/components/games/GamesGridMobile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const CasinoGames = () => {
  const { games, loading, providers, updateParams } = useGames();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProvider, setSelectedProvider] = useState("");
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // Filter games based on search term, category, and provider
    let filtered = [...games];
    
    if (searchTerm) {
      filtered = filtered.filter(game => 
        game.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(game =>
        game.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    
    if (selectedProvider) {
      filtered = filtered.filter(game =>
        game.provider?.toLowerCase() === selectedProvider.toLowerCase()
      );
    }
    
    setFilteredGames(filtered);
  }, [games, searchTerm, selectedCategory, selectedProvider]);
  
  // Handler for game launch
  const handleGameClick = (game: Game) => {
    // Navigate to game detail or launch directly
    console.log(`Launch game: ${game.id}`);
  };
  
  // Mobile-optimized categories
  const categories = [
    { id: 'all', name: 'All Games' },
    { id: 'slots', name: 'Slots' },
    { id: 'table', name: 'Table Games' },
    { id: 'live', name: 'Live Casino' },
    { id: 'jackpot', name: 'Jackpots' },
    { id: 'new', name: 'New Games' },
  ];

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {isMobile ? (
        // Mobile layout
        <>
          {/* Search and filter bar */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                placeholder="Search games..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 bg-casino-thunder-dark border-casino-thunder-gray/30"
              />
            </div>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="bg-casino-thunder-darker border-t border-white/10 rounded-t-xl">
                <div className="pt-2 pb-6 space-y-4">
                  <h3 className="text-lg font-medium">Filter Games</h3>
                  
                  <div className="space-y-2">
                    <Label>Provider</Label>
                    <Select
                      value={selectedProvider}
                      onValueChange={setSelectedProvider}
                    >
                      <SelectTrigger className="bg-casino-thunder-dark border-casino-thunder-gray/30">
                        <SelectValue placeholder="All Providers" />
                      </SelectTrigger>
                      <SelectContent className="bg-casino-thunder-dark border-casino-thunder-gray/30">
                        <SelectItem value="">All Providers</SelectItem>
                        {providers.map(provider => (
                          <SelectItem key={provider.id} value={provider.id}>{provider.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Game Features</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="jackpot" />
                        <label htmlFor="jackpot" className="text-sm">Jackpot</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="new" />
                        <label htmlFor="new" className="text-sm">New Games</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="featured" />
                        <label htmlFor="featured" className="text-sm">Featured</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="popular" />
                        <label htmlFor="popular" className="text-sm">Popular</label>
                      </div>
                    </div>
                  </div>
                  
                  <Button className="w-full bg-casino-thunder-green text-black">
                    Apply Filters
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          
          {/* Categories slider */}
          <ScrollArea className="w-full whitespace-nowrap pb-2">
            <div className="flex space-x-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  className={selectedCategory === category.id ? "bg-casino-thunder-green text-black" : ""}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </ScrollArea>
          
          {/* Mobile games grid */}
          <GamesGridMobile
            games={filteredGames}
            loading={loading}
            onGameClick={handleGameClick}
            emptyMessage="No games found. Try different filters."
            loadMore={() => console.log('Load more games')}
            hasMore={filteredGames.length >= 12}
          />
        </>
      ) : (
        // Desktop layout (keep existing code)
        <>
          <h1 className="text-3xl font-bold">Casino Games</h1>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 w-1/3">
              <Input
                placeholder="Search games..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-casino-thunder-dark border-casino-thunder-gray/30"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <Select
                value={selectedProvider}
                onValueChange={setSelectedProvider}
              >
                <SelectTrigger className="w-[180px] bg-casino-thunder-dark border-casino-thunder-gray/30">
                  <SelectValue placeholder="All Providers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Providers</SelectItem>
                  {providers.map(provider => (
                    <SelectItem key={provider.id} value={provider.id}>{provider.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Tabs defaultValue={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList>
              {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.id}>
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {categories.map((category) => (
              <TabsContent key={category.id} value={category.id}>
                <GamesGrid
                  games={filteredGames}
                  loading={loading}
                  onGameClick={handleGameClick}
                />
              </TabsContent>
            ))}
          </Tabs>
        </>
      )}
    </div>
  );
};

export default CasinoGames;
