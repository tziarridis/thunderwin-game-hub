
import { useState } from "react";
import GameCard from "./GameCard";
import { Button } from "@/components/ui/button";
import { 
  Gamepad2, 
  User, 
  Table2, 
  Dice5, 
  Search,
  Wallet,
  Zap
} from "lucide-react";

const GameGrid = () => {
  const [activeCategory, setActiveCategory] = useState("popular");

  return (
    <div className="py-8">
      {/* Game Categories */}
      <div className="mb-8 overflow-x-auto flex gap-2 pb-2">
        <CategoryButton 
          icon={<Zap size={16} />}
          name="Popular" 
          isActive={activeCategory === "popular"} 
          onClick={() => setActiveCategory("popular")}
        />
        <CategoryButton 
          icon={<Gamepad2 size={16} />}
          name="Slots" 
          isActive={activeCategory === "slots"} 
          onClick={() => setActiveCategory("slots")}
        />
        <CategoryButton 
          icon={<User size={16} />}
          name="Live Dealers" 
          isActive={activeCategory === "live"} 
          onClick={() => setActiveCategory("live")}
        />
        <CategoryButton 
          icon={<Table2 size={16} />}
          name="Table Games" 
          isActive={activeCategory === "table"} 
          onClick={() => setActiveCategory("table")}
        />
        <CategoryButton 
          icon={<Dice5 size={16} />}
          name="Crash Games" 
          isActive={activeCategory === "crash"} 
          onClick={() => setActiveCategory("crash")}
        />
        <CategoryButton 
          icon={<Wallet size={16} />}
          name="Jackpots" 
          isActive={activeCategory === "jackpot"} 
          onClick={() => setActiveCategory("jackpot")}
        />
      </div>
      
      {/* Search Bar */}
      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        <input
          type="search"
          className="thunder-input w-full pl-10"
          placeholder="Search games..."
        />
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        <GameCard 
          title="Lightning Roulette" 
          image="https://images.unsplash.com/photo-1531059224353-8e56cd9eb9b2?auto=format&fit=crop&q=80&w=400"
          provider="Evolution Gaming"
          isPopular={true}
        />
        <GameCard 
          title="Book of Dead" 
          image="https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&q=80&w=400"
          provider="Play'n GO"
          isPopular={true}
        />
        <GameCard 
          title="Sweet Bonanza" 
          image="https://images.unsplash.com/photo-1586899028174-e7098604235b?auto=format&fit=crop&q=80&w=400"
          provider="Pragmatic Play"
          isNew={true}
        />
        <GameCard 
          title="Mega Fortune" 
          image="https://images.unsplash.com/photo-1611159063981-b8c8c4301869?auto=format&fit=crop&q=80&w=400"
          provider="NetEnt"
        />
        <GameCard 
          title="Gonzo's Quest" 
          image="https://images.unsplash.com/photo-1594842084112-0e399ef9754b?auto=format&fit=crop&q=80&w=400"
          provider="NetEnt"
        />
        <GameCard 
          title="Starburst" 
          image="https://images.unsplash.com/photo-1634368949489-91a7977de894?auto=format&fit=crop&q=80&w=400"
          provider="NetEnt"
          isPopular={true}
        />
        <GameCard 
          title="Crazy Time" 
          image="https://images.unsplash.com/photo-1629784575520-7ab3e4a2fa7a?auto=format&fit=crop&q=80&w=400"
          provider="Evolution Gaming"
          isNew={true}
        />
        <GameCard 
          title="Gates of Olympus" 
          image="https://images.unsplash.com/photo-1533709752211-118fcaf03312?auto=format&fit=crop&q=80&w=400"
          provider="Pragmatic Play"
        />
        <GameCard 
          title="Wolf Gold" 
          image="https://images.unsplash.com/photo-1616616839508-0fd2f3b9fa5a?auto=format&fit=crop&q=80&w=400"
          provider="Pragmatic Play"
        />
        <GameCard 
          title="Monopoly Live" 
          image="https://images.unsplash.com/photo-1604871000636-074fa5117945?auto=format&fit=crop&q=80&w=400"
          provider="Evolution Gaming"
          isPopular={true}
        />
        <GameCard 
          title="Reactoonz" 
          image="https://images.unsplash.com/photo-1614128418646-a0f6c549da93?auto=format&fit=crop&q=80&w=400"
          provider="Play'n GO"
        />
        <GameCard 
          title="Big Bass Bonanza" 
          image="https://images.unsplash.com/photo-1560953814-e638733735af?auto=format&fit=crop&q=80&w=400"
          provider="Pragmatic Play"
          isNew={true}
        />
      </div>

      {/* Load More Button */}
      <div className="text-center mt-10">
        <Button variant="outline" className="min-w-[200px]">
          Load More Games
        </Button>
      </div>
    </div>
  );
};

const CategoryButton = ({ 
  icon, 
  name, 
  isActive, 
  onClick 
}: { 
  icon: React.ReactNode; 
  name: string; 
  isActive: boolean; 
  onClick: () => void;
}) => (
  <Button
    variant={isActive ? "default" : "outline"}
    className={`flex items-center shrink-0 ${
      isActive 
        ? "bg-casino-thunder-green text-black hover:bg-casino-thunder-highlight" 
        : "hover:text-casino-thunder-green"
    }`}
    onClick={onClick}
  >
    <span className="mr-2">{icon}</span>
    {name}
  </Button>
);

export default GameGrid;
