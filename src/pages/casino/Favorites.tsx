
import React, { useState, useEffect, useCallback } from 'react';
import { Game } from '@/types';
import { useGames } from '@/hooks/useGames';
import GamesGrid from '@/components/games/GamesGrid';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import MobileWalletSummary from '@/components/user/MobileWalletSummary';
import { toast } from 'sonner';

const FavoritesPage = () => {
  const { user, isAuthenticated, refreshWalletBalance } = useAuth();
  const { getFavoriteGames, isLoadingGames, favoriteGameIds, toggleFavoriteGame } = useGames();
  const [favoriteGames, setFavoriteGames] = useState<Game[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchFavorites = useCallback(async () => {
    if (isAuthenticated && user) {
      setLoadingFavorites(true);
      setError(null);
      try {
        const favs = await getFavoriteGames();
        setFavoriteGames(favs);
      } catch (err) {
        console.error("Failed to fetch favorite games:", err);
        setError("Could not load favorite games. Please try again later.");
        toast.error("Failed to load favorite games");
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
  }, [fetchFavorites, favoriteGameIds]);

  const handleRefreshWallet = async () => {
    if (refreshWalletBalance) {
      await refreshWalletBalance();
    }
  };
  
  const handlePlayGame = useCallback((game: Game) => {
    navigate(`/casino/game/${game.slug || game.id}`);
  }, [navigate]);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-3xl font-bold mb-4">My Favorite Games</h1>
        <p className="text-muted-foreground mb-6">Please log in to see your favorite games.</p>
        <Button onClick={() => navigate('/login')}>Go to Login</Button>
      </div>
    );
  }

  const isLoading = isLoadingGames || loadingFavorites;

  return (
    <div className="container mx-auto py-8 px-4">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>
      <h1 className="text-3xl font-bold mb-2">My Favorite Games</h1>
      <p className="text-muted-foreground mb-6">Here are the games you've marked as favorites.</p>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <Button variant="outline" size="sm" onClick={fetchFavorites} className="mt-2">
            Retry
          </Button>
        </div>
      )}

      <div className="md:hidden mb-6">
        <MobileWalletSummary 
          user={user}
          wallet={user?.wallet}
          showRefresh={true} 
          onRefresh={handleRefreshWallet}
        />
      </div>
      
      <GamesGrid
        games={favoriteGames}
        loading={isLoading}
        onGameClick={handlePlayGame}
        emptyMessage="You haven't added any games to your favorites yet. Explore our games and click the heart icon to save them here!"
      />
    </div>
  );
};

export default FavoritesPage;
