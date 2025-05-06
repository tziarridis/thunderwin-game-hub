
import React, { useState } from 'react';
import { Search, FilterX, SlidersHorizontal } from 'lucide-react';
import { 
  Input,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Checkbox,
  Label
} from '@/components/ui';
import { cn } from '@/lib/utils';

interface GameFiltersProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: GameFilterOptions) => void;
  initialFilters?: Partial<GameFilterOptions>;
  className?: string;
}

export interface GameFilterOptions {
  providers: string[];
  minRTP: number | null;
  maxBet: number | null;
  minBet: number | null;
  categories: string[];
  onlyFavorites: boolean;
}

const defaultFilters: GameFilterOptions = {
  providers: [],
  minRTP: null,
  maxBet: null,
  minBet: null,
  categories: [],
  onlyFavorites: false
};

export const GameFilters = ({
  onSearch,
  onFilterChange,
  initialFilters = {},
  className
}: GameFiltersProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<GameFilterOptions>({
    ...defaultFilters,
    ...initialFilters
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  // Sample providers and categories - in a real app, these would come from backend
  const availableProviders = ['Pragmatic Play', 'NetEnt', 'Playtech', 'Evolution'];
  const availableCategories = ['Slots', 'Table Games', 'Live Casino', 'Jackpots', 'New', 'Popular'];
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch(e.target.value);
  };
  
  const handleClearSearch = () => {
    setSearchQuery('');
    onSearch('');
  };
  
  const handleFilterChange = (newFilters: Partial<GameFilterOptions>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
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
  
  const handleRangeChange = (
    field: 'minRTP' | 'minBet' | 'maxBet',
    value: string
  ) => {
    const numValue = value === '' ? null : parseFloat(value);
    handleFilterChange({ [field]: numValue });
  };
  
  const countActiveFilters = () => {
    let count = 0;
    if (filters.providers.length > 0) count++;
    if (filters.categories.length > 0) count++;
    if (filters.minRTP !== null) count++;
    if (filters.minBet !== null) count++;
    if (filters.maxBet !== null) count++;
    if (filters.onlyFavorites) count++;
    return count;
  };
  
  const handleResetFilters = () => {
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
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
          <PopoverContent className="w-80 sm:w-[350px] p-4 bg-casino-thunder-dark border border-white/10">
            <div className="space-y-4">
              <h3 className="font-medium">Game Filters</h3>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-white/70">Providers</h4>
                <div className="grid grid-cols-2 gap-2">
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
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-white/70">RTP & Bet Limits</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="min-rtp" className="text-xs">Min RTP %</Label>
                    <Input
                      id="min-rtp"
                      type="number"
                      min="0"
                      max="100"
                      value={filters.minRTP || ''}
                      onChange={(e) => handleRangeChange('minRTP', e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label htmlFor="min-bet" className="text-xs">Min Bet</Label>
                    <Input
                      id="min-bet"
                      type="number"
                      min="0"
                      value={filters.minBet || ''}
                      onChange={(e) => handleRangeChange('minBet', e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="max-bet" className="text-xs">Max Bet</Label>
                    <Input
                      id="max-bet"
                      type="number"
                      min="0"
                      value={filters.maxBet || ''}
                      onChange={(e) => handleRangeChange('maxBet', e.target.value)}
                      className="h-8"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="only-favorites"
                    checked={filters.onlyFavorites}
                    onCheckedChange={(checked) => 
                      handleFilterChange({ onlyFavorites: !!checked })
                    }
                  />
                  <Label htmlFor="only-favorites">Only show favorites</Label>
                </div>
              </div>
              
              <div className="flex justify-between pt-2 border-t border-white/10">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleResetFilters}
                >
                  Reset All
                </Button>
                <Button 
                  size="sm"
                  onClick={() => setFiltersOpen(false)}
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

export default GameFilters;
