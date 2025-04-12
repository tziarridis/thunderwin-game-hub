
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Gamepad2, 
  Table2, 
  User, 
  Dice5, 
  Trophy, 
  Zap,
  Heart
} from "lucide-react";

interface GameCategoriesProps {
  onCategoryClick: (category: string) => void;
}

const GameCategories = ({ onCategoryClick }: GameCategoriesProps) => {
  const categories = [
    { id: "slots", name: "Slot Games", icon: <Gamepad2 className="h-5 w-5" /> },
    { id: "table", name: "Table Games", icon: <Table2 className="h-5 w-5" /> },
    { id: "live", name: "Live Casino", icon: <User className="h-5 w-5" /> },
    { id: "crash", name: "Crash Games", icon: <Dice5 className="h-5 w-5" /> },
    { id: "jackpot", name: "Jackpots", icon: <Trophy className="h-5 w-5" /> },
    { id: "new", name: "New Games", icon: <Zap className="h-5 w-5" /> },
    { id: "favorites", name: "Favorites", icon: <Heart className="h-5 w-5" /> }
  ];
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
      {categories.map((category) => (
        <div 
          key={category.id}
          className="thunder-card hover:border-casino-thunder-green/50 cursor-pointer transition-all p-4 flex flex-col items-center text-center"
          onClick={() => onCategoryClick(category.id)}
        >
          <div className="w-12 h-12 rounded-full bg-casino-thunder-dark flex items-center justify-center mb-2">
            {category.icon}
          </div>
          <h3 className="font-medium text-white">{category.name}</h3>
        </div>
      ))}
    </div>
  );
};

export default GameCategories;
