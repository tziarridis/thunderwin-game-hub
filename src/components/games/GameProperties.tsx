import React from 'react';
import { Game, GameTag } from '@/types'; // GameTag might be used for displaying tags if they are objects
import { Badge } from '@/components/ui/badge';
import { Tag, Percent, BarChart3, CalendarDays, Layers, Hash, Thermometer, DollarSign } from 'lucide-react';
import { format, parseISO } from 'date-fns';


interface GamePropertiesProps {
  game: Game;
  className?: string;
}

const GameProperties: React.FC<GamePropertiesProps> = ({ game, className }) => {
  const properties = [
    { label: 'RTP', value: game.rtp ? `${game.rtp.toFixed(2)}%` : 'N/A', icon: <Percent className="h-4 w-4" /> },
    { label: 'Volatility', value: game.volatility || 'N/A', icon: <BarChart3 className="h-4 w-4" /> },
    { label: 'Lines', value: game.lines || 'N/A', icon: <Layers className="h-4 w-4" /> }, // Assuming 'Layers' for lines
    { label: 'Min Bet', value: game.min_bet ?? 'N/A', icon: <DollarSign className="h-4 w-4" /> },
    { label: 'Max Bet', value: game.max_bet ?? 'N/A', icon: <DollarSign className="h-4 w-4" /> },
    { label: 'Release Date', value: game.releaseDate ? format(parseISO(game.releaseDate), 'MMM d, yyyy') : 'N/A', icon: <CalendarDays className="h-4 w-4" /> },
    { label: 'Status', value: game.status ? game.status.replace(/_/g, ' ') : 'N/A', icon: <Info className="h-4 w-4" /> }, // Example icon
    { label: 'Game Code', value: game.game_code || 'N/A', icon: <Hash className="h-4 w-4" /> }, // Example icon for game_code
    { label: 'Technology', value: game.technology || 'N/A', icon: <Thermometer className="h-4 w-4" /> }, // Example icon
  ];

  const displayTags: string[] = Array.isArray(game.tags)
    ? game.tags.map(tag => (typeof tag === 'string' ? tag : tag.name)) // Use tag.name if GameTag object
    : [];
  
  const displayFeatures: string[] = Array.isArray(game.features) ? game.features : [];
  const displayThemes: string[] = Array.isArray(game.themes) ? game.themes : [];


  return (
    <div className={className}>
      <h3 className="text-xl font-semibold mb-4">Game Properties</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {properties.map(prop => (
          (prop.value && prop.value !== 'N/A') && (
            <div key={prop.label} className="flex items-start p-3 bg-muted/50 rounded-md">
              <div className="mr-3 text-primary">{prop.icon}</div>
              <div>
                <p className="text-xs text-muted-foreground">{prop.label}</p>
                <p className="text-sm font-medium capitalize">{String(prop.value)}</p>
              </div>
            </div>
          )
        ))}
      </div>

      {displayTags.length > 0 && (
        <div className="mb-4">
          <h4 className="text-md font-semibold mb-2 flex items-center"><Tag className="h-4 w-4 mr-2 text-primary" /> Tags</h4>
          <div className="flex flex-wrap gap-2">
            {displayTags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
          </div>
        </div>
      )}
      {displayFeatures.length > 0 && (
        <div className="mb-4">
          <h4 className="text-md font-semibold mb-2 flex items-center"><Tag className="h-4 w-4 mr-2 text-primary" /> Features</h4>
          <div className="flex flex-wrap gap-2">
            {displayFeatures.map(feature => <Badge key={feature} variant="outline">{feature}</Badge>)}
          </div>
        </div>
      )}
       {displayThemes.length > 0 && (
        <div>
          <h4 className="text-md font-semibold mb-2 flex items-center"><Tag className="h-4 w-4 mr-2 text-primary" /> Themes</h4>
          <div className="flex flex-wrap gap-2">
            {displayThemes.map(theme => <Badge key={theme} variant="default">{theme}</Badge>)}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameProperties;
