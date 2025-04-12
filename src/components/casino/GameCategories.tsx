
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
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface GameCategoriesProps {
  onCategoryClick: (category: string) => void;
}

const GameCategories = ({ onCategoryClick }: GameCategoriesProps) => {
  const navigate = useNavigate();
  
  const categories = [
    { 
      id: "slots", 
      name: "Slot Games", 
      icon: <Gamepad2 className="h-5 w-5" />,
      path: "/casino/slots"
    },
    { 
      id: "table", 
      name: "Table Games", 
      icon: <Table2 className="h-5 w-5" />,
      path: "/casino/table-games"
    },
    { 
      id: "live", 
      name: "Live Casino", 
      icon: <User className="h-5 w-5" />,
      path: "/casino/live-casino"
    },
    { 
      id: "crash", 
      name: "Crash Games", 
      icon: <Dice5 className="h-5 w-5" />,
      path: "/casino/crash"
    },
    { 
      id: "jackpot", 
      name: "Jackpots", 
      icon: <Trophy className="h-5 w-5" />,
      path: "/casino/jackpots"
    },
    { 
      id: "new", 
      name: "New Games", 
      icon: <Zap className="h-5 w-5" />,
      path: "/casino/new"
    },
    { 
      id: "favorites", 
      name: "Favorites", 
      icon: <Heart className="h-5 w-5" />,
      path: "/casino/favorites"
    }
  ];
  
  const handleCategoryClick = (category: string, path: string) => {
    onCategoryClick(category);
    navigate(path);
  };
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
      {categories.map((category, index) => (
        <motion.div 
          key={category.id}
          className="thunder-card hover:border-casino-thunder-green/50 cursor-pointer transition-all p-4 flex flex-col items-center text-center"
          onClick={() => handleCategoryClick(category.id, category.path)}
          whileHover={{ 
            scale: 1.05,
            borderColor: 'rgba(0, 255, 170, 0.5)',
            boxShadow: '0 0 8px rgba(0, 255, 170, 0.3)'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            transition: { delay: index * 0.1, duration: 0.3 }
          }}
        >
          <div className="w-12 h-12 rounded-full bg-casino-thunder-dark flex items-center justify-center mb-2 border border-white/10">
            {category.icon}
          </div>
          <h3 className="font-medium text-white">{category.name}</h3>
        </motion.div>
      ))}
    </div>
  );
};

export default GameCategories;
