
import PlaceholderPage from "@/components/PlaceholderPage";
import { CircleDollarSign } from "lucide-react";

const HockeyPage = () => {
  return (
    <PlaceholderPage 
      title="Hockey Betting" 
      description="Bet on NHL, KHL, and other hockey leagues from around the world. Place pre-match and live bets on your favorite hockey teams and events."
      icon={<CircleDollarSign size={40} />}
    />
  );
};

export default HockeyPage;
