
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ExtendedGameProvider } from '@/types/extended';

interface ProviderCardProps {
  provider: ExtendedGameProvider;
  onClick?: () => void;
}

const ProviderCard: React.FC<ProviderCardProps> = ({ provider, onClick }) => {
  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          {(provider.logo || provider.logoUrl) && (
            <img
              src={provider.logo || provider.logoUrl}
              alt={provider.name}
              className="w-12 h-12 object-contain"
            />
          )}
          <div>
            <h3 className="font-semibold">{provider.name}</h3>
            {provider.description && (
              <p className="text-sm text-muted-foreground">{provider.description}</p>
            )}
            {provider.gamesCount && (
              <p className="text-xs text-muted-foreground">{provider.gamesCount} games</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProviderCard;
