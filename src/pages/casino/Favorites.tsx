
import React, { useState, useEffect, useCallback } from 'react';
import { Game } from '@/types';
import { useGames } from '@/hooks/useGames';
import GamesGrid from '@/components/games/GamesGrid'; // Changed from GameList to GamesGrid
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react'; // Removed RefreshCw as it's handled in MobileWalletSummary
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import MobileWalletSummary from '@/components/user/MobileWalletSummary';

const FavoritesPage = () => {
  const { user, isAuthenticated, refreshWalletBalance } = useAuth();
  const { getFavoriteGames, isLoading: gamesLoadingContext, favoriteGameIds, toggleFavoriteGame } = useGames();
  const [favoriteGames, setFavoriteGames] = useState<Game[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const navigate = useNavigate();

  const fetchFavorites = useCallback(async () => {
    if (isAuthenticated && user) {
      setLoadingFavorites(true);
      try {
        // getFavoriteGames already maps DbGame to Game if necessary internally
        const favs = await getFavoriteGames(); 
        setFavoriteGames(favs);
      } catch (error) {
        console.error("Failed to fetch favorite games:", error);
        // Handle error (e.g., show toast)
      } finally {
        setLoadingFavorites(false);
      }
    } else {
      setFavoriteGames([]);
      setLoadingFavorites(false);
    }
  }, [isAuthenticated, user, getFavoriteGames]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites, favoriteGameIds]); // Re-fetch if favoriteGameIds change

  const handleRefreshWallet = async () => {
    if (refreshWalletBalance) {
      await refreshWalletBalance();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-3xl font-bold mb-4">My Favorite Games</h1>
        <p className="text-muted-foreground mb-6">Please log in to see your favorite games.</p>
        <Button onClick={() => navigate('/auth/login')}>Go to Login</Button>
      </div>
    );
  }

  const isLoading = gamesLoadingContext || loadingFavorites;


  return (
    <div className="container mx-auto py-8 px-4">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>
      <h1 className="text-3xl font-bold mb-2">My Favorite Games</h1>
      <p className="text-muted-foreground mb-6">Here are the games you've marked as favorites.</p>

      <div className="md:hidden mb-6">
        <MobileWalletSummary 
          user={user}
          showRefresh={true} 
          onRefresh={handleRefreshWallet} // onRefresh is handled by MobileWalletSummary now or uses context
        />
      </div>
      
      <GamesGrid
        games={favoriteGames}
        loading={isLoading}
        emptyMessage="You haven't added any games to your favorites yet. Explore our games and click the heart icon to save them here!"
      />
      {/* Custom empty state message handled by GamesGrid, but if more complex UI needed: */}
      {!isLoading && favoriteGames.length === 0 && (
         <div className="text-center py-10">
          {/* This part is somewhat redundant if GamesGrid handles emptyMessage well */}
          <Button onClick={() => navigate('/casino/main')} className="mt-4">Explore Games</Button>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
