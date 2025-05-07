import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import GameCard from '@/components/game-card';
import useGames from '@/hooks/useGames';

const NewGames = () => {
  const { t } = useTranslation();
  const { categories, newGames, loading } = useGames();
  const [activeCategory, setActiveCategory] = React.useState<string>('all');

  if (loading) {
    return <div>Loading new games...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">{t('casino.new_games')}</h1>

      <Tabs defaultValue="all" className="w-full">
        <ScrollArea className="w-full">
          <TabsList className="w-[900px]">
            <TabsTrigger value="all">All</TabsTrigger>
            {categories.map((category, index) => (
              <TabsTrigger key={`category-${index}`} value={category.slug}>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </ScrollArea>
        
        <TabsContent value="all">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {newGames.map(game => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </TabsContent>

        {categories.map(category => (
          <TabsContent key={category.id} value={category.slug}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {newGames
                .filter(game => game.category === category.name)
                .map(game => (
                  <GameCard key={game.id} game={game} />
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default NewGames;
