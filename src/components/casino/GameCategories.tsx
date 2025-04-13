
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Gamepad2, 
  Table2, 
  User, 
  Dice5, 
  Trophy, 
  Zap,
  Heart,
  Users
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
      path: "/casino/slots",
      bgImage: "https://images.unsplash.com/photo-1618264000431-0abab539eddd?w=300&h=300&fit=crop&q=80"
    },
    { 
      id: "table", 
      name: "Table Games", 
      icon: <Table2 className="h-5 w-5" />,
      path: "/casino/table-games",
      bgImage: "https://images.unsplash.com/photo-1604076913837-52ab5629fba9?w=300&h=300&fit=crop&q=80"
    },
    { 
      id: "live", 
      name: "Live Casino", 
      icon: <Users className="h-5 w-5" />,
      path: "/casino/live-casino",
      bgImage: "https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=300&h=300&fit=crop&q=80"
    },
    { 
      id: "crash", 
      name: "Crash Games", 
      icon: <Dice5 className="h-5 w-5" />,
      path: "/casino/crash",
      bgImage: "https://images.unsplash.com/photo-1636632520418-5c998226ec74?w=300&h=300&fit=crop&q=80"
    },
    { 
      id: "jackpot", 
      name: "Jackpots", 
      icon: <Trophy className="h-5 w-5" />,
      path: "/casino/jackpots",
      bgImage: "https://images.unsplash.com/photo-1605870445919-838d190e8e1b?w=300&h=300&fit=crop&q=80"
    },
    { 
      id: "new", 
      name: "New Games", 
      icon: <Zap className="h-5 w-5" />,
      path: "/casino/new",
      bgImage: "https://images.unsplash.com/photo-1594842352476-206733e9136c?w=300&h=300&fit=crop&q=80"
    },
    { 
      id: "favorites", 
      name: "Favorites", 
      icon: <Heart className="h-5 w-5" />,
      path: "/casino/favorites",
      bgImage: "https://images.unsplash.com/photo-1605870445919-83f8ef7f9197?w=300&h=300&fit=crop&q=80"
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
          className="thunder-card hover:border-casino-thunder-green/50 cursor-pointer transition-all overflow-hidden relative group"
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
          {/* Background Image with Overlay */}
          <div 
            className="absolute inset-0 w-full h-full bg-cover bg-center opacity-30 group-hover:opacity-40 transition-opacity duration-300"
            style={{ backgroundImage: `url(${category.bgImage})` }}
          />
          
          {/* Content */}
          <div className="relative z-10 p-4 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-casino-thunder-dark flex items-center justify-center mb-2 border border-white/10">
              {category.icon}
            </div>
            <h3 className="font-medium text-white">{category.name}</h3>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default GameCategories;
