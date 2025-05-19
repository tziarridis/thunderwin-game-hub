
import React from 'react';
import { GameProvider } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom'; // If providers link to a details page

interface ProviderCardProps {
  provider: GameProvider;
}

const ProviderCard: React.FC<ProviderCardProps> = ({ provider }) => {
  return (
    <Link to={`/casino/provider/${provider.slug}`} className="block hover:shadow-lg transition-shadow rounded-lg">
      <Card className="overflow-hidden h-full flex flex-col">
        <CardHeader className="p-0 relative aspect-video">
          {provider.logo ? (
            <img 
              src={provider.logo} 
              alt={provider.name} 
              className="w-full h-full object-contain p-4 bg-muted" // object-contain to show full logo
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground text-sm">No Logo</span>
            </div>
          )}
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <CardTitle className="text-lg mb-1 truncate">{provider.name}</CardTitle>
          {/* <p className="text-xs text-muted-foreground capitalize">{provider.status}</p> */}
          {/* You can add more info like game count if available */}
        </CardContent>
      </Card>
    </Link>
  );
};

export default ProviderCard;
