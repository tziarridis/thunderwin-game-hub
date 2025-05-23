
import React from 'react';
import { Button } from '@/components/ui/button';

export interface CategoryTabsProps {
  categories: { id: string; name: string; slug: string }[];
  activeCategory: string;
  onSelectCategory: (slug: string) => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  activeCategory,
  onSelectCategory
}) => {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Button
        variant={activeCategory === 'all' ? 'default' : 'outline'}
        onClick={() => onSelectCategory('all')}
        className="mb-2"
      >
        All Games
      </Button>
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={activeCategory === category.slug ? 'default' : 'outline'}
          onClick={() => onSelectCategory(category.slug)}
          className="mb-2"
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
};

export default CategoryTabs;
