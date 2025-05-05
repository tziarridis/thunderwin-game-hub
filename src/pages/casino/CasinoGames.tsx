
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGames } from '@/hooks/useGames';
import { Game } from '@/types';
import GamesGrid from '@/components/games/GamesGrid';
import GamesGridMobile from '@/components/games/GamesGridMobile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, FilterX } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { scrollToTop } from '@/utils/scrollUtils';
import { useAuth } from '@/contexts/AuthContext';
import GameLauncher from '@/components/games/GameLauncher';
import { toast } from 'sonner';

const CasinoGames = () => {
  const { category } = useParams<{ category: string }>();
  const { games, loading } = useGames();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [visibleCount, setVisibleCount] = useState(24);
  
  // Format category for display
  const formatCategory = (category: string | undefined) => {
    if (!category) return 'All Games';
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Filter games based on category and search term
  useEffect(() => {
    if (!games) return;
    
    let filtered = [...games];
    
    // Filter by category if provided
    if (category) {
      switch (category) {
        case 'slots':
          filtered = filtered.filter(game => game.category === 'slots');
          break;
        case 'table-games':
          filtered = filtered.filter(game => game.category === 'table');
          break;
        case 'live-casino':
          filtered = filtered.filter(game => game.category === 'live');
          break;
        case 'jackpots':
          filtered = filtered.filter(game => game.jackpot);
          break;
        case 'new':
          filtered = filtered.filter(game => game.isNew);
          break;
        case 'popular':
          filtered = filtered.filter(game => game.isPopular);
          break;
        case 'favorites':
          filtered = filtered.filter(game => game.isFavorite);
          break;
        default:
          // No filter
          break;
      }
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        game => 
          game.title.toLowerCase().includes(term) || 
          game.provider.toLowerCase().includes(term)
      );
    }
    
    setFilteredGames(filtered.slice(0, visibleCount));
    setHasMore(filtered.length > visibleCount);
  }, [games, category, searchTerm, visibleCount]);
  
  const handleLoadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount(prev => prev + 24);
      setLoadingMore(false);
    }, 500);
  };
  
  const handleClearSearch = () => {
    setSearchTerm('');
  };
  
  const handleGameClick = (game: Game) => {
    if (!isAuthenticated) {
      toast.error('Please log in to play this game');
      navigate('/login');
      return;
    }
    
    navigate(`/casino/game/${game.id}`);
    scrollToTop();
  };
  
  return (
    <div className="relative bg-casino-thunder-darker min-h-screen">
      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{formatCategory(category)}</h1>
          <p className="text-white/70 max-w-2xl mx-auto">
            {category === 'slots' && 'Spin to win with our huge collection of online slot games.'}
            {category === 'table-games' && 'Experience classic table games like Blackjack, Roulette, and Poker.'}
            {category === 'live-casino' && 'Play with live dealers for an authentic casino experience.'}
            {category === 'jackpots' && 'Try your luck with our progressive jackpot games with massive prize pools.'}
            {category === 'new' && 'Discover our latest additions to the game library.'}
            {category === 'popular' && 'Play the games that other players love the most.'}
            {category === 'favorites' && 'Your favorite games in one place.'}
            {!category && 'Browse our complete collection of casino games.'}
          </p>
        </div>
        
        <div className="relative mb-6">
          <Input
            type="text"
            placeholder="Search games or providers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 py-6 bg-casino-thunder-gray/30 border-white/10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          {searchTerm && (
            <Button 
              variant="ghost" 
              className="absolute right-2 top-1/2 transform -translate-y-1/2" 
              onClick={handleClearSearch}
            >
              <FilterX size={18} />
            </Button>
          )}
        </div>
        
        {isMobile ? (
          <GamesGridMobile
            games={filteredGames}
            loading={loading}
            onGameClick={handleGameClick}
            emptyMessage={searchTerm ? "No games match your search" : "No games available in this category"}
            loadMore={hasMore ? handleLoadMore : undefined}
            hasMore={hasMore}
            loadingMore={loadingMore}
          />
        ) : (
          <GamesGrid
            games={filteredGames}
            loading={loading}
            onGameClick={handleGameClick}
            emptyMessage={searchTerm ? "No games match your search" : "No games available in this category"}
            loadMore={hasMore ? handleLoadMore : undefined}
            hasMore={hasMore}
            loadingMore={loadingMore}
          />
        )}
      </div>
    </div>
  );
};

export default CasinoGames;
