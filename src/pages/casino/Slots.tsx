import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useGames } from '@/hooks/useGames';
import { Game } from '@/types';
import GameCard from '@/components/game/GameCard';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

const Slots = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { games, categories, loading, filterGames } = useGames();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);

  useEffect(() => {
    if (games && games.length > 0) {
      setFilteredGames(filterGames(activeCategory, searchTerm));
    }
  }, [games, activeCategory, searchTerm, filterGames]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">{t('casino.slots')}</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-[150px] w-full rounded-md" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{t('casino.slots')}</h1>
        <Input
          type="text"
          placeholder={t('casino.search_games')}
          value={searchTerm}
          onChange={handleSearchChange}
          className="max-w-md"
        />
      </div>

      <ScrollArea className="mb-4">
        <div className="flex space-x-2 p-2">
          <Button
            variant={activeCategory === 'all' ? 'default' : 'outline'}
            onClick={() => handleCategoryClick('all')}
          >
            {t('casino.all_games')}
          </Button>
          {categories &&
            categories.map((category, index) => (
              <div key={`category-${index}`}>
                <Button
                  variant={activeCategory === category.slug ? 'default' : 'outline'}
                  onClick={() => handleCategoryClick(category.slug)}
                >
                  {category.name}
                </Button>
              </div>
            ))}
        </div>
      </ScrollArea>
      <Separator className="mb-4" />

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredGames &&
          filteredGames.map((game) => (
            <GameCard key={game.id} game={game} onClick={() => navigate(`/game/${game.id}`)} />
          ))}
      </div>
    </div>
  );
};

export default Slots;
