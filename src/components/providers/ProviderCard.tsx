
import React from 'react';
import { GameProvider } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface ProviderCardProps {
  provider: GameProvider;
  onSelectProvider?: (provider: GameProvider) => void;
  className?: string;
}

const ProviderCard: React.FC<ProviderCardProps> = ({ provider, onSelectProvider, className }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (onSelectProvider) {
      onSelectProvider(provider);
    } else {
      // Fallback navigation if no handler is provided
      navigate(`/casino/providers/${provider.slug}`);
    }
  };

  return (
    <Card 
      className={cn(
        "overflow-hidden shadow-lg hover:shadow-primary/30 transition-all duration-300 group cursor-pointer bg-card",
        className
      )}
      onClick={handleCardClick}
    >
      <CardContent className="p-4 flex flex-col items-center text-center">
        <div className="w-20 h-20 mb-4 rounded-full overflow-hidden border-2 border-transparent group-hover:border-primary transition-colors flex items-center justify-center bg-muted">
          {(provider.logo_url || provider.logo) ? (
            <img 
              src={provider.logo_url || provider.logo} 
              alt={`${provider.name} logo`} 
              className="w-full h-full object-contain"
              onError={(e) => (e.currentTarget.style.display = 'none')} // Hide if image fails
            />
          ) : (
            <span className="text-2xl font-bold text-muted-foreground">
              {provider.name.substring(0, 2).toUpperCase()}
            </span>
          )}
        </div>
        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors truncate w-full" title={provider.name}>
          {provider.name}
        </h3>
        {/* Optional: Display game count if available */}
        {provider.gamesCount !== undefined && (
          <p className="text-sm text-muted-foreground">{provider.gamesCount} games</p>
        )}
      </CardContent>
    </Card>
  );
};

export default ProviderCard;
