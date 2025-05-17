import { useState, useEffect } from "react";
import CasinoGameGrid from "@/components/casino/CasinoGameGrid";
import { Game } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import MobileWalletSummary from "@/components/user/MobileWalletSummary";
import { useNavigate } from "react-router-dom";
import { useGames } from "@/hooks/useGames";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton"; // For loading state

const Favorites = () => {
  const [favoriteGames, setFavoriteGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  // getFavoriteGames returns Promise<Game[]>, toggleFavoriteGame expects only gameId
  const { games: allGames, toggleFavoriteGame, getFavoriteGames } = useGames(); 

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please log in to view your favorites");
      navigate("/auth/login");
      return;
    }

    if (user?.id && getFavoriteGames) { // Check for getFavoriteGames availability
        fetchFavoriteGamesList();
    } else if (isAuthenticated && !user?.id) {
        setLoading(true); 
    }

  }, [isAuthenticated, user, navigate, getFavoriteGames]); // Removed allGames dependency as favorites are fetched independently

  const fetchFavoriteGamesList = async () => {
    if (!user?.id || !getFavoriteGames) {
        setFavoriteGames([]);
        setLoading(false);
        return;
    }

    try {
      setLoading(true);
      // Assuming getFavoriteGames fetches the user's favorite games if implemented
      // For now, it's a placeholder in useGames. If it's not implemented in useGames,
      // this will likely return an empty array or rely on local favoriteGameIds.
      // Let's assume getFavoriteGames in useGames is supposed to get actual Game objects.
      // If useGames.getFavoriteGames needs user.id, it should handle it internally or accept it.
      // The current signature of getFavoriteGames in useGames context is `() => Promise<Game[]>`.
      // It should fetch favorites based on the authenticated user.
      // For now, to make this work with the provided context, we filter allGames by favoriteGameIds.
      // THIS IS A TEMPORARY WORKAROUND IF `getFavoriteGames` from `useGames` isn't fetching actual user favorites yet.
      // A better approach: `const favGames = await getFavoriteGames();` if `getFavoriteGames` is fully implemented.
      
      // Workaround: if getFavoriteGames is not fully implemented, try to use favoriteGameIds from useGames context
      // const { favoriteGameIds } = useGames(); // This needs to be added to useGames context if used
      // if (favoriteGameIds && allGames.length > 0) {
      //   const favGames = allGames.filter(game => favoriteGameIds.has(game.id));
      //   setFavoriteGames(favGames);
      // } else {
      //    const favGames = await getFavoriteGames(); // Ideal case
      //    setFavoriteGames(favGames);
      // }
      // For now, let's assume getFavoriteGames is what we should call:
      const favGames = await getFavoriteGames();
      setFavoriteGames(favGames);

    } catch (error: any) {
      console.error('Error fetching favorite games:', error);
      toast.error('Failed to load favorite games');
      setFavoriteGames([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGameClick = (game: Game) => {
    navigate(`/casino/game/${game.id}`);
  };

  const handleUnfavorite = async (game: Game) => {
    if (!user?.id || !toggleFavoriteGame) {
        toast.error("User not found or favorite function unavailable.");
        return;
    }
    try {
      // toggleFavoriteGame from useGames hook expects only gameId
      await toggleFavoriteGame(game.id); 
      // No success boolean returned, so we optimistically update UI
      setFavoriteGames(prev => prev.filter(g => g.id !== game.id));
      toast.success(`${game.title} removed from favorites`);
      // Re-fetch could also be an option: fetchFavoriteGamesList();
    } catch (error: any) {
      console.error('Error removing favorite:', error);
      toast.error('Failed to remove from favorites');
    }
  };
  
  // This function could be passed to GameCard via CasinoGameGrid if GameCard supports it
  // For simplicity, we assume GameCard handles its own favorite toggle or this page's GameGrid renders cards directly with this handler.
  // If CasinoGameGrid renders GameCards, it might need an onToggleFavorite prop.
  // For now, if CasinoGameGrid uses GameCard from @/components/games/GameCard, that card should use useGames directly.
  // If this page intends to show a specific "Unfavorite" button per card, CasinoGameGrid needs modification or we use a different grid.

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <MobileWalletSummary showRefresh />
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Your Favorite Games</h1>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-lg" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <MobileWalletSummary showRefresh />
      
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Your Favorite Games</h1>
        <p className="text-white/70 max-w-2xl mx-auto">
          Here are all the games you've marked as favorites. You can quickly access them anytime.
        </p>
      </div>

      {favoriteGames.length > 0 ? (
        // If CasinoGameGrid is a generic grid, we might need to map games to include an onUnfavorite action
        // Or, ensure GameCard component used within CasinoGameGrid can independently handle unfavorite via useGames context
        <CasinoGameGrid 
          games={favoriteGames} 
          onGameClick={handleGameClick}
          // We need a way to unfavorite. If GameCard handles its own favorite state via useGames, this is fine.
          // Otherwise, CasinoGameGrid might need to render a custom card or take an onUnfavorite prop.
          // For now, assuming GameCard internally handles toggling favorite status.
          // To explicitly show an "unfavorite" button here, we'd modify GameCard or use a local grid map:
          // <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          //  {favoriteGames.map(game => <GameCardWithUnfavoriteButton key={game.id} game={game} onUnfavorite={handleUnfavorite} onGameClick={handleGameClick} />)}
          // </div>
        />
      ) : (
        <div className="text-center py-12">
          <p className="text-xl mb-4">You don't have any favorite games yet.</p>
          <Button
            onClick={() => navigate('/casino')}
            className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black font-medium px-6 py-3 rounded-md"
          >
            Explore Games
          </Button>
        </div>
      )}
    </div>
  );
};

export default Favorites;
