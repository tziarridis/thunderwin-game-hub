
import { useState } from "react";
import { Gamepad2, Search, Trophy, Zap, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import GameGrid from "@/components/games/GameGrid";
import { useNavigate } from "react-router-dom";

const CasinoMainPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  
  return (
    <div className="pt-8 pb-16 bg-casino-thunder-darker min-h-screen">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="relative rounded-2xl overflow-hidden mb-12">
          <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1562183241-b937e95585b6?auto=format&fit=crop&q=80&w=1200"
            alt="Casino Games" 
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 z-20 flex items-center">
            <div className="px-8 py-6 max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-white">
                Casino <span className="text-casino-thunder-green">Games</span>
              </h1>
              <p className="text-white/80 text-lg mb-6">
                Explore our complete selection of casino games. From slots to table games, live dealers to jackpots, we have everything a casino enthusiast could want!
              </p>
              <div className="flex flex-wrap gap-3">
                <Button 
                  className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black font-bold"
                  onClick={() => navigate('/casino/slots')}
                >
                  Play Slots
                </Button>
                <Button 
                  variant="outline" 
                  className="border-white/20 hover:border-white/40 hover:bg-white/5"
                  onClick={() => navigate('/casino/table-games')}
                >
                  Table Games
                </Button>
                <Button 
                  variant="outline" 
                  className="border-white/20 hover:border-white/40 hover:bg-white/5"
                  onClick={() => navigate('/casino/live-casino')}
                >
                  Live Casino
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Search and Filters */}
        <div className="mb-10 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-auto md:min-w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={18} />
            <Input
              type="text"
              placeholder="Search games..."
              className="pl-10 bg-casino-thunder-gray/50 border-white/10 focus:border-casino-thunder-green/70 rounded-lg py-6"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <Button variant="outline" className="whitespace-nowrap border-white/20 hover:border-casino-thunder-green/70">
              <Trophy size={16} className="mr-2" />
              Most Popular
            </Button>
            <Button variant="outline" className="whitespace-nowrap border-white/20 hover:border-casino-thunder-green/70">
              <Zap size={16} className="mr-2" />
              New Games
            </Button>
            <Button variant="outline" className="whitespace-nowrap border-white/20 hover:border-casino-thunder-green/70">
              <Heart size={16} className="mr-2" />
              Favorites
            </Button>
          </div>
        </div>
        
        {/* Game Categories */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-12">
          <CategoryCard 
            title="Slots" 
            icon={<Gamepad2 size={24} />} 
            onClick={() => navigate('/casino/slots')} 
          />
          <CategoryCard 
            title="Table Games" 
            icon={<Gamepad2 size={24} />} 
            onClick={() => navigate('/casino/table-games')} 
          />
          <CategoryCard 
            title="Live Casino" 
            icon={<Gamepad2 size={24} />} 
            onClick={() => navigate('/casino/live-casino')} 
          />
          <CategoryCard 
            title="Jackpots" 
            icon={<Trophy size={24} />} 
            onClick={() => navigate('/casino/jackpots')} 
          />
          <CategoryCard 
            title="Providers" 
            icon={<Zap size={24} />} 
            onClick={() => navigate('/casino/providers')} 
          />
          <CategoryCard 
            title="All Games" 
            icon={<Gamepad2 size={24} />} 
            isHighlighted={true}
            onClick={() => {}} 
          />
        </div>
        
        {/* Games Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Trophy className="mr-2 text-casino-thunder-green" />
            Featured Games
          </h2>
          <GameGrid />
        </div>
      </div>
    </div>
  );
};

interface CategoryCardProps {
  title: string;
  icon: React.ReactNode;
  isHighlighted?: boolean;
  onClick: () => void;
}

const CategoryCard = ({ title, icon, isHighlighted = false, onClick }: CategoryCardProps) => (
  <div
    onClick={onClick}
    className={`
      glass-card p-4 flex flex-col items-center justify-center cursor-pointer
      ${isHighlighted ? 'border-casino-thunder-green/30 bg-casino-thunder-green/5' : ''}
    `}
  >
    <div className={`
      w-12 h-12 rounded-full flex items-center justify-center mb-2
      ${isHighlighted ? 'bg-casino-thunder-green text-black' : 'bg-white/5 text-casino-thunder-green'}
    `}>
      {icon}
    </div>
    <span className="font-medium">{title}</span>
  </div>
);

export default CasinoMainPage;
