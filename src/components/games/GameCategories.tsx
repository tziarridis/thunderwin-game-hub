
import React, { useState, useEffect } from 'react';
import { useGames } from '@/hooks/useGames';
import { GameCategory } from '@/types';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from '@/lib/utils';
import { Tag } from 'lucide-react'; // Example Icon
import { Skeleton } from '@/components/ui/skeleton';
import dynamicIconImports from 'lucide-react/dynamicIconImports'; // For dynamic icons
import Icon from '@/components/Icon'; // Assuming you have a generic Icon component

interface GameCategoriesProps {
  onCategorySelect: (categorySlug: string | null) => void;
  selectedCategorySlug: string | null;
  layout?: 'scrollable' | 'grid'; // Default to scrollable
  itemClassName?: string;
  activeItemClassName?: string;
  inactiveItemClassName?: string;
}

const GameCategories: React.FC<GameCategoriesProps> = ({ 
  onCategorySelect, 
  selectedCategorySlug,
  layout = 'scrollable',
  itemClassName,
  activeItemClassName = "bg-primary text-primary-foreground hover:bg-primary/90",
  inactiveItemClassName = "bg-card hover:bg-accent hover:text-accent-foreground"
}) => {
  const { categories, isLoading: isLoadingCategories, error: categoriesError } = useGames();
  const [displayCategories, setDisplayCategories] = useState<GameCategory[]>([]);

  useEffect(() => {
    // Filter out inactive categories or sort them if needed
    const activeCategories = categories.filter(cat => cat.isActive !== false);
    // Example: Sort by name, or a predefined order if available
    activeCategories.sort((a, b) => a.name.localeCompare(b.name));
    setDisplayCategories(activeCategories);
  }, [categories]);

  if (isLoadingCategories) {
    return (
      <div className={cn("flex gap-2", layout === 'scrollable' ? "py-2" : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3")}>
        {Array.from({ length: layout === 'scrollable' ? 5 : 8 }).map((_, i) => (
          <Skeleton key={i} className={cn("h-10 rounded-md", layout === 'scrollable' ? "w-28" : "w-full")} />
        ))}
      </div>
    );
  }

  if (categoriesError) {
    return <p className="text-red-500">Error loading categories: {String(categoriesError)}</p>;
  }

  if (displayCategories.length === 0) {
    return <p className="text-muted-foreground text-sm">No game categories available.</p>;
  }
  
  const renderCategoryItem = (category: GameCategory) => {
    const lucideIconName = category.icon && dynamicIconImports[category.icon as keyof typeof dynamicIconImports] 
      ? category.icon as keyof typeof dynamicIconImports 
      : null;

    return (
      <Button
        key={category.id}
        variant="outline"
        size="sm"
        className={cn(
          "flex items-center justify-start text-left h-auto py-2 px-3 transition-all duration-200 ease-in-out transform hover:scale-105 shadow-sm border",
          itemClassName,
          selectedCategorySlug === category.slug ? activeItemClassName : inactiveItemClassName,
          layout === 'scrollable' ? "min-w-[120px] flex-shrink-0" : "w-full"
        )}
        onClick={() => onCategorySelect(category.slug)}
      >
        {category.imageUrl && <img src={category.imageUrl} alt={category.name} className="w-5 h-5 mr-2 rounded-sm object-contain"/>}
        {!category.imageUrl && lucideIconName && <Icon name={lucideIconName} className="w-4 h-4 mr-2" />}
        {!category.imageUrl && !lucideIconName && <Tag className="w-4 h-4 mr-2" />}
        
        <span className="truncate flex-grow">{category.name}</span>
        {typeof category.gameCount === 'number' && category.gameCount > 0 && ( // Use gameCount
          <span className="ml-auto text-xs opacity-70 pl-1">({category.gameCount})</span> // Use gameCount
        )}
      </Button>
    );
  };


  if (layout === 'scrollable') {
    return (
      <ScrollArea className="w-full whitespace-nowrap py-2">
        <div className="flex space-x-3 pr-4">
            <Button
                variant="outline"
                size="sm"
                className={cn(
                "flex items-center justify-start text-left h-auto py-2 px-3 transition-all duration-200 ease-in-out transform hover:scale-105 shadow-sm border min-w-[120px] flex-shrink-0",
                itemClassName,
                selectedCategorySlug === null ? activeItemClassName : inactiveItemClassName
                )}
                onClick={() => onCategorySelect(null)}
            >
                All Games
            </Button>
          {displayCategories.map(renderCategoryItem)}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    );
  }

  // Grid layout
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
       <Button
            variant="outline"
            size="sm"
            className={cn(
            "flex items-center justify-start text-left h-auto py-2 px-3 transition-all duration-200 ease-in-out transform hover:scale-105 shadow-sm border w-full",
            itemClassName,
            selectedCategorySlug === null ? activeItemClassName : inactiveItemClassName
            )}
            onClick={() => onCategorySelect(null)}
        >
            All Games
        </Button>
      {displayCategories.map(renderCategoryItem)}
    </div>
  );
};

export default GameCategories;
