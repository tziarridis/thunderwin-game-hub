
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGames } from '@/hooks/useGames';
import { Game } from '@/types';
import GamesGrid from '@/components/games/GamesGrid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, FilterX, Loader2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { scrollToTop } from '@/utils/scrollUtils';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 24;

const CasinoGames = () => {
  const { category: categorySlugFromParams } = useParams<{ category: string }>();
  const { games, isLoadingGames, launchGame, categories } = useGames();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  const currentCategory = useMemo(() => 
    categories.find(cat => cat.slug === categorySlugFromParams)
  , [categories, categorySlugFromParams]);

  const pageTitle = currentCategory?.name || 
    (categorySlugFromParams ? categorySlugFromParams.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'All Games');

  const filteredAndSearchedGames = useMemo(() => {
    let tempGames = [...games];
    
    if (categorySlugFromParams && categorySlugFromParams !== 'all-games') {
      tempGames = tempGames.filter(game => 
        (Array.isArray(game.category_slugs) && game.category_slugs.includes(categorySlugFromParams)) ||
        game.category === categorySlugFromParams ||
        game.categoryName === categorySlugFromParams
      );
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      tempGames = tempGames.filter(
        game => 
          game.title.toLowerCase().includes(term) || 
          (game.providerName && game.providerName.toLowerCase().includes(term)) ||
          (game.provider_slug && game.provider_slug.toLowerCase().includes(term))
      );
    }
    return tempGames;
  }, [games, categorySlugFromParams, searchTerm]);
  
  const paginatedGames = useMemo(() => {
    return filteredAndSearchedGames.slice(0, currentPage * ITEMS_PER_PAGE);
  }, [filteredAndSearchedGames, currentPage]);

  const hasMore = useMemo(() => {
    return paginatedGames.length < filteredAndSearchedGames.length;
  }, [paginatedGames.length, filteredAndSearchedGames.length]);
  
  const [loadingMore, setLoadingMore] = useState(false);

  const handleLoadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setCurrentPage(prev => prev + 1);
      setLoadingMore(false);
    }, 300); 
  };
  
  const handleGameClick = async (game: Game) => {
    if (!isAuthenticated) {
      toast.error('Please log in to play this game');
      navigate('/login');
      return;
    }
    
    try {
      const gameUrl = await launchGame(game, {mode: 'real'});
      if (gameUrl) {
        window.open(gameUrl, '_blank');
      } else {
        navigate(`/casino/game/${game.slug || game.id}`);
        scrollToTop();
      }
    } catch (error: any) {
      toast.error(`Could not launch game: ${error.message}`);
      navigate(`/casino/game/${game.slug || game.id}`);
      scrollToTop();
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [categorySlugFromParams, searchTerm]);
  
  const GridComponent = GamesGrid;

  return (
    <div className="relative bg-casino-thunder-darker min-h-screen">
      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageTitle}</h1>
        </div>
        
        <div className="relative mb-6 sticky top-16 bg-background/80 backdrop-blur-md py-4 z-30">
          <Input
            type="text"
            placeholder="Search games or providers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 py-3 text-base bg-card border-border focus:ring-primary"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          {searchTerm && (
            <Button 
              variant="ghost" 
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7" 
              onClick={() => setSearchTerm('')}
            >
              <FilterX size={18} />
            </Button>
          )}
        </div>
        
        <GridComponent
          games={paginatedGames}
          loading={isLoadingGames && paginatedGames.length === 0}
          onGameClick={handleGameClick}
          emptyMessage={searchTerm ? "No games match your search" : "No games available in this category"}
          loadMore={hasMore ? handleLoadMore : undefined}
          hasMore={hasMore}
          loadingMore={loadingMore}
        />
      </div>
    </div>
  );
};

export default CasinoGames;
