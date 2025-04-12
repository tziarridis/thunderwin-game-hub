
import React from "react";

interface PopularProvidersProps {
  onProviderClick: (provider: string) => void;
}

const PopularProviders = ({ onProviderClick }: PopularProvidersProps) => {
  const providers = [
    { id: "pragmatic", name: "Pragmatic Play", logo: "/placeholder.svg" },
    { id: "netent", name: "NetEnt", logo: "/placeholder.svg" },
    { id: "playtech", name: "Playtech", logo: "/placeholder.svg" },
    { id: "microgaming", name: "Microgaming", logo: "/placeholder.svg" },
    { id: "evolution", name: "Evolution Gaming", logo: "/placeholder.svg" },
    { id: "blueprint", name: "Blueprint", logo: "/placeholder.svg" },
    { id: "playngo", name: "Play'n GO", logo: "/placeholder.svg" },
    { id: "quickspin", name: "Quickspin", logo: "/placeholder.svg" }
  ];
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
      {providers.map((provider) => (
        <div
          key={provider.id}
          className="thunder-card p-4 hover:border-casino-thunder-green/50 cursor-pointer flex flex-col items-center"
          onClick={() => onProviderClick(provider.id)}
        >
          <div className="w-16 h-16 flex items-center justify-center mb-2">
            <img 
              src={provider.logo} 
              alt={provider.name} 
              className="max-w-full max-h-full"
            />
          </div>
          <h3 className="text-sm text-center text-white/80">{provider.name}</h3>
        </div>
      ))}
    </div>
  );
};

export default PopularProviders;
