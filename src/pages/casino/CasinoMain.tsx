
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGames } from '@/hooks/useGames'; // Assuming useGames provides DisplayGame[] and related methods
import GamesGrid, { GameGridProps } from '@/components/games/GamesGrid';
import HeroSection from '@/components/marketing/HeroSection'; // Corrected import path
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, SlidersHorizontal, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import CategoryTabs, { CategoryTabsProps } from '@/components/games/CategoryTabs'; // For CategoryTabsProps
import ProviderCarousel, { ProviderCarouselProps } from '@/components/games/ProviderCarousel'; // For ProviderCarouselProps
import { GameCategory, GameProvider, Game as DisplayGame } from '@/types'; // Using DisplayGame for UI, ensure it matches useGames output

const GAMES_PER_PAGE = 24;

// Fetch initial games, categories, providers - these could be part of useGames or separate hooks
const fetchCategories = async (): Promise<GameCategory[]> => {
    const { data, error } = await supabase.from('game_categories').select('*').eq('status', 'active');
    if (error) throw error;
    return data.map(c => ({ ...c, id: String(c.id) })) as GameCategory[];
};

const fetchProviders = async (): Promise<GameProvider[]> => {
    const { data, error } = await supabase.from('game_providers').select('*').eq('is_active', true);
    if (error) throw error;
    return data.map(p => ({ ...p, id: String(p.id), slug: p.slug || String(p.id), logoUrl: p.logo })) as GameProvider[];
};


const CasinoMainPage: React.FC = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    
    // useGames hook provides games, loading state, pagination, filtering, and favorite logic
    const { 
        games, // This should be DisplayGame[] from useGames after processing
        fetchGames, 
        isLoading: gamesLoading, 
        hasMore, 
        error: gamesError, 
        toggleFavoriteGame, 
        favoriteGameIds,
        // getFavoriteGames // If needed separately
    } = useGames({ initialLoad: true, itemsPerPage: GAMES_PER_PAGE }); // Pass config to useGames

    const [currentPage, setCurrentPage] = useState(1); // useGames might manage this too
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilters, setActiveFilters] = useState({
        category: 'all',
        provider: 'all',
        sortBy: 'popularity', // or 'newest', 'rtp_high'
        tags: [] as string[],
    });
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
        queryKey: ['gameCategories'], 
        queryFn: fetchCategories, 
        staleTime: Infinity 
    });
    const { data: providers = [], isLoading: isLoadingProviders } = useQuery({
        queryKey: ['gameProviders'], 
        queryFn: fetchProviders, 
        staleTime: Infinity 
    });

    useEffect(() => {
        if (gamesError) {
            toast.error(`Error loading games: ${gamesError}`);
        }
    }, [gamesError]);
    
    // Initial fetch is handled by useGames if configured with initialLoad: true
    // useEffect(() => {
    //    fetchGames({ page: 1, limit: GAMES_PER_PAGE, filters: activeFilters, searchTerm });
    // }, []); // Minimal deps for initial load


    const handleSearch = (term: string) => {
        setSearchTerm(term);
        setCurrentPage(1);
        fetchGames({ page: 1, limit: GAMES_PER_PAGE, filters: activeFilters, searchTerm: term });
    };

    const handleFilterChange = (newFilters: Partial<typeof activeFilters>) => {
        const updatedFilters = { ...activeFilters, ...newFilters };
        setActiveFilters(updatedFilters);
        setCurrentPage(1);
        fetchGames({ page: 1, limit: GAMES_PER_PAGE, filters: updatedFilters, searchTerm });
    };

    const loadMoreGames = () => {
        if (hasMore && !gamesLoading) {
            const nextPage = currentPage + 1;
            fetchGames({ page: nextPage, limit: GAMES_PER_PAGE, filters: activeFilters, searchTerm });
            setCurrentPage(nextPage);
        }
    };

    const handleGameClick = (game: DisplayGame, mode?: 'real' | 'demo') => {
        console.log("Playing game:", game.title, "Mode:", mode);
        if (!isAuthenticated && mode === 'real') {
            toast.error("Please log in to play for real money.", {
                action: { label: "Login", onClick: () => navigate('/login') }
            });
            return;
        }
        // If GameLauncher handles logic, navigate there. Otherwise, directly to game page.
        navigate(`/casino/game/${game.slug || game.id}${mode ? `?mode=${mode}`: ''}`);
    };
    
    const handleToggleFavorite = async (gameId: string | number, isFavorite: boolean) => {
        if (!isAuthenticated) {
          toast.error("Please log in to manage favorites.");
          return;
        }
        try {
          await toggleFavoriteGame(String(gameId)); // toggleFavoriteGame in useGames should handle Supabase interaction
          toast.success(isFavorite ? "Removed from favorites" : "Added to favorites");
        } catch (error: any) {
          toast.error(`Failed to update favorites: ${error.message}`);
        }
    };


    const isLoading = gamesLoading || isLoadingCategories || isLoadingProviders;

    const categoryTabsProps: CategoryTabsProps = {
        categories: categories.map(c => ({ id: String(c.id), name: c.name, slug: c.slug })),
        activeCategory: activeFilters.category,
        onSelectCategory: (slug) => handleFilterChange({ category: slug }),
    };

    const providerCarouselProps: ProviderCarouselProps = {
        providers: providers.map(p => ({ id: String(p.id), name: p.name, logoUrl: p.logoUrl, slug: p.slug })),
        activeProvider: activeFilters.provider,
        onSelectProvider: (slug) => handleFilterChange({ provider: slug }),
    };
    
    const gamesGridProps: GameGridProps = {
        games: games.map(g => ({...g, isFavorite: favoriteGameIds.has(String(g.id)) })), // Ensure games are DisplayGame with isFavorite
        onGameClick: handleGameClick,
        onToggleFavorite: handleToggleFavorite, // Pass this down
        loading: gamesLoading && currentPage === 1, // Show main loading only for first page
        loadMoreGames: loadMoreGames,
        hasMore: hasMore,
        loadingMore: gamesLoading && currentPage > 1, // Show "loading more" indicator
        // favoritesMode: false, // Default
        // itemsPerPage: GAMES_PER_PAGE, // if GamesGrid needs it
        // onLoginRedirect: () => navigate('/login') // If GamesGrid handles this
    };

    return (
        <div className="bg-background text-foreground min-h-screen">
            <HeroSection
                title="Explore Our Exciting Games"
                subtitle="Dive into a world of adventure and big wins. Find your new favorite!"
                // ctaText="Browse All Games"
                // ctaLink="/casino/all"
            />
            <div className="container mx-auto px-2 sm:px-4 py-8">
                {/* Search and Filter Controls */}
                <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
                    <div className="relative flex-grow w-full sm:w-auto">
                        <Input
                            type="search"
                            placeholder="Search for games..."
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-10 pr-4 h-12 text-base w-full"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    </div>
                    <Button
                        variant="outline"
                        className="sm:hidden w-full h-12"
                        onClick={() => setShowMobileFilters(!showMobileFilters)}
                    >
                        <SlidersHorizontal className="mr-2 h-4 w-4" /> Filters
                    </Button>
                    {/* TODO: Desktop Filters Button or Sort Dropdown */}
                </div>
                
                {/* TODO: Mobile Filters Panel (if showMobileFilters is true) */}

                {!isLoadingCategories && categories.length > 0 && (
                    <div className="mb-8">
                        <CategoryTabs {...categoryTabsProps} />
                    </div>
                )}

                {!isLoadingProviders && providers.length > 0 && (
                     <div className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">Top Providers</h2>
                        <ProviderCarousel {...providerCarouselProps} />
                    </div>
                )}
                
                {isLoading && currentPage === 1 ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    </div>
                ) : games.length === 0 && !gamesLoading ? (
                     <div className="text-center py-10">
                        <p className="text-xl text-muted-foreground">No games found matching your criteria.</p>
                        <p className="text-sm text-muted-foreground mt-2">Try adjusting your search or filters.</p>
                    </div>
                ) : (
                    <GamesGrid {...gamesGridProps} />
                )}

                {/* Load More Button is handled within GamesGrid or by its loadMoreGames prop */}
            </div>
        </div>
    );
};

export default CasinoMainPage;
