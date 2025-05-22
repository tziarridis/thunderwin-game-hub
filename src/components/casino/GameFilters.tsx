
import React from 'react';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GameCategory, GameProvider } from '@/types';

interface GameFiltersProps {
  categories: GameCategory[];
  providers: GameProvider[];
  selectedCategory: string;
  selectedProvider: string;
  onCategoryChange: (categorySlug: string) => void;
  onProviderChange: (providerSlug: string) => void;
}

const GameFilters: React.FC<GameFiltersProps> = ({
  categories,
  providers,
  selectedCategory,
  selectedProvider,
  onCategoryChange,
  onProviderChange
}) => {
  return (
    <div className="space-y-6">
      {/* Categories Filter */}
      <div>
        <h3 className="mb-3 text-lg font-semibold">Game Categories</h3>
        <ScrollArea className="whitespace-nowrap pb-2">
          <div className="flex space-x-2">
            <Button 
              variant={selectedCategory === 'all' ? "default" : "outline"}
              onClick={() => onCategoryChange('all')}
              className="rounded-full px-4"
            >
              All Games
            </Button>
            
            {categories.map((category) => (
              <Button
                key={category.slug}
                variant={selectedCategory === category.slug ? "default" : "outline"}
                onClick={() => onCategoryChange(category.slug)}
                className={cn("rounded-full px-4", 
                  selectedCategory === category.slug && "bg-primary text-primary-foreground"
                )}
              >
                {category.icon && (
                  <span className="mr-2">{category.icon}</span>
                )}
                {category.name}
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
      
      {/* Providers Filter */}
      <div>
        <h3 className="mb-3 text-lg font-semibold">Game Providers</h3>
        <ScrollArea className="whitespace-nowrap pb-2">
          <div className="flex space-x-2">
            <Button 
              variant={selectedProvider === 'all' ? "default" : "outline"}
              onClick={() => onProviderChange('all')}
              className="rounded-full px-4"
            >
              All Providers
            </Button>
            
            {providers.map((provider) => (
              <Button
                key={provider.slug}
                variant={selectedProvider === provider.slug ? "default" : "outline"}
                onClick={() => onProviderChange(provider.slug)}
                className={cn("rounded-full px-4", 
                  selectedProvider === provider.slug && "bg-primary text-primary-foreground"
                )}
              >
                {provider.name}
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
};

export default GameFilters;
