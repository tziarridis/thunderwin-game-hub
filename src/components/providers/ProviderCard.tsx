
import React from 'react';
import { GameProvider } from '@/types'; // Using the new GameProvider type
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { useNavigate } from 'react-router-dom';

interface ProviderCardProps {
  provider: GameProvider;
  className?: string;
}

const ProviderCard: React.FC<ProviderCardProps> = ({ provider, className }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    // Navigate to a page displaying games by this provider, e.g., /casino/providers/provider-slug
    if (provider.slug) {
      navigate(`/casino/providers/${provider.slug}`);
    } else {
      // Fallback or error if slug is not available
      console.warn(`Provider ${provider.name} does not have a slug.`);
    }
  };

  return (
    <Card 
      className={`overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer group ${className}`}
      onClick={handleClick}
    >
      <CardHeader className="p-0">
        <AspectRatio ratio={16 / 9} className="bg-muted">
          {provider.logo ? (
            <img
              src={provider.logo}
              alt={`${provider.name} logo`}
              className="object-contain w-full h-full p-4 transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-muted-foreground text-sm">{provider.name}</span>
            </div>
          )}
        </AspectRatio>
      </CardHeader>
      <CardContent className="p-4 text-center">
        <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
          {provider.name}
        </CardTitle>
        {provider.game_count !== undefined && (
          <p className="text-sm text-muted-foreground">{provider.game_count} games</p>
        )}
      </CardContent>
    </Card>
  );
};

export default ProviderCard;

