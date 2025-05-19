
import React from 'react';
import { Game } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tag, Calendar, Percent, BarChart3, Zap, Aperture } from 'lucide-react'; // Added Aperture for themes

interface GamePropertiesProps {
  game: Game;
}

const GameProperties: React.FC<GamePropertiesProps> = ({ game }) => {
  const properties = [
    { label: 'Provider', value: game.providerName || game.provider_slug || game.provider, icon: <Aperture className="h-4 w-4 mr-2" /> },
    { label: 'Category', value: game.categoryName || (Array.isArray(game.category_slugs) ? game.category_slugs.join(', ') : game.category_slugs), icon: <Tag className="h-4 w-4 mr-2" /> },
    { label: 'RTP', value: game.rtp ? `${game.rtp}%` : 'N/A', icon: <Percent className="h-4 w-4 mr-2" /> },
    { label: 'Volatility', value: game.volatility || 'N/A', icon: <BarChart3 className="h-4 w-4 mr-2" /> },
    { label: 'Lines', value: game.lines ? game.lines.toString() : 'N/A', icon: <BarChart3 className="h-4 w-4 mr-2" /> }, // Re-using BarChart3, consider more specific icon
    { label: 'Release Date', value: game.releaseDate ? new Date(game.releaseDate).toLocaleDateString() : 'N/A', icon: <Calendar className="h-4 w-4 mr-2" /> }, // Corrected property name
    { label: 'Min Bet', value: game.minBet ? game.minBet.toString() : 'N/A', icon: <Percent className="h-4 w-4 mr-2" /> },
    { label: 'Max Bet', value: game.maxBet ? game.maxBet.toString() : 'N/A', icon: <Percent className="h-4 w-4 mr-2" /> },
    { label: 'Status', value: game.status || 'N/A', icon: <Zap className="h-4 w-4 mr-2" /> },
  ];

  const renderList = (title: string, items?: string[]) => {
    if (!items || items.length === 0) return null;
    return (
      <div>
        <h4 className="font-semibold text-sm mb-1">{title}:</h4>
        <ul className="list-disc list-inside text-xs space-y-0.5">
          {items.map((item, index) => <li key={index}>{item}</li>)}
        </ul>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Game Properties</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
          {properties.map((prop, index) => (
            prop.value && prop.value !== 'N/A' && (
              <div key={index} className="flex items-center text-sm">
                {prop.icon}
                <span className="font-medium capitalize">{prop.label}:&nbsp;</span>
                <span className="text-muted-foreground truncate">{prop.value}</span>
              </div>
            )
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2 border-t border-border mt-3">
          {renderList('Features', game.features)}
          {renderList('Tags', game.tags)}
          {renderList('Themes', game.themes)}
        </div>
        {game.description && (
           <div className="pt-3 border-t border-border mt-3">
             <h4 className="font-semibold text-sm mb-1">Description:</h4>
             <p className="text-xs text-muted-foreground">{game.description}</p>
           </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GameProperties;

