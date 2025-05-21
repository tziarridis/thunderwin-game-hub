
import React from 'react';
import { Game, GameVolatilityEnum } from '@/types/game';
import { Badge } from '@/components/ui/badge';
import { Tag, Percent, BarChart3, Zap, CalendarDays, Info as InfoIcon } from 'lucide-react'; // Added InfoIcon

interface GamePropertiesProps {
  game: Game;
}

const GameProperties: React.FC<GamePropertiesProps> = ({ game }) => {
  const properties = [
    { label: 'RTP', value: game.rtp ? `${game.rtp}%` : 'N/A', icon: <Percent className="w-4 h-4 mr-1" /> },
    { label: 'Volatility', value: game.volatility || 'N/A', icon: <BarChart3 className="w-4 h-4 mr-1" />, variant: game.volatility ? (
        game.volatility === GameVolatilityEnum.LOW ? 'green' :
        game.volatility === GameVolatilityEnum.MEDIUM ? 'yellow' :
        game.volatility === GameVolatilityEnum.HIGH ? 'red' :
        game.volatility === GameVolatilityEnum.LOW_MEDIUM ? 'blue' :
        game.volatility === GameVolatilityEnum.MEDIUM_HIGH ? 'purple' : 'default'
      ) : 'default' as any
    },
    { label: 'Paylines', value: game.lines || 'N/A', icon: <Zap className="w-4 h-4 mr-1" /> },
    { label: 'Release Date', value: game.releaseDate ? new Date(game.releaseDate).toLocaleDateString() : 'N/A', icon: <CalendarDays className="w-4 h-4 mr-1" /> },
    { label: 'Provider', value: game.providerName || game.provider?.name || 'N/A', icon: <InfoIcon className="w-4 h-4 mr-1" /> },
  ];

  return (
    <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
      {properties.map(prop => (
        <div key={prop.label} className="bg-card p-3 rounded-lg shadow">
          <div className="text-xs text-muted-foreground flex items-center mb-1">
            {prop.icon}
            {prop.label}
          </div>
          <Badge 
            variant={prop.variant || 'secondary'}
            className={
              prop.variant === 'green' ? 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30' :
              prop.variant === 'yellow' ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30' :
              prop.variant === 'red' ? 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30' :
              prop.variant === 'blue' ? 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30' :
              prop.variant === 'purple' ? 'bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-500/30' :
              ''
            }
          >
            {prop.value}
          </Badge>
        </div>
      ))}
      {game.tags && Array.isArray(game.tags) && game.tags.length > 0 && (
        <div className="md:col-span-3 bg-card p-3 rounded-lg shadow">
          <div className="text-xs text-muted-foreground flex items-center mb-1">
            <Tag className="w-4 h-4 mr-1" />
            Tags
          </div>
          <div className="flex flex-wrap gap-2">
            {(game.tags as string[]).map(tag => ( // Assuming tags are strings for now
              <Badge key={tag} variant="outline">{typeof tag === 'object' ? (tag as any).name : tag}</Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameProperties;
