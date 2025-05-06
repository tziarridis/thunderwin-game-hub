
import React, { useState, useEffect } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface GameFilters {
  category?: string;
  provider?: string;
  search?: string;
  minRTP?: number;
  isNew?: boolean;
  isPopular?: boolean;
  isFeatured?: boolean;
  hasJackpot?: boolean;
  sortBy?: 'name' | 'rtp' | 'provider' | 'date' | 'popularity';
  sortDir?: 'asc' | 'desc';
}

interface GameFiltersProps {
  filters: GameFilters;
  onFilterChange: (filters: Partial<GameFilters>) => void;
  expandedView?: boolean;
  providers?: { id: string; name: string }[];
  categories?: { id: string; name: string; slug: string }[];
}

const GameFilters: React.FC<GameFiltersProps> = ({
  filters,
  onFilterChange,
  expandedView = false,
  providers: propProviders,
  categories: propCategories,
}) => {
  const [search, setSearch] = useState(filters.search || '');
  const [minRTP, setMinRTP] = useState<number>(filters.minRTP || 0);
  const [providers, setProviders] = useState<{ id: string; name: string }[]>(propProviders || []);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>(propCategories || []);
  const [loading, setLoading] = useState({
    providers: !propProviders,
    categories: !propCategories
  });
  
  // Fetch providers and categories if not provided as props
  useEffect(() => {
    const fetchData = async () => {
      if (!propProviders) {
        setLoading(prev => ({ ...prev, providers: true }));
        try {
          const { data, error } = await supabase
            .from('providers')
            .select('id, name')
            .eq('status', 'active')
            .order('name');
            
          if (error) throw error;
          setProviders(data || []);
        } catch (error) {
          console.error('Error fetching providers:', error);
          toast.error('Failed to load game providers');
        } finally {
          setLoading(prev => ({ ...prev, providers: false }));
        }
      }
      
      if (!propCategories) {
        setLoading(prev => ({ ...prev, categories: true }));
        try {
          const { data, error } = await supabase
            .from('game_categories')
            .select('id, name, slug')
            .eq('status', 'active')
            .order('name');
            
          if (error) throw error;
          setCategories(data || []);
        } catch (error) {
          console.error('Error fetching categories:', error);
          toast.error('Failed to load game categories');
        } finally {
          setLoading(prev => ({ ...prev, categories: false }));
        }
      }
    };
    
    fetchData();
  }, [propProviders, propCategories]);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ search });
  };
  
  const handleReset = () => {
    setSearch('');
    setMinRTP(0);
    onFilterChange({
      category: undefined,
      provider: undefined,
      search: '',
      minRTP: 0,
      isNew: false,
      isPopular: false,
      isFeatured: false,
      hasJackpot: false,
      sortBy: 'popularity',
      sortDir: 'desc'
    });
  };
  
  return (
    <Card className="mb-6 bg-white/5">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Search Box */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Input
                placeholder="Search games..."
                value={search}
                onChange={handleSearchChange}
                className="pr-10"
              />
              <button 
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
              >
                <Search className="h-4 w-4" />
              </button>
            </form>
          </div>
          
          {/* Category Filter */}
          <div className="lg:col-span-2">
            <Select
              value={filters.category}
              onValueChange={value => onFilterChange({ category: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.slug}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Provider Filter */}
          <div className="lg:col-span-2">
            <Select
              value={filters.provider}
              onValueChange={value => onFilterChange({ provider: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Providers</SelectItem>
                {providers.map(provider => (
                  <SelectItem key={provider.id} value={provider.name}>
                    {provider.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Sort Filter */}
          <div className="lg:col-span-2">
            <Select
              value={filters.sortBy}
              onValueChange={(value: 'name' | 'rtp' | 'provider' | 'date' | 'popularity') => 
                onFilterChange({ sortBy: value })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popularity">Popularity</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="rtp">RTP</SelectItem>
                <SelectItem value="provider">Provider</SelectItem>
                <SelectItem value="date">Release Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Toggle Buttons */}
          <div className="lg:col-span-2 flex flex-wrap gap-2 items-center">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isNew" 
                checked={filters.isNew} 
                onCheckedChange={value => onFilterChange({ isNew: !!value })}
              />
              <Label htmlFor="isNew">New</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isPopular" 
                checked={filters.isPopular} 
                onCheckedChange={value => onFilterChange({ isPopular: !!value })}
              />
              <Label htmlFor="isPopular">Popular</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="hasJackpot" 
                checked={filters.hasJackpot} 
                onCheckedChange={value => onFilterChange({ hasJackpot: !!value })}
              />
              <Label htmlFor="hasJackpot">Jackpot</Label>
            </div>
          </div>
          
          {/* Reset Button */}
          <div className="lg:col-span-1 flex justify-end">
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleReset}
              title="Clear all filters"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* RTP Slider (Expanded View) */}
        {expandedView && (
          <div className="mt-4 grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="rtp">RTP: {minRTP}%+</Label>
              </div>
              <Slider
                id="rtp"
                min={80}
                max={99}
                step={1}
                value={[minRTP]}
                onValueChange={value => {
                  setMinRTP(value[0]);
                  onFilterChange({ minRTP: value[0] });
                }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GameFilters;
