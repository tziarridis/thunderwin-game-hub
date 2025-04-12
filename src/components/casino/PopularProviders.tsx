
import React from "react";

interface PopularProvidersProps {
  onProviderClick: (provider: string) => void;
}

const PopularProviders = ({ onProviderClick }: PopularProvidersProps) => {
  const providers = [
    { id: "pragmatic", name: "Pragmatic Play", logo: "/provider-logos/pragmatic.png" },
    { id: "netent", name: "NetEnt", logo: "/provider-logos/netent.png" },
    { id: "playtech", name: "Playtech", logo: "/provider-logos/playtech.png" },
    { id: "microgaming", name: "Microgaming", logo: "/provider-logos/microgaming.png" },
    { id: "evolution", name: "Evolution Gaming", logo: "/provider-logos/evolution.png" },
    { id: "blueprint", name: "Blueprint", logo: "/provider-logos/blueprint.png" },
    { id: "playngo", name: "Play'n GO", logo: "/provider-logos/playngo.png" },
    { id: "quickspin", name: "Quickspin", logo: "/provider-logos/quickspin.png" }
  ];
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
      {providers.map((provider) => (
        <div
          key={provider.id}
          className="thunder-card p-4 hover:border-casino-thunder-green/50 cursor-pointer flex flex-col items-center"
          onClick={() => onProviderClick(provider.id)}
        >
          <div className="w-16 h-16 flex items-center justify-center mb-2 bg-white/5 rounded-full p-2">
            <img 
              src={provider.logo} 
              alt={provider.name} 
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <h3 className="text-sm text-center text-white/80">{provider.name}</h3>
        </div>
      ))}
    </div>
  );
};

export default PopularProviders;
