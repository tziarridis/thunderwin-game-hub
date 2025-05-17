import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Game, GameLaunchOptions } from "@/types"; // Added GameLaunchOptions
import { gamesDatabaseService } from "@/services/gamesDatabaseService";
import GameCard from "@/components/game/GameCard";
import { Skeleton } from "@/components/ui/skeleton";

const IndexPage = () => {
  const [trendingGames, setTrendingGames] = useState<Game[]>([]);
  const [newGames, setNewGames] = useState<Game[]>([]);
  const [jackpotGames, setJackpotGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { games, loading: gamesLoading, error: gamesError, launchGame } = useGames();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const fetchGamesData = async () => {
      try {
        setLoading(true);
        const trending = await gamesDatabaseService.getPopularGames(6);
        const newG = await gamesDatabaseService.getNewGames(6);
        const jackpot = games?.filter((game) => game.jackpot).slice(0, 6) || [];

        setTrendingGames(trending);
        setNewGames(newG);
        setJackpotGames(jackpot);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchGamesData();
  }, [games]);

  const handlePlayGame = async (selectedGame: Game) => {
    if (!isAuthenticated || !user) {
      toast.error("Please log in to play.");
      navigate("/login");
      return;
    }
    if (selectedGame) {
      try {
        const launchOptions: GameLaunchOptions = { // Explicitly type launchOptions
            mode: 'real',
            playerId: user.id,
            currency: user.currency || 'EUR',
            language: 'en',
            platform: 'web',
            returnUrl: window.location.href // Added default returnUrl
        };
        const gameUrl = await launchGame(selectedGame, launchOptions);
        if (gameUrl) {
          window.open(gameUrl, "_blank");
          toast.success(`Launching ${selectedGame.title}`);
        } else {
          toast.error("Could not launch game. Please try again.");
        }
      } catch (err) {
        toast.error(`Failed to launch game: ${(err as Error).message}`);
      }
    }
  };

  return (
    <div className="container mx-auto py-8">
      {error && (
        <div className="text-red-500 text-center mb-4">Error: {error}</div>
      )}

      {/* Trending Games Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Trending Games</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {loading ? (
            // Skeleton loaders while loading
            [...Array(6)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-[150px] w-full rounded-md" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))
          ) : trendingGames.length > 0 ? (
            // Display trending games
            trendingGames.map((game) => (
              <div key={game.id} className="relative">
                <GameCard game={game} />
                <div className="absolute bottom-2 left-2 w-full">
                  <Button onClick={() => game && handlePlayGame(game)} className="w-full bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black">Play Now</Button>
                </div>
              </div>
            ))
          ) : (
            // Message if no trending games
            <div className="text-gray-500 text-center">No trending games available.</div>
          )}
        </div>
      </section>

      {/* New Games Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">New Games</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {loading ? (
            // Skeleton loaders while loading
            [...Array(6)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-[150px] w-full rounded-md" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))
          ) : newGames.length > 0 ? (
            // Display new games
            newGames.map((game) => (
              <div key={game.id} className="relative">
                <GameCard game={game} />
                <div className="absolute bottom-2 left-2 w-full">
                  <Button onClick={() => game && handlePlayGame(game)} className="w-full bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black">Play Now</Button>
                </div>
              </div>
            ))
          ) : (
            // Message if no new games
            <div className="text-gray-500 text-center">No new games available.</div>
          )}
        </div>
      </section>

      {/* Jackpot Games Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Jackpot Games</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {loading ? (
            // Skeleton loaders while loading
            [...Array(6)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-[150px] w-full rounded-md" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))
          ) : jackpotGames.length > 0 ? (
            // Display jackpot games
            jackpotGames.map((game) => (
              <div key={game.id} className="relative">
                <GameCard game={game} />
                <div className="absolute bottom-2 left-2 w-full">
                  <Button onClick={() => game && handlePlayGame(game)} className="w-full bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black">Play Now</Button>
                </div>
              </div>
            ))
          ) : (
            // Message if no jackpot games
            <div className="text-gray-500 text-center">No jackpot games available.</div>
          )}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Play?</h2>
        <p className="text-gray-500 mb-8">
          Join our community and experience the thrill of online gaming.
        </p>
        <Link to="/register">
          <Button className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black">
            Get Started Now
          </Button>
        </Link>
      </section>
    </div>
  );
};

export default IndexPage;
