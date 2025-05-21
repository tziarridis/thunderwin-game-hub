
import React from 'react';
import { GameCategory } from '@/types';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Tag } from 'lucide-react'; // Example icon

interface GameCategoriesProps {
  categories: GameCategory[];
  currentCategory?: string;
}

const GameCategories: React.FC<GameCategoriesProps> = ({ categories, currentCategory }) => {
  if (!categories || categories.length === 0) {
    return <p className="text-muted-foreground">No game categories available.</p>;
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-3">Game Categories</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {categories.map((category) => (
          <Link key={category.id} to={`/casino/category/${category.slug}`}>
            <Card className={`p-3 hover:shadow-lg transition-shadow ${currentCategory === category.slug ? 'ring-2 ring-primary' : 'border-border'}`}>
              <div className="flex items-center space-x-2">
                {category.icon ? (
                  /* If category.icon is a Lucide icon name, you'd need a dynamic icon loader here.
                     For simplicity, using a generic icon or assuming category.icon is an img URL.
                     If it's a Lucide icon name string, you'd need an Icon component that maps name to component.
                     For now, let's use a default icon if category.icon is not an image URL.
                  */
                  category.icon && (category.icon.startsWith('http') || category.icon.startsWith('/')) ? (
                     <img src={category.icon} alt={category.name} className="h-6 w-6" />
                  ) : (
                     <Tag className="h-5 w-5 text-muted-foreground" /> // Default icon
                  )
                ) : (
                  <Tag className="h-5 w-5 text-muted-foreground" /> // Default icon
                )}
                <span className="text-sm font-medium truncate">{category.name}</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default GameCategories;
