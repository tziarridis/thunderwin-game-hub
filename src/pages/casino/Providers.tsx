
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Gamepad2, Search } from "lucide-react";
import { GameProvider } from "@/types";

const Providers: React.FC = () => {
  const [providers, setProviders] = useState<GameProvider[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchProviders = async () => {
      setLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        const mockProviders: GameProvider[] = [
          {
            id: "provider-1",
            name: "Evolution Gaming",
            logo: "https://via.placeholder.com/150x80?text=Evolution",
            gameCount: 120,
            featured: true,
            description: "Leading provider of live casino solutions"
          },
          {
            id: "provider-2",
            name: "NetEnt",
            logo: "https://via.placeholder.com/150x80?text=NetEnt",
            gameCount: 200,
            featured: true,
            description: "Premium gaming solutions since 1996"
          },
          {
            id: "provider-3",
            name: "Pragmatic Play",
            logo: "https://via.placeholder.com/150x80?text=Pragmatic",
            gameCount: 180,
            featured: true,
            description: "Multi-product content provider"
          },
          {
            id: "provider-4",
            name: "Play'n GO",
            logo: "https://via.placeholder.com/150x80?text=PlaynGO",
            gameCount: 150,
            featured: false,
            description: "Mobile-first gaming developer"
          },
          {
            id: "provider-5",
            name: "Yggdrasil",
            logo: "https://via.placeholder.com/150x80?text=Yggdrasil",
            gameCount: 90,
            featured: false,
            description: "Superior gaming experience"
          },
          {
            id: "provider-6",
            name: "Microgaming",
            logo: "https://via.placeholder.com/150x80?text=Microgaming",
            gameCount: 250,
            featured: true,
            description: "Pioneer in online gaming"
          },
          {
            id: "provider-7",
            name: "Betsoft",
            logo: "https://via.placeholder.com/150x80?text=Betsoft",
            gameCount: 110,
            featured: false,
            description: "3D cinematic games"
          },
          {
            id: "provider-8",
            name: "Red Tiger",
            logo: "https://via.placeholder.com/150x80?text=RedTiger",
            gameCount: 80,
            featured: false,
            description: "Daily jackpots leader"
          }
        ];
        
        setProviders(mockProviders);
        setLoading(false);
      }, 1000);
    };
    
    fetchProviders();
  }, []);
  
  const filteredProviders = providers.filter(provider => 
    provider.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const featuredProviders = filteredProviders.filter(provider => provider.featured);
  const regularProviders = filteredProviders.filter(provider => !provider.featured);
  
  const handleProviderClick = (providerId: string) => {
    navigate(`/casino?provider=${providerId}`);
  };
  
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-casino-thunder-green"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Game Providers</h1>
      
      <div className="mb-8">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="search"
            className="thunder-input w-full pl-10"
            placeholder="Search providers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {featuredProviders.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Gamepad2 className="w-5 h-5 mr-2 text-casino-thunder-green" />
            Featured Providers
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredProviders.map(provider => (
              <div 
                key={provider.id} 
                className="thunder-card p-4 hover:bg-white/5 cursor-pointer transition-colors"
                onClick={() => handleProviderClick(provider.id)}
              >
                <div className="bg-white/5 h-20 flex items-center justify-center rounded-lg mb-4">
                  <img 
                    src={provider.logo} 
                    alt={provider.name} 
                    className="max-h-16 max-w-full"
                  />
                </div>
                
                <h3 className="font-bold text-lg mb-1">{provider.name}</h3>
                
                <div className="flex justify-between items-center text-white/70 text-sm">
                  <span>{provider.gameCount} Games</span>
                  <span className="text-casino-thunder-green">Featured</span>
                </div>
                
                {provider.description && (
                  <p className="mt-2 text-sm text-white/70 line-clamp-2">{provider.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {regularProviders.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">All Providers</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {regularProviders.map(provider => (
              <div 
                key={provider.id} 
                className="thunder-card p-4 hover:bg-white/5 cursor-pointer transition-colors"
                onClick={() => handleProviderClick(provider.id)}
              >
                <div className="bg-white/5 h-20 flex items-center justify-center rounded-lg mb-4">
                  <img 
                    src={provider.logo} 
                    alt={provider.name} 
                    className="max-h-16 max-w-full"
                  />
                </div>
                
                <h3 className="font-bold text-lg mb-1">{provider.name}</h3>
                
                <div className="text-white/70 text-sm">
                  <span>{provider.gameCount} Games</span>
                </div>
                
                {provider.description && (
                  <p className="mt-2 text-sm text-white/70 line-clamp-2">{provider.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {filteredProviders.length === 0 && (
        <div className="thunder-card p-8 text-center">
          <p className="text-white/70 mb-4">No providers found matching "{searchQuery}"</p>
          <button 
            className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-white px-4 py-2 rounded-md"
            onClick={() => setSearchQuery("")}
          >
            Clear Search
          </button>
        </div>
      )}
    </div>
  );
};

export default Providers;
