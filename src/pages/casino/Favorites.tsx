import React, { useState, useEffect, useCallback } from 'react';
import { Game } from '@/types';
import { useGames } from '@/hooks/useGames';
import GameList from '@/components/games/GameList';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import MobileWalletSummary from '@/components/user/MobileWalletSummary'; // Ensure this is imported

const FavoritesPage = () => {
  const { user, isAuthenticated, refreshWalletBalance } = useAuth();
  const { getFavoriteGames, isLoading: gamesLoading, favoriteGameIds, toggleFavoriteGame } = useGames();
  const [favoriteGames, setFavoriteGames] = useState<Game[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const navigate = useNavigate();

  const fetchFavorites = useCallback(async () => {
    if (isAuthenticated && user) {
      setLoadingFavorites(true);
      try {
        const favs = await getFavoriteGames(); // This is from useGames, already maps DbGame to Game
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
  }, [fetchFavorites, favoriteGameIds]); // Re-fetch if favoriteGameIds change (e.g. after toggle)

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

  const isLoading = gamesLoading || loadingFavorites;


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
          onRefresh={handleRefreshWallet}
        />
      </div>
      
      {isLoading ? (
        <p>Loading favorite games...</p>
      ) : favoriteGames.length > 0 ? (
        <GameList games={favoriteGames} />
      ) : (
        <div className="text-center py-10">
          <p className="text-xl text-muted-foreground">You haven't added any games to your favorites yet.</p>
          <p className="mt-2">Explore our games and click the heart icon to save them here!</p>
          <Button onClick={() => navigate('/casino/main')} className="mt-4">Explore Games</Button>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
