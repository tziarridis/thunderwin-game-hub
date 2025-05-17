
import AppLayout from "@/components/layout/AppLayout";
import { Game } from "@/types";
// GameLaunchOptions removed as it's not directly used here, but in components
import CasinoMain from "./casino/CasinoMain";
import { useGames } from "@/hooks/useGames"; // Import useGames
import { useEffect } from "react";

const Index = () => {
  const { games, isLoading, fetchGamesAndProviders } = useGames(); // useGames hook

  useEffect(() => {
    fetchGamesAndProviders(); // Fetch games on mount
  }, [fetchGamesAndProviders]);


  if (isLoading) {
    return <AppLayout><div className="text-center p-8">Loading games...</div></AppLayout>;
  }
  
  // Example of how you might pass a specific game to a launcher if needed
  // const exampleGame = games.length > 0 ? games[0] : undefined;
  // const exampleLaunchOptions: GameLaunchOptions = { mode: 'demo' };

  return (
    <AppLayout>
      <CasinoMain />
      {/* 
        Example usage of a game launcher if you had one directly on this page:
        {exampleGame && (
          <GameLauncher game={exampleGame} options={exampleLaunchOptions} />
        )}
      */}
    </AppLayout>
  );
};

export default Index;

