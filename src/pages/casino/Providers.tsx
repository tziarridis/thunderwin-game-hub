
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, FilterX } from "lucide-react";
import { GameProvider } from "@/types";

const Providers = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  
  // Sample providers data with updated logos
  const providers: GameProvider[] = [
    {
      id: "1",
      name: "NetEnt",
      logo: "/provider-logos/netent.png",
      gamesCount: 150,
      isPopular: true,
      description: "NetEnt is a premium supplier of digitally distributed gaming systems used by some of the world's most successful online gaming operators.",
      featured: true
    },
    {
      id: "2",
      name: "Microgaming",
      logo: "/provider-logos/microgaming.png",
      gamesCount: 200,
      isPopular: true,
      description: "Microgaming pioneered online gaming in 1994, developing the first true online casino software.",
      featured: true
    },
    {
      id: "3",
      name: "Play'n GO",
      logo: "/provider-logos/playngo.png",
      gamesCount: 120,
      isPopular: true,
      description: "Play'n GO is a leading game developer and gaming platform provider for the online gambling industry.",
      featured: false
    },
    {
      id: "4",
      name: "Evolution Gaming",
      logo: "/provider-logos/evolution.png",
      gamesCount: 80,
      isPopular: true,
      description: "Evolution Gaming is a leading B2B live casino supplier to casino operators worldwide.",
      featured: true
    },
    {
      id: "5",
      name: "Pragmatic Play",
      logo: "/provider-logos/pragmatic.png",
      gamesCount: 180,
      isPopular: true,
      description: "Pragmatic Play is a leading content provider to the iGaming Industry, offering innovative, regulated, and mobile-focused products.",
      featured: false
    },
    {
      id: "6",
      name: "Yggdrasil",
      logo: "/provider-logos/yggdrasil.png",
      gamesCount: 90,
      isPopular: true,
      description: "Yggdrasil is a provider of superior online gaming solutions for igaming operators.",
      featured: true
    },
    {
      id: "7",
      name: "Quickspin",
      logo: "/provider-logos/quickspin.png",
      gamesCount: 70,
      isPopular: false,
      description: "Quickspin is a Swedish game studio developing innovative video slots for real money online gambling.",
      featured: false
    },
    {
      id: "8",
      name: "Betsoft",
      logo: "/provider-logos/betsoft.png",
      gamesCount: 110,
      isPopular: false,
      description: "Betsoft Gaming is a developer of innovative casino games and gaming solutions for the global iGaming industry.",
      featured: false
    },
  ];
  
  const filteredProviders = searchText.trim() === "" 
    ? providers 
    : providers.filter(provider => 
        provider.name.toLowerCase().includes(searchText.toLowerCase()) ||
        provider.description?.toLowerCase().includes(searchText.toLowerCase())
      );
  
  const handleClearSearch = () => {
    setSearchText("");
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Game Providers</h1>
        <p className="text-white/70 max-w-2xl mx-auto">
          Discover games from the world's best software providers. Each with their unique style and gaming experience.
        </p>
      </div>
      
      <div className="relative mb-8">
        <Input
          type="text"
          placeholder="Search providers..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="pl-10 py-6 bg-casino-thunder-gray/30 border-white/10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        {searchText && (
          <Button 
            variant="ghost" 
            className="absolute right-2 top-1/2 transform -translate-y-1/2" 
            onClick={handleClearSearch}
          >
            <FilterX size={18} />
          </Button>
        )}
      </div>
      
      {/* Featured Providers Section */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-6 thunder-glow">Featured Providers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers
            .filter(provider => provider.featured)
            .map(provider => (
              <Card 
                key={provider.id} 
                className="bg-casino-thunder-gray/30 border border-white/10 hover:border-casino-thunder-green transition-colors overflow-hidden"
              >
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-white/10 p-3 rounded-md mr-4">
                      <img src={provider.logo} alt={provider.name} className="h-12 w-12 object-contain" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{provider.name}</h3>
                      <p className="text-sm text-white/70">{provider.gamesCount} Games</p>
                    </div>
                  </div>
                  <p className="text-sm text-white/70 mb-4 line-clamp-3">{provider.description}</p>
                  <Button 
                    className="w-full bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
                    onClick={() => navigate(`/casino/provider/${provider.id}`)}
                  >
                    View Games
                  </Button>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
      
      {/* All Providers Section */}
      <h2 className="text-2xl font-bold mb-6 thunder-glow">All Providers</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredProviders.map(provider => (
          <Card 
            key={provider.id}
            className="bg-casino-thunder-gray/30 border border-white/10 hover:border-casino-thunder-green transition-colors"
            onClick={() => navigate(`/casino/provider/${provider.id}`)}
          >
            <CardContent className="p-4 flex items-center cursor-pointer">
              <div className="bg-white/10 p-2 rounded-md mr-3">
                <img src={provider.logo} alt={provider.name} className="h-10 w-10 object-contain" />
              </div>
              <div>
                <h3 className="font-medium">{provider.name}</h3>
                <p className="text-xs text-white/70">{provider.gamesCount} Games</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredProviders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-xl mb-4">No providers match your search criteria.</p>
          <Button 
            variant="outline" 
            className="border-casino-thunder-green text-casino-thunder-green"
            onClick={handleClearSearch}
          >
            Clear Search
          </Button>
        </div>
      )}
    </div>
  );
};

export default Providers;
