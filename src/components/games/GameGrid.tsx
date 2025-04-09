import { useState, useEffect } from "react";
import GameCard from "./GameCard";
import { Button } from "@/components/ui/button";
import { 
  Gamepad2, 
  User, 
  Table2, 
  Dice5, 
  Search,
  Wallet,
  Zap,
  SlidersHorizontal,
  X,
  ArrowUpDown,
  Trophy
} from "lucide-react";

// Mock game data with extended details
const mockGames = [
  {
    id: "1",
    title: "Lightning Roulette",
    image: "https://images.unsplash.com/photo-1531059224353-8e56cd9eb9b2?auto=format&fit=crop&q=80&w=400",
    provider: "Evolution Gaming",
    category: "live",
    isPopular: true,
    rtp: 97.3,
    minBet: 1,
    maxBet: 1000,
    volatility: "High",
    releaseDate: "2021-04-12"
  },
  {
    id: "2",
    title: "Book of Dead",
    image: "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&q=80&w=400",
    provider: "Play'n GO",
    category: "slots",
    isPopular: true,
    rtp: 96.2,
    minBet: 0.10,
    maxBet: 100,
    volatility: "High",
    releaseDate: "2020-07-23"
  },
  {
    id: "3",
    title: "Sweet Bonanza",
    image: "https://images.unsplash.com/photo-1586899028174-e7098604235b?auto=format&fit=crop&q=80&w=400",
    provider: "Pragmatic Play",
    category: "slots",
    isNew: true,
    rtp: 96.5,
    minBet: 0.20,
    maxBet: 125,
    volatility: "Medium",
    releaseDate: "2023-01-05"
  },
  {
    id: "4",
    title: "Mega Fortune",
    image: "https://images.unsplash.com/photo-1611159063981-b8c8c4301869?auto=format&fit=crop&q=80&w=400",
    provider: "NetEnt",
    category: "jackpot",
    rtp: 96.0,
    minBet: 0.25,
    maxBet: 50,
    volatility: "High",
    releaseDate: "2019-09-15"
  },
  {
    id: "5",
    title: "Gonzo's Quest",
    image: "https://images.unsplash.com/photo-1594842084112-0e399ef9754b?auto=format&fit=crop&q=80&w=400",
    provider: "NetEnt",
    category: "slots",
    rtp: 95.7,
    minBet: 0.20,
    maxBet: 50,
    volatility: "Medium",
    releaseDate: "2018-06-22"
  },
  {
    id: "6",
    title: "Starburst",
    image: "https://images.unsplash.com/photo-1634368949489-91a7977de894?auto=format&fit=crop&q=80&w=400",
    provider: "NetEnt",
    category: "slots",
    isPopular: true,
    rtp: 96.1,
    minBet: 0.10,
    maxBet: 100,
    volatility: "Low",
    releaseDate: "2017-11-14"
  },
  {
    id: "7",
    title: "Crazy Time",
    image: "https://images.unsplash.com/photo-1629784575520-7ab3e4a2fa7a?auto=format&fit=crop&q=80&w=400",
    provider: "Evolution Gaming",
    category: "live",
    isNew: true,
    rtp: 96.8,
    minBet: 1,
    maxBet: 2000,
    volatility: "High",
    releaseDate: "2023-03-18"
  },
  {
    id: "8",
    title: "Gates of Olympus",
    image: "https://images.unsplash.com/photo-1533709752211-118fcaf03312?auto=format&fit=crop&q=80&w=400",
    provider: "Pragmatic Play",
    category: "slots",
    rtp: 96.5,
    minBet: 0.20,
    maxBet: 125,
    volatility: "High",
    releaseDate: "2021-02-25"
  },
  {
    id: "9",
    title: "Wolf Gold",
    image: "https://images.unsplash.com/photo-1616616839508-0fd2f3b9fa5a?auto=format&fit=crop&q=80&w=400",
    provider: "Pragmatic Play",
    category: "slots",
    rtp: 96.0,
    minBet: 0.25,
    maxBet: 125,
    volatility: "Medium",
    releaseDate: "2019-08-10"
  },
  {
    id: "10",
    title: "Monopoly Live",
    image: "https://images.unsplash.com/photo-1604871000636-074fa5117945?auto=format&fit=crop&q=80&w=400",
    provider: "Evolution Gaming",
    category: "live",
    isPopular: true,
    rtp: 96.3,
    minBet: 0.50,
    maxBet: 500,
    volatility: "High",
    releaseDate: "2020-05-20"
  },
  {
    id: "11",
    title: "Reactoonz",
    image: "https://images.unsplash.com/photo-1614128418646-a0f6c549da93?auto=format&fit=crop&q=80&w=400",
    provider: "Play'n GO",
    category: "slots",
    rtp: 96.1,
    minBet: 0.20,
    maxBet: 100,
    volatility: "High",
    releaseDate: "2018-12-05"
  },
  {
    id: "12",
    title: "Big Bass Bonanza",
    image: "https://images.unsplash.com/photo-1560953814-e638733735af?auto=format&fit=crop&q=80&w=400",
    provider: "Pragmatic Play",
    category: "slots",
    isNew: true,
    rtp: 96.7,
    minBet: 0.10,
    maxBet: 250,
    volatility: "Medium",
    releaseDate: "2022-11-30"
  },
  {
    id: "13",
    title: "Blackjack VIP",
    image: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&q=80&w=400",
    provider: "Evolution Gaming",
    category: "table",
    isPopular: true,
    rtp: 99.5,
    minBet: 5,
    maxBet: 10000,
    volatility: "Low",
    releaseDate: "2019-01-15"
  },
  {
    id: "14",
    title: "European Roulette",
    image: "https://images.unsplash.com/photo-1606167668584-78701c57f13d?auto=format&fit=crop&q=80&w=400",
    provider: "NetEnt",
    category: "table",
    rtp: 97.3,
    minBet: 1,
    maxBet: 500,
    volatility: "Medium",
    releaseDate: "2018-03-22"
  },
  {
    id: "15",
    title: "Aviator",
    image: "https://images.unsplash.com/photo-1630925920b3-5380c4cb55ae?auto=format&fit=crop&q=80&w=400",
    provider: "Spribe",
    category: "crash",
    isNew: true,
    isPopular: true,
    rtp: 97.0,
    minBet: 0.10,
    maxBet: 100,
    volatility: "High",
    releaseDate: "2022-06-14"
  },
  {
    id: "16",
    title: "Mega Moolah",
    image: "https://images.unsplash.com/photo-1596731430254-9cb38ceda2e1?auto=format&fit=crop&q=80&w=400",
    provider: "Microgaming",
    category: "jackpot",
    isPopular: true,
    rtp: 88.1,
    minBet: 0.25,
    maxBet: 6.25,
    volatility: "High",
    releaseDate: "2017-05-16"
  }
];

const GameGrid = () => {
  const [activeCategory, setActiveCategory] = useState("popular");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filteredGames, setFilteredGames] = useState(mockGames);
  const [visibleGames, setVisibleGames] = useState(12);
  const [sortOption, setSortOption] = useState("popular");
  const [providerFilter, setProviderFilter] = useState<string[]>([]);
  const [rtpFilter, setRtpFilter] = useState<[number, number]>([90, 100]);
  const [volatilityFilter, setVolatilityFilter] = useState<string[]>([]);
  
  // Get unique list of providers
  const providers = Array.from(new Set(mockGames.map(game => game.provider)));
  
  // Get unique list of volatility levels
  const volatilityLevels = Array.from(new Set(mockGames.map(game => game.volatility)));
  
  // Handle search and filtering
  useEffect(() => {
    let result = [...mockGames];
    
    // Category filter
    if (activeCategory !== "popular") {
      if (activeCategory === "new") {
        result = result.filter(game => game.isNew);
      } else {
        result = result.filter(game => game.category === activeCategory);
      }
    } else {
      result = result.filter(game => game.isPopular);
    }
    
    // Search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        game => 
          game.title.toLowerCase().includes(query) || 
          game.provider.toLowerCase().includes(query)
      );
    }
    
    // Provider filter
    if (providerFilter.length > 0) {
      result = result.filter(game => providerFilter.includes(game.provider));
    }
    
    // RTP filter
    if (rtpFilter[0] !== 90 || rtpFilter[1] !== 100) {
      result = result.filter(
        game => game.rtp >= rtpFilter[0] && game.rtp <= rtpFilter[1]
      );
    }
    
    // Volatility filter
    if (volatilityFilter.length > 0) {
      result = result.filter(game => volatilityFilter.includes(game.volatility));
    }
    
    // Sorting
    switch (sortOption) {
      case "name_asc":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "name_desc":
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "rtp_high":
        result.sort((a, b) => b.rtp - a.rtp);
        break;
      case "rtp_low":
        result.sort((a, b) => a.rtp - b.rtp);
        break;
      case "new_first":
        result.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
        break;
      case "popular":
        // Keep original order (which has popular games first)
        break;
    }
    
    setFilteredGames(result);
  }, [activeCategory, searchQuery, sortOption, providerFilter, rtpFilter, volatilityFilter]);
  
  const handleLoadMore = () => {
    setVisibleGames(prev => Math.min(prev + 12, filteredGames.length));
  };
  
  const toggleProviderFilter = (provider: string) => {
    if (providerFilter.includes(provider)) {
      setProviderFilter(providerFilter.filter(p => p !== provider));
    } else {
      setProviderFilter([...providerFilter, provider]);
    }
  };
  
  const toggleVolatilityFilter = (volatility: string) => {
    if (volatilityFilter.includes(volatility)) {
      setVolatilityFilter(volatilityFilter.filter(v => v !== volatility));
    } else {
      setVolatilityFilter([...volatilityFilter, volatility]);
    }
  };
  
  const clearFilters = () => {
    setProviderFilter([]);
    setRtpFilter([90, 100]);
    setVolatilityFilter([]);
    setSearchQuery("");
  };

  return (
    <div className="py-8">
      {/* Game Categories */}
      <div className="mb-8 overflow-x-auto flex gap-2 pb-2">
        <CategoryButton 
          icon={<Trophy size={16} />}
          name="Popular" 
          isActive={activeCategory === "popular"} 
          onClick={() => setActiveCategory("popular")}
        />
        <CategoryButton 
          icon={<Zap size={16} />}
          name="New Games" 
          isActive={activeCategory === "new"} 
          onClick={() => setActiveCategory("new")}
        />
        <CategoryButton 
          icon={<Gamepad2 size={16} />}
          name="Slots" 
          isActive={activeCategory === "slots"} 
          onClick={() => setActiveCategory("slots")}
        />
        <CategoryButton 
          icon={<User size={16} />}
          name="Live Dealers" 
          isActive={activeCategory === "live"} 
          onClick={() => setActiveCategory("live")}
        />
        <CategoryButton 
          icon={<Table2 size={16} />}
          name="Table Games" 
          isActive={activeCategory === "table"} 
          onClick={() => setActiveCategory("table")}
        />
        <CategoryButton 
          icon={<Dice5 size={16} />}
          name="Crash Games" 
          isActive={activeCategory === "crash"} 
          onClick={() => setActiveCategory("crash")}
        />
        <CategoryButton 
          icon={<Wallet size={16} />}
          name="Jackpots" 
          isActive={activeCategory === "jackpot"} 
          onClick={() => setActiveCategory("jackpot")}
        />
      </div>
      
      {/* Search and Filter */}
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="search"
            className="thunder-input w-full pl-10"
            placeholder="Search games..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className={`flex items-center ${showFilters ? 'text-casino-thunder-green border-casino-thunder-green' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal size={16} className="mr-2" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
          
          <div className="relative">
            <Button variant="outline" className="flex items-center">
              <ArrowUpDown size={16} className="mr-2" />
              Sort
            </Button>
            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-casino-thunder-dark z-10 border border-white/10 hidden group-hover:block">
              <div className="rounded-md ring-1 ring-black ring-opacity-5 py-1">
                <button
                  className={`block px-4 py-2 text-sm text-white hover:bg-white/10 w-full text-left ${sortOption === 'popular' ? 'text-casino-thunder-green' : ''}`}
                  onClick={() => setSortOption('popular')}
                >
                  Popular First
                </button>
                <button
                  className={`block px-4 py-2 text-sm text-white hover:bg-white/10 w-full text-left ${sortOption === 'new_first' ? 'text-casino-thunder-green' : ''}`}
                  onClick={() => setSortOption('new_first')}
                >
                  Newest First
                </button>
                <button
                  className={`block px-4 py-2 text-sm text-white hover:bg-white/10 w-full text-left ${sortOption === 'name_asc' ? 'text-casino-thunder-green' : ''}`}
                  onClick={() => setSortOption('name_asc')}
                >
                  Name (A-Z)
                </button>
                <button
                  className={`block px-4 py-2 text-sm text-white hover:bg-white/10 w-full text-left ${sortOption === 'name_desc' ? 'text-casino-thunder-green' : ''}`}
                  onClick={() => setSortOption('name_desc')}
                >
                  Name (Z-A)
                </button>
                <button
                  className={`block px-4 py-2 text-sm text-white hover:bg-white/10 w-full text-left ${sortOption === 'rtp_high' ? 'text-casino-thunder-green' : ''}`}
                  onClick={() => setSortOption('rtp_high')}
                >
                  Highest RTP
                </button>
                <button
                  className={`block px-4 py-2 text-sm text-white hover:bg-white/10 w-full text-left ${sortOption === 'rtp_low' ? 'text-casino-thunder-green' : ''}`}
                  onClick={() => setSortOption('rtp_low')}
                >
                  Lowest RTP
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Advanced Filters */}
      {showFilters && (
        <div className="mb-8 thunder-card p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Advanced Filters</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="text-white/70 hover:text-casino-thunder-green"
            >
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Provider Filter */}
            <div>
              <h4 className="text-white/80 mb-2 font-medium">Game Providers</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                {providers.map(provider => (
                  <label key={provider} className="flex items-center text-white/70 hover:text-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={providerFilter.includes(provider)}
                      onChange={() => toggleProviderFilter(provider)}
                      className="mr-2 h-4 w-4"
                    />
                    {provider}
                  </label>
                ))}
              </div>
            </div>
            
            {/* RTP Filter */}
            <div>
              <h4 className="text-white/80 mb-2 font-medium">RTP Range</h4>
              <div className="px-2">
                <div className="flex justify-between text-white/70 text-sm mb-1">
                  <span>{rtpFilter[0]}%</span>
                  <span>{rtpFilter[1]}%</span>
                </div>
                <input
                  type="range"
                  min="90"
                  max="100"
                  step="0.5"
                  value={rtpFilter[0]}
                  onChange={(e) => setRtpFilter([parseFloat(e.target.value), rtpFilter[1]])}
                  className="w-full"
                />
                <input
                  type="range"
                  min="90"
                  max="100"
                  step="0.5"
                  value={rtpFilter[1]}
                  onChange={(e) => setRtpFilter([rtpFilter[0], parseFloat(e.target.value)])}
                  className="w-full"
                />
              </div>
            </div>
            
            {/* Volatility Filter */}
            <div>
              <h4 className="text-white/80 mb-2 font-medium">Volatility</h4>
              <div className="space-y-2">
                {volatilityLevels.map(volatility => (
                  <label key={volatility} className="flex items-center text-white/70 hover:text-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={volatilityFilter.includes(volatility)}
                      onChange={() => toggleVolatilityFilter(volatility)}
                      className="mr-2 h-4 w-4"
                    />
                    {volatility}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="mb-4 text-white/70 flex justify-between items-center">
        <div>
          Found <span className="text-casino-thunder-green font-medium">{filteredGames.length}</span> games
        </div>
        {sortOption !== "popular" && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSortOption("popular")}
            className="text-white/70 hover:text-casino-thunder-green text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Clear Sorting
          </Button>
        )}
      </div>

      {/* No Results Message */}
      {filteredGames.length === 0 && (
        <div className="thunder-card p-8 text-center">
          <h3 className="text-xl font-semibold text-white mb-3">No Games Found</h3>
          <p className="text-white/70 mb-4">
            No games match your selected filters. Try adjusting your search criteria.
          </p>
          <Button onClick={clearFilters}>
            Clear All Filters
          </Button>
        </div>
      )}

      {/* Games Grid */}
      {filteredGames.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredGames.slice(0, visibleGames).map(game => (
            <GameCard 
              key={game.id}
              id={game.id}
              title={game.title} 
              image={game.image}
              provider={game.provider}
              isPopular={game.isPopular}
              isNew={game.isNew}
              rtp={game.rtp}
              minBet={game.minBet}
              maxBet={game.maxBet}
            />
          ))}
        </div>
      )}

      {/* Load More Button */}
      {visibleGames < filteredGames.length && (
        <div className="text-center mt-10">
          <Button variant="outline" className="min-w-[200px]" onClick={handleLoadMore}>
            Load More Games
          </Button>
        </div>
      )}
    </div>
  );
};

const CategoryButton = ({ 
  icon, 
  name, 
  isActive, 
  onClick 
}: { 
  icon: React.ReactNode; 
  name: string; 
  isActive: boolean; 
  onClick: () => void;
}) => (
  <Button
    variant={isActive ? "default" : "outline"}
    className={`flex items-center shrink-0 ${
      isActive 
        ? "bg-casino-thunder-green text-black hover:bg-casino-thunder-highlight" 
        : "hover:text-casino-thunder-green"
    }`}
    onClick={onClick}
  >
    <span className="mr-2">{icon}</span>
    {name}
  </Button>
);

export default GameGrid;
