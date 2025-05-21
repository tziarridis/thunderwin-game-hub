
import React, { useState, useEffect, useMemo } from 'react';
import { useGames } from '@/hooks/useGames'; // Provides providers list
import { GameProvider } from '@/types'; // Provider type
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Search } from 'lucide-react';
// import ProviderFilters from '@/components/providers/ProviderFilters'; // Placeholder created
// import ProviderGrid from '@/components/providers/ProviderGrid'; // Placeholder created

const ProvidersPage = () => {
  const { providers, isLoading: isLoadingProviders } = useGames();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProviders = useMemo(() => {
    if (!providers) return [];
    return providers.filter(provider =>
      provider.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [providers, searchTerm]);

  if (isLoadingProviders && !providers?.length) {
    return (
      <div className="container mx-auto py-12 text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
        <p className="mt-4 text-muted-foreground">Loading providers...</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-foreground">Game Providers</h1>
        <p className="text-lg text-muted-foreground mt-2">Discover games from your favorite software providers.</p>
      </header>

      <div className="relative mb-8 max-w-md mx-auto">
        <Input
          type="search"
          placeholder="Search providers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 py-3 text-base bg-card border-border focus:ring-primary w-full"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      </div>

      {/* <ProviderFilters onFilterChange={...} /> */} {/* Placeholder component */}

      {filteredProviders.length === 0 && !isLoadingProviders && (
        <p className="text-center text-muted-foreground py-10 text-xl">
          No providers found matching "{searchTerm}".
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Replace with <ProviderGrid providers={filteredProviders} /> when implemented */}
        {filteredProviders.map((provider: GameProvider) => (
          <Link key={provider.id || provider.slug} to={`/casino/provider/${provider.slug || provider.id}`}>
            <Card className="hover:shadow-primary/20 transition-shadow h-full flex flex-col items-center justify-center text-center p-4 min-h-[150px]">
              <CardHeader className="p-2">
                {provider.logoUrl && (
                  <img src={provider.logoUrl} alt={`${provider.name} logo`} className="h-12 max-w-[150px] object-contain mx-auto mb-3"/>
                )}
                <CardTitle className="text-lg">{provider.name}</CardTitle>
              </CardHeader>
              {/* <CardContent className="p-2">
                {provider.description && <p className="text-xs text-muted-foreground line-clamp-2">{provider.description}</p>}
              </CardContent> */}
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProvidersPage;
