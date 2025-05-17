
import AppLayout from "@/components/layout/AppLayout";
import { useGames } from "@/hooks/useGames";
import CasinoMain from "./casino/CasinoMain";
import { useEffect } from "react";

const Index = () => {
  const { games, isLoading, fetchGamesAndProviders } = useGames();

  useEffect(() => {
    fetchGamesAndProviders();
  }, [fetchGamesAndProviders]);

  return (
    <AppLayout>
      {isLoading ? (
        <div className="text-center p-8">Loading games...</div>
      ) : (
        <CasinoMain />
      )}
    </AppLayout>
  );
};

export default Index;
