import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Game, GameProvider, GameCategory, GameStatusEnum, DbGame, GameStatus, GameTag } from '@/types/game'; // Use GameStatus
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Filter, PlusCircle, Edit2, Trash2, Eye, EyeOff, ExternalLink, Search, ListFilter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CMSPageHeader, { CMSPageHeaderProps } from '@/components/admin/cms/CMSPageHeader'; // Import props type
import ConfirmationDialog, { ConfirmationDialogProps } from '@/components/admin/shared/ConfirmationDialog'; // Import props type
// Use mapDbGameToGameAdapter from the centralized GameAdapter component
import { mapDbGameToGameAdapter } from '@/components/admin/GameAdapter'; 

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ITEMS_PER_PAGE = 15;

// Fetching DbGame and then mapping to Game for UI display
const fetchAdminGamesList = async (page: number, filters: any, searchTerm: string) => {
  const from = (page - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  let query = supabase
    .from('games')
    // Explicitly list fields for game_providers to avoid ambiguity and ensure correct data structure
    .select('*, game_providers!left(name, slug), game_categories!left(name, slug)', { count: 'exact' }) // Using left join for providers and categories
    .range(from, to)
    .order('created_at', { ascending: false });

  if (searchTerm) {
    query = query.or(`title.ilike.%${searchTerm}%,game_id.ilike.%${searchTerm}%,provider_slug.ilike.%${searchTerm}%,game_name.ilike.%${searchTerm}%`);
  }
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  // For provider filtering, ensure 'provider_slug' exists on the 'games' table.
  // If 'provider_slug' is on 'game_providers', the join and filter need care.
  // Assuming 'provider_slug' is directly on 'games' table:
  if (filters.provider) {
    query = query.eq('provider_slug', filters.provider); 
  }
   if (filters.category) {
     query = query.contains('category_slugs', [filters.category]);
  }

  const { data: rawDbGames, error, count } = await query;
  if (error) {
    console.error("Error fetching admin games list:", error);
    throw error;
  }
  
  const games: Game[] = (rawDbGames || []).map(dbGameAny => {
      const dbGame = dbGameAny as DbGame & { game_providers: any, game_categories: any[] }; // Type assertion for joined data
      // The mapDbGameToGameAdapter needs to correctly interpret dbGame.game_providers (if it's an object or array)
      // and dbGame.game_categories
      const mappedGame = mapDbGameToGameAdapter(dbGame);
      
      // Enhance with joined data if the adapter doesn't fully handle it
      if (dbGame.game_providers && typeof dbGame.game_providers === 'object' && dbGame.game_providers.name) {
          mappedGame.providerName = dbGame.game_providers.name;
          if (!mappedGame.provider_slug && dbGame.game_providers.slug) {
            mappedGame.provider_slug = dbGame.game_providers.slug;
          }
      }
      // if (dbGame.game_categories && Array.isArray(dbGame.game_categories)) {
      //     mappedGame.categoryNames = dbGame.game_categories.map((c: any) => c.name);
      //     // mappedGame.category_slugs might already be populated by adapter from dbGame.category_slugs
      // }
      return mappedGame;
  });
  return { games, totalCount: count || 0 };
};


const GamesPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<{ status: string; provider: string; category: string }>({
    status: '',
    provider: '',
    category: '',
  });
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [gameToDelete, setGameToDelete] = useState<Game | null>(null);

  const { data: gamesData, isLoading, error } = useQuery<{ games: Game[], totalCount: number }, Error>(
    {
      queryKey: ['adminGamesList', currentPage, filters, searchTerm],
      queryFn: () => fetchAdminGamesList(currentPage, filters, searchTerm),
      keepPreviousData: true, 
      staleTime: 5 * 60 * 1000
    }
  );

  const games = gamesData?.games || [];
  const totalCount = gamesData?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  
  // Fetching from 'game_providers' table
  const { data: providers = [] } = useQuery<GameProvider[], Error>({
    queryKey: ['allGameProvidersForAdminList'], // Unique queryKey
    queryFn: async () => {
    const { data, error } = await supabase.from('game_providers').select('id, name, slug').eq('is_active', true);
    if (error) throw error;
    return (data || []).map(p => ({...p, id: String(p.id), logo_url: '', is_active: true } as GameProvider));
  }});

  const { data: categories = [] } = useQuery<GameCategory[], Error>({
    queryKey:['allGameCategoriesForAdminList'], // Unique queryKey
    queryFn: async () => {
    const { data, error } = await supabase.from('game_categories').select('id, name, slug').eq('status', 'active');
    if (error) throw error;
    return (data || []).map(c => ({...c, id: String(c.id), icon: '', image_url: '' } as GameCategory)); 
  }});

  const deleteGameMutation = useMutation<void, Error, string>({
    mutationFn: async (gameId: string) => {
      const { error } = await supabase.from('games').delete().eq('id', gameId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Game deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['adminGamesList']});
      queryClient.invalidateQueries({ queryKey: ['adminGames'] }); // Invalidate detailed view if any
      queryClient.invalidateQueries({ queryKey: ['allGames'] }); 
      setShowDeleteConfirm(false);
      setGameToDelete(null);
    },
    onError: (error) => {
      toast.error(`Failed to delete game: ${error.message}`);
    },
  });
  
  const toggleGameStatusMutation = useMutation<void, Error, { gameId: string; newStatus: GameStatusEnum }>({
    mutationFn: async ({ gameId, newStatus }) => {
      const { error } = await supabase.from('games').update({ status: newStatus }).eq('id', gameId);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast.success(`Game status updated to ${variables.newStatus}`);
      queryClient.invalidateQueries({ queryKey: ['adminGamesList'] });
      queryClient.invalidateQueries({ queryKey: ['adminGames'] });
    },
    onError: (error) => {
      toast.error(`Failed to update game status: ${error.message}`);
    },
  });

  const handleFilterChange = (filterName: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setCurrentPage(1);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };
  
  const handleDelete = (game: Game) => {
    setGameToDelete(game);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (gameToDelete?.id) { // gameToDelete is of type Game, id is string
      deleteGameMutation.mutate(gameToDelete.id);
    }
  };
  
  const handleToggleStatus = (game: Game) => { // game is of type Game
    const newStatus = game.status === GameStatusEnum.ACTIVE ? GameStatusEnum.INACTIVE : GameStatusEnum.ACTIVE;
    toggleGameStatusMutation.mutate({ gameId: String(game.id), newStatus });
  };


  if (error) return <p className="text-red-500 p-4">Error loading games: {error.message}</p>;
  
  const headerProps: CMSPageHeaderProps = { // Explicitly type props
    title: "Manage Games",
    description: "Browse, filter, and manage all games in the casino.",
    actionButton: (
        <Button onClick={() => navigate('/admin/games-management')}> 
        <PlusCircle className="mr-2 h-4 w-4" /> Add/Edit Games Detailed
        </Button>
    )
  };

  const deleteDialogProps: ConfirmationDialogProps = { // Explicitly type props
    isOpen: showDeleteConfirm,
    onClose: () => setShowDeleteConfirm(false),
    onConfirm: confirmDelete,
    title: "Confirm Delete Game",
    description: `Are you sure you want to delete "${gameToDelete?.title}"? This action cannot be undone.`,
    isLoading: deleteGameMutation.isPending,
    confirmButtonVariant: "destructive", // Ensure this prop matches ConfirmationDialog definition
    confirmText: "Delete"
  };


  return (
    <div className="p-4 md:p-6 space-y-6">
      <CMSPageHeader {...headerProps} />

    <div className="space-y-4 p-4 border rounded-lg bg-card shadow">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-grow w-full md:w-auto">
            <Input
                placeholder="Search games by title, ID, provider..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full md:w-auto">
                <ListFilter className="mr-2 h-4 w-4" /> Filters
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 p-2 space-y-2" align="end">
                <DropdownMenuLabel>Status</DropdownMenuLabel>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                    <SelectTrigger><SelectValue placeholder="Filter by Status" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">All Statuses</SelectItem>
                        {Object.values(GameStatusEnum).map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
                    </SelectContent>
                </Select>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Provider</DropdownMenuLabel>
                 <Select value={filters.provider} onValueChange={(value) => handleFilterChange('provider', value)}>
                    <SelectTrigger><SelectValue placeholder="Filter by Provider" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">All Providers</SelectItem>
                        {providers?.map(p => <SelectItem key={p.slug} value={p.slug}>{p.name}</SelectItem>)}
                    </SelectContent>
                </Select>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Category</DropdownMenuLabel>
                <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                    <SelectTrigger><SelectValue placeholder="Filter by Category" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">All Categories</SelectItem>
                        {categories?.map(c => <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isLoading && <div className="flex justify-center py-8"><ListFilter className="h-8 w-8 animate-spin text-primary" /> <span className="ml-2">Loading games...</span></div>}
      {!isLoading && games.length === 0 && (
        <p className="text-center text-muted-foreground py-8">No games found matching your criteria.</p>
      )}

      {!isLoading && games.length > 0 && (
        <div className="overflow-x-auto bg-card rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Game Title</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {games.map((game) => ( // game is of type Game
                <TableRow key={game.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <img src={game.image || game.cover || '/placeholder-game.png'} alt={game.title} className="h-10 w-10 object-cover rounded-sm"/>
                      <div>
                        {game.title}
                        <p className="text-xs text-muted-foreground">{game.game_id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{game.providerName || game.provider_slug}</TableCell>
                  <TableCell className="max-w-xs">
                    <div className="flex flex-wrap gap-1">
                      {/* Ensure category_slugs is an array of strings before slicing */}
                      {(game.category_slugs || []).slice(0,3).map(slug => {
                        const category = categories?.find(c=>c.slug===slug);
                        return <Badge key={slug} variant="secondary" className="text-xs">{category?.name || slug}</Badge>
                      })}
                      {game.category_slugs && game.category_slugs.length > 3 && <Badge variant="outline" className="text-xs">+{game.category_slugs.length - 3} more</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={game.status === GameStatusEnum.ACTIVE ? 'default' : 'outline'} 
                           className={`${game.status === GameStatusEnum.ACTIVE ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'} text-xs`}>
                      {game.status.charAt(0).toUpperCase() + game.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => handleToggleStatus(game)} title={game.status === GameStatusEnum.ACTIVE ? "Deactivate" : "Activate"} disabled={toggleGameStatusMutation.isPending && toggleGameStatusMutation.variables?.gameId === String(game.id)}>
                      {game.status === GameStatusEnum.ACTIVE ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    {/* Edit should go to the more detailed form page */}
                    <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/games-management`, { state: { gameIdToEdit: game.id } })} title="Edit Game Details">
                       <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(game)} title="Delete" disabled={deleteGameMutation.isPending && gameToDelete?.id === game.id}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                     {game.frontend_url && <Button variant="ghost" size="icon" onClick={() => window.open(game.frontend_url, '_blank')} title="View on Frontend">
                      <ExternalLink className="h-4 w-4" />
                    </Button>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1 || isLoading}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages || isLoading}
          >
            Next
          </Button>
        </div>
      )}
      
      <ConfirmationDialog {...deleteDialogProps} />
    </div>
  );
};

export default GamesPage;
