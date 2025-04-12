
import PlaceholderPage from "@/components/PlaceholderPage";
import { Monitor } from "lucide-react";

const EsportsPage = () => {
  return (
    <PlaceholderPage 
      title="eSports Betting" 
      description="Bet on popular eSports competitions including CSGO, Dota 2, League of Legends, and more. Follow your favorite teams and place bets on matches and tournaments."
      icon={<Monitor size={40} />}
    />
  );
};

export default EsportsPage;
