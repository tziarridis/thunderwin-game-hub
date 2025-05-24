import React, { useState, useEffect, useCallback } from 'react';
import { Search, FilterX, SlidersHorizontal, Clock, X } from 'lucide-react';
import { 
  Input,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Checkbox,
  Label,
  Slider
} from '@/components/ui/';
import { cn } from '@/lib/utils';
import { debounce } from 'lodash';

interface GameFiltersProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: GameFilterOptions) => void;
  initialFilters?: Partial<GameFilterOptions>;
  className?: string;
  availableProviders?: string[];
  availableCategories?: string[];
}

export interface GameFilterOptions {
  providers: string[];
  minRTP: number | null;
  maxRTP: number | null;
  maxBet: number | null;
  minBet: number | null;
  categories: string[];
  onlyFavorites: boolean;
  onlyNew: boolean;
  onlyPopular: boolean;
  volatility: string | null;
  sortBy: 'newest' | 'popularity' | 'name' | 'rtp' | null;
}

const defaultFilters: GameFilterOptions = {
  providers: [],
  minRTP: null,
  maxRTP: null,
  maxBet: null,
  minBet: null,
  categories: [],
  onlyFavorites: false,
  onlyNew: false,
  onlyPopular: false,
  volatility: null,
  sortBy: null
};

export const GameFilters = ({
  onSearch,
  onFilterChange,
  initialFilters = {},
  className,
  availableProviders = ['Pragmatic Play', 'NetEnt', 'Playtech', 'Evolution', 'GitSlotPark'],
  availableCategories = ['Slots', 'Table Games', 'Live Casino', 'Jackpots', 'New', 'Popular']
}: GameFiltersProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<GameFilterOptions>({
    ...defaultFilters,
    ...initialFilters
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [rtpRange, setRtpRange] = useState<[number, number]>([filters.minRTP || 90, filters.maxRTP || 98]);
  const [betRange, setBetRange] = useState<[number, number]>([filters.minBet || 0.1, filters.maxBet || 100]);
  
  // Debounce search for better performance
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      onSearch(query);
    }, 300),
    [onSearch]
  );
  
  // Effect for search query
  useEffect(() => {
    debouncedSearch(searchQuery);
    return () => debouncedSearch.cancel();
  }, [searchQuery, debouncedSearch]);
  
  // Effect for filter changes
  useEffect(() => {
    // Update filters with proper range values
    const updatedFilters = {
      ...filters,
      minRTP: rtpRange[0],
      maxRTP: rtpRange[1],
      minBet: betRange[0],
      maxBet: betRange[1]
    };
    onFilterChange(updatedFilters);
  }, [filters, rtpRange, betRange, onFilterChange]);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const handleClearSearch = () => {
    setSearchQuery('');
    debouncedSearch('');
  };
  
  const handleFilterChange = (newFilters: Partial<GameFilterOptions>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
  };
  
  const handleCheckboxChange = (
    category: 'providers' | 'categories',
    value: string,
    checked: boolean
  ) => {
    const currentValues = [...filters[category]];
    
    if (checked && !currentValues.includes(value)) {
      handleFilterChange({ [category]: [...currentValues, value] });
    } else if (!checked && currentValues.includes(value)) {
      handleFilterChange({ 
        [category]: currentValues.filter(item => item !== value) 
      });
    }
  };
  
  const handleRtpRangeChange = (value: [number, number]) => {
    setRtpRange(value);
  };
  
  const handleBetRangeChange = (value: [number, number]) => {
    setBetRange(value);
  };
  
  const handleVolatilityChange = (volatility: string | null) => {
    handleFilterChange({ volatility });
  };
  
  const handleSortChange = (sortBy: 'newest' | 'popularity' | 'name' | 'rtp' | null) => {
    handleFilterChange({ sortBy });
    setFiltersOpen(false);
  };
  
  const countActiveFilters = () => {
    let count = 0;
    if (filters.providers.length > 0) count++;
    if (filters.categories.length > 0) count++;
    if (filters.minRTP !== null && filters.minRTP > 90) count++;
    if (filters.maxRTP !== null && filters.maxRTP < 98) count++;
    if (filters.minBet !== null && filters.minBet > 0.1) count++;
    if (filters.maxBet !== null && filters.maxBet < 100) count++;
    if (filters.onlyFavorites) count++;
    if (filters.onlyNew) count++;
    if (filters.onlyPopular) count++;
    if (filters.volatility !== null) count++;
    if (filters.sortBy !== null) count++;
    return count;
  };
  
  const handleResetFilters = () => {
    setFilters(defaultFilters);
    setRtpRange([90, 98]);
    setBetRange([0.1, 100]);
  };
  
  return (
    <div className={cn("space-y-4", className)}>
      <div className="relative">
        <Input
          type="text"
          placeholder="Search games or providers..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="pl-10 py-6 bg-casino-thunder-gray/30 border-white/10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        {searchQuery && (
          <Button 
            variant="ghost" 
            className="absolute right-2 top-1/2 transform -translate-y-1/2" 
            onClick={handleClearSearch}
          >
            <FilterX size={18} />
          </Button>
        )}
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {filters.sortBy && (
            <Badge variant="secondary" className="bg-casino-thunder-green/20 text-casino-thunder-green">
              Sort: {filters.sortBy}
              <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1" onClick={() => handleSortChange(null)}>
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
        
        <div className="text-sm text-white/60">
          {countActiveFilters() > 0 && `${countActiveFilters()} filters applied`}
        </div>
        
        <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className={cn(
                "border-white/10", 
                countActiveFilters() > 0 && "border-casino-thunder-green text-casino-thunder-green"
              )}
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
              {countActiveFilters() > 0 && (
                <span className="ml-2 bg-casino-thunder-green/20 text-casino-thunder-green rounded-full px-2 py-0.5 text-xs">
                  {countActiveFilters()}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 sm:w-[400px] p-4 bg-casino-thunder-dark border border-white/10">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Game Filters</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleResetFilters}
                  className="text-sm text-white/70"
                >
                  Reset All
                </Button>
              </div>
              
              <div className="space-y-2 border-b border-white/10 pb-4">
                <h4 className="text-sm font-medium text-white/70">Sort By</h4>
                <div className="flex flex-wrap gap-2">
                  {(["newest", "popularity", "name", "rtp"] as const).map(sortOption => (
                    <Button 
                      key={sortOption}
                      variant={filters.sortBy === sortOption ? "default" : "outline"}
                      size="sm"
                      className={filters.sortBy === sortOption ? "bg-casino-thunder-green text-black" : ""}
                      onClick={() => handleSortChange(sortOption)}
                    >
                      {sortOption === "newest" ? "Newest" : 
                       sortOption === "popularity" ? "Popular" :
                       sortOption === "name" ? "Name (A-Z)" : "RTP"}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2 border-b border-white/10 pb-4">
                <h4 className="text-sm font-medium text-white/70">Quick Filters</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="only-favorites"
                      checked={filters.onlyFavorites}
                      onCheckedChange={(checked) => 
                        handleFilterChange({ onlyFavorites: !!checked })
                      }
                    />
                    <Label htmlFor="only-favorites" className="text-sm">Favorites</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="only-new"
                      checked={filters.onlyNew}
                      onCheckedChange={(checked) => 
                        handleFilterChange({ onlyNew: !!checked })
                      }
                    />
                    <Label htmlFor="only-new" className="text-sm">New Games</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="only-popular"
                      checked={filters.onlyPopular}
                      onCheckedChange={(checked) => 
                        handleFilterChange({ onlyPopular: !!checked })
                      }
                    />
                    <Label htmlFor="only-popular" className="text-sm">Popular</Label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 border-b border-white/10 pb-4">
                <h4 className="text-sm font-medium text-white/70">RTP Range</h4>
                <div className="px-2 py-4">
                  <Slider
                    defaultValue={[90, 98]}
                    min={85}
                    max={99}
                    step={0.5}
                    value={rtpRange}
                    onValueChange={handleRtpRangeChange}
                  />
                  <div className="flex justify-between mt-2 text-xs text-white/70">
                    <span>{rtpRange[0]}%</span>
                    <span>{rtpRange[1]}%</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 border-b border-white/10 pb-4">
                <h4 className="text-sm font-medium text-white/70">Bet Range ($)</h4>
                <div className="px-2 py-4">
                  <Slider
                    defaultValue={[0.1, 100]}
                    min={0.1}
                    max={500}
                    step={0.1}
                    value={betRange}
                    onValueChange={handleBetRangeChange}
                  />
                  <div className="flex justify-between mt-2 text-xs text-white/70">
                    <span>${betRange[0].toFixed(1)}</span>
                    <span>${betRange[1].toFixed(1)}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 border-b border-white/10 pb-4">
                <h4 className="text-sm font-medium text-white/70">Volatility</h4>
                <div className="flex gap-2">
                  {['Low', 'Medium', 'High'].map(vol => (
                    <Button
                      key={vol}
                      variant={filters.volatility === vol.toLowerCase() ? "default" : "outline"}
                      size="sm"
                      className={filters.volatility === vol.toLowerCase() ? "bg-casino-thunder-green text-black" : ""}
                      onClick={() => handleVolatilityChange(
                        filters.volatility === vol.toLowerCase() ? null : vol.toLowerCase()
                      )}
                    >
                      {vol}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2 border-b border-white/10 pb-4">
                <h4 className="text-sm font-medium text-white/70">Providers</h4>
                <div className="grid grid-cols-2 gap-2 max-h-[150px] overflow-y-auto pr-2">
                  {availableProviders.map(provider => (
                    <div key={provider} className="flex items-center gap-2">
                      <Checkbox
                        id={`provider-${provider}`}
                        checked={filters.providers.includes(provider)}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange('providers', provider, !!checked)
                        }
                      />
                      <Label htmlFor={`provider-${provider}`} className="text-sm">
                        {provider}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-white/70">Categories</h4>
                <div className="grid grid-cols-2 gap-2">
                  {availableCategories.map(category => (
                    <div key={category} className="flex items-center gap-2">
                      <Checkbox
                        id={`category-${category}`}
                        checked={filters.categories.includes(category)}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange('categories', category, !!checked)
                        }
                      />
                      <Label htmlFor={`category-${category}`} className="text-sm">
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t border-white/10 pt-4">
                <Button 
                  size="sm"
                  onClick={() => setFiltersOpen(false)}
                  className="w-full"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

// Create Badge component for filter tags
const Badge = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'> & { variant?: 'default' | 'secondary' | 'outline' }>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          variant === 'default' && "bg-primary text-primary-foreground hover:bg-primary/80",
          variant === 'secondary' && "bg-secondary text-secondary-foreground hover:bg-secondary/80",
          variant === 'outline' && "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

export default GameFilters;
