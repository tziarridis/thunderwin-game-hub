
import PlaceholderPage from "@/components/PlaceholderPage";
import { CircleDollarSign } from "lucide-react";

const BasketballPage = () => {
  return (
    <PlaceholderPage 
      title="Basketball Betting" 
      description="Bet on NBA, Euroleague, and other basketball competitions from around the world. We offer pre-match and live betting options with competitive odds."
      icon={<CircleDollarSign size={40} />}
    />
  );
};

export default BasketballPage;
