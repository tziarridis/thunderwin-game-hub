
import React from 'react';
import { GameProvider } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

interface ProviderCardProps {
  provider: GameProvider;
  className?: string;
  onSelectProvider?: (slug: string) => void;
}

const ProviderCard: React.FC<ProviderCardProps> = ({ provider, className, onSelectProvider }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onSelectProvider) {
      onSelectProvider(provider.slug);
    } else {
      navigate(`/casino/provider/${provider.slug}`);
    }
  };

  return (
    <Card 
      className={`overflow-hidden shadow-lg hover:shadow-primary/20 transition-all duration-300 group ${className} cursor-pointer`}
      onClick={handleClick}
    >
      <CardHeader className="p-0">
        <div className="aspect-[2/1] bg-slate-800 flex items-center justify-center overflow-hidden">
          {provider.logoUrl ? (
            <img 
              src={provider.logoUrl} 
              alt={`${provider.name} logo`} 
              className="max-h-full max-w-full object-contain p-4 transition-transform duration-300 group-hover:scale-110" 
            />
          ) : (
            <span className="text-2xl font-bold text-white/70 group-hover:text-white">{provider.name}</span>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-3 md:p-4">
        <CardTitle className="text-base font-semibold truncate group-hover:text-primary transition-colors">
          {provider.name}
        </CardTitle>
        {/* Removed game_count as it's not on the type */}
        {/* provider.game_count !== undefined && (
          <p className="text-xs text-muted-foreground">{provider.game_count} games</p>
        )*/}
        <Button variant="link" className="p-0 h-auto text-xs text-primary mt-1 group-hover:underline">
          View Games <ChevronRight className="ml-1 h-3 w-3" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProviderCard;

