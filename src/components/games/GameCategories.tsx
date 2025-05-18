
import React from 'react';
import { GameCategory } from '@/types';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'; // Assuming ScrollArea is available

interface GameCategoriesProps {
  categories: GameCategory[];
  onSelectCategory: (categorySlug: string | null) => void; // Added prop, allow null for "All"
  selectedCategory: string | null; // Added prop
  className?: string;
}

const GameCategories: React.FC<GameCategoriesProps> = ({ categories, onSelectCategory, selectedCategory, className }) => {
  if (!categories || categories.length === 0) {
    return <div className="text-center text-muted-foreground py-4">No categories available.</div>;
  }

  return (
    <ScrollArea className={`w-full whitespace-nowrap rounded-md ${className}`}>
      <div className="flex space-x-3 p-3">
         <Button
          variant={selectedCategory === null ? 'default' : 'outline'}
          onClick={() => onSelectCategory(null)} // null for "All"
          className="whitespace-nowrap"
        >
          All Games
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.slug ? 'default' : 'outline'}
            onClick={() => onSelectCategory(category.slug)}
            className="whitespace-nowrap"
          >
            {category.icon && <span className="mr-2">{/* Render icon component if available */}</span>}
            {category.name}
          </Button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

export default GameCategories;
