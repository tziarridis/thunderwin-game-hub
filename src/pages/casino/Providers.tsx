
import React, { useEffect, useState, useMemo } from 'react';
import { GameProvider, Game } from '@/types';
import { useGames } from '@/hooks/useGames';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Filter, Search, ExternalLink, AlertTriangle, ChevronRight, Gamepad2 } from 'lucide-react';
import ProviderCard from '@/components/providers/ProviderCard';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


const ProvidersPage = () => {
  const { providers: allProviders, isLoading: loadingProviders, error: providersError } = useGames();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'name_asc' | 'name_desc' | 'games_desc' | 'games_asc'>('name_asc');
  const navigate = useNavigate();

  const filteredAndSortedProviders = useMemo(() => {
    let providers = [...allProviders];

    if (searchTerm) {
      providers = providers.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    providers.sort((a, b) => {
      switch (sortOrder) {
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        case 'games_desc':
          return (b.games_count || 0) - (a.games_count || 0);
        case 'games_asc':
          return (a.games_count || 0) - (b.games_count || 0);
        default:
          return 0;
      }
    });
    return providers;
  }, [allProviders, searchTerm, sortOrder]);

  if (loadingProviders && filteredAndSortedProviders.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Skeleton className="h-10 w-1/3 mb-4" />
        <Skeleton className="h-8 w-1/4 mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-20 w-full" /></CardHeader>
              <CardContent><Skeleton className="h-6 w-3/4 mb-2" /><Skeleton className="h-4 w-1/2" /></CardContent>
              <CardFooter><Skeleton className="h-10 w-full" /></CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (providersError) {
    return (
        <div className="container mx-auto py-10 px-4 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Error Loading Providers</h2>
            <p className="text-muted-foreground">{providersError || "Could not fetch game providers."}</p>
        </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
            <h1 className="text-3xl md:text-4xl font-bold">Game Providers</h1>
            <p className="text-muted-foreground mt-1">Explore games from your favorite software providers.</p>
        </div>
        {/* Optional: Link to a page about software providers if you have one */}
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-card border rounded-lg">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search providers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as any)}>
            <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="name_asc">Name (A-Z)</SelectItem>
                <SelectItem value="name_desc">Name (Z-A)</SelectItem>
                <SelectItem value="games_desc">Games (Most)</SelectItem>
                <SelectItem value="games_asc">Games (Fewest)</SelectItem>
            </SelectContent>
        </Select>
      </div>


      {filteredAndSortedProviders.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredAndSortedProviders.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
            <Gamepad2 className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
            <p className="text-xl text-muted-foreground">No providers match your search.</p>
            <p className="mt-2">Try a different search term or clear filters.</p>
        </div>
      )}
    </div>
  );
};

export default ProvidersPage;
