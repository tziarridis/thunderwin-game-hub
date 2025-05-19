
import React, { useEffect } from 'react';
import { useGames } from '@/hooks/useGames';
import ProviderCard from '@/components/providers/ProviderCard'; // Ensure this path is correct
import { GameProvider } from '@/types';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state

const ProvidersPage = () => {
  const { providers, isLoading, fetchGamesAndProviders } = useGames();

  useEffect(() => {
    // Fetch fresh data if providers list is empty or stale
    if (providers.length === 0 && !isLoading) {
      fetchGamesAndProviders();
    }
  }, [providers, isLoading, fetchGamesAndProviders]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Game Providers</h1>
      
      {isLoading && providers.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      ) : providers.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {providers
            .filter(p => p.status === 'active') // Optionally filter for active providers
            .map((provider: GameProvider) => (
              <ProviderCard key={provider.id} provider={provider} />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground mt-8">No game providers available at the moment.</p>
      )}
    </div>
  );
};

export default ProvidersPage;
