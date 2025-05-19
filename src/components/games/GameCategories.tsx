
import React from 'react';
import { GameCategory } from '@/types'; // Use the new GameCategory type
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tag } from 'lucide-react'; // Example icon

interface GameCategoriesProps {
  categories: GameCategory[];
  selectedCategory: string | null;
  onSelectCategory: (categorySlug: string | null) => void; // Allow null for 'All'
  className?: string;
}

const GameCategories: React.FC<GameCategoriesProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  className,
}) => {
  if (!categories || categories.length === 0) {
    return <p className="text-muted-foreground">No game categories available.</p>;
  }

  return (
    <div className={className}>
      <ScrollArea className="w-full whitespace-nowrap rounded-md">
        <div className="flex space-x-3 p-2">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            onClick={() => onSelectCategory(null)}
            className="shrink-0"
          >
            All Games
          </Button>
          {categories.map((category) => (
            <Button
              key={category.slug || category.id}
              variant={selectedCategory === category.slug ? 'default' : 'outline'}
              onClick={() => onSelectCategory(category.slug)}
              className="shrink-0"
            >
              {category.icon && <Tag className="mr-2 h-4 w-4" /> /* Placeholder for dynamic icons */}
              {category.name}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default GameCategories;

