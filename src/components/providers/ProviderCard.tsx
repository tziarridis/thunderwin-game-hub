
import React from 'react';
import { GameProvider } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Gamepad2 } from 'lucide-react'; // Using Gamepad2 as an example

interface ProviderCardProps {
  provider: GameProvider;
}

const ProviderCard: React.FC<ProviderCardProps> = ({ provider }) => {
  const navigate = useNavigate();

  const handleViewGames = () => {
    // Navigate to a page showing games by this provider, e.g., /casino/provider/{provider.slug}
    // This route needs to be implemented. For now, logging.
    if (provider.slug) {
      navigate(`/casino/providers/${provider.slug}`);
    } else {
        console.log(`View games for provider: ${provider.name}`);
        alert(`Viewing games for ${provider.name} (slug: ${provider.slug}) - Implement navigation`);
    }
  };

  return (
    <Card className="flex flex-col overflow-hidden h-full hover:shadow-lg transition-shadow">
      <CardHeader className="p-0 relative">
        {provider.logo ? (
          <img 
            src={provider.logo} 
            alt={`${provider.name} logo`} 
            className="w-full h-32 object-contain p-4 bg-muted/30" 
          />
        ) : (
          <div className="w-full h-32 flex items-center justify-center bg-muted/30">
            <Gamepad2 className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg mb-1 truncate" title={provider.name}>{provider.name}</CardTitle>
        {provider.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{provider.description}</p>
        )}
        {typeof provider.games_count === 'number' && (
          <p className="text-sm text-muted-foreground">
            Games available: <span className="font-semibold">{provider.games_count}</span>
          </p>
        )}
      </CardContent>
      <CardFooter className="p-4 border-t">
        <Button onClick={handleViewGames} className="w-full" variant="outline">
          View Games
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProviderCard;
