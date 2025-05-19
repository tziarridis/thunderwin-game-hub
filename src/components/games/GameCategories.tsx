
import React from 'react';
import { Link } from 'react-router-dom';
import { GameCategory } from '@/types'; // Corrected import
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Grid, List } from 'lucide-react'; // Example icons

interface GameCategoriesProps {
  categories: GameCategory[];
  onSelectCategory?: (slug: string) => void;
  currentCategorySlug?: string | null;
  displayMode?: 'grid' | 'list'; // Optional display mode
}

const GameCategories: React.FC<GameCategoriesProps> = ({ 
  categories, 
  onSelectCategory, 
  currentCategorySlug,
  displayMode = 'grid' 
}) => {
  if (!categories || categories.length === 0) {
    return <p className="text-center text-muted-foreground py-4">No game categories available.</p>;
  }

  const handleCategoryClick = (slug: string) => {
    if (onSelectCategory) {
      onSelectCategory(slug);
    }
    // If no onSelectCategory, Link will handle navigation if to prop is set
  };

  if (displayMode === 'list') {
    return (
      <div className="space-y-2">
        {categories.map(category => (
          <Button
            key={category.slug || category.id}
            variant={currentCategorySlug === category.slug ? "default" : "outline"}
            className="w-full justify-start"
            onClick={() => handleCategoryClick(category.slug)}
            asChild={!onSelectCategory} // Use asChild for Link only if onSelectCategory is not primary action
          >
            {onSelectCategory ? (
              <>
                {category.icon && <List className="mr-2 h-4 w-4" />} {/* Replace with actual icon if available */}
                {category.name}
              </>
            ) : (
              <Link to={`/casino/category/${category.slug}`}>
                {category.icon && <List className="mr-2 h-4 w-4" />}
                {category.name}
              </Link>
            )}
          </Button>
        ))}
      </div>
    );
  }

  // Default grid display
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {categories.map(category => (
        <Card 
          key={category.slug || category.id} 
          className={`hover:shadow-lg transition-shadow cursor-pointer ${currentCategorySlug === category.slug ? 'ring-2 ring-primary' : ''}`}
          onClick={() => handleCategoryClick(category.slug)}
        >
            {onSelectCategory ? (
                 <CardContent className="p-4 flex flex-col items-center justify-center aspect-square">
                    {/* Basic icon placeholder, replace with actual icons if category.icon is a component or URL */}
                    {category.icon ? <img src={category.icon} alt={category.name} className="h-12 w-12 mb-2 object-contain"/> : <Grid className="h-12 w-12 mb-2 text-muted-foreground" />}
                    <h3 className="text-sm font-semibold text-center truncate w-full">{category.name}</h3>
                    {category.game_count && <p className="text-xs text-muted-foreground">{category.game_count} games</p>}
                 </CardContent>
            ) : (
             <Link to={`/casino/category/${category.slug}`} className="block">
                <CardContent className="p-4 flex flex-col items-center justify-center aspect-square">
                    {category.icon ? <img src={category.icon} alt={category.name} className="h-12 w-12 mb-2 object-contain"/> : <Grid className="h-12 w-12 mb-2 text-muted-foreground" />}
                    <h3 className="text-sm font-semibold text-center truncate w-full">{category.name}</h3>
                    {category.game_count && <p className="text-xs text-muted-foreground">{category.game_count} games</p>}
                </CardContent>
             </Link>
            )}
        </Card>
      ))}
    </div>
  );
};

export default GameCategories;

