
import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Game, GameProvider, GameCategory, GameStatusEnum, DbGame } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Filter, PlusCircle, Edit2, Trash2, Eye, EyeOff, ExternalLink, Search, ListFilter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CMSPageHeader from '@/components/admin/cms/CMSPageHeader'; // Assume this is a shared component
import ConfirmationDialog from '@/components/admin/shared/ConfirmationDialog';
import { convertDbGameToGame, convertAPIGameToUIGame } from '@/utils/gameTypeAdapter';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ITEMS_PER_PAGE = 15;

const fetchAdminGamesList = async (page: number, filters: any, searchTerm: string) => {
  const from = (page - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  let query = supabase
    .from('games')
    .select('*, provider:game_providers(name), categories:game_categories(name, slug)', { count: 'exact' }) // Example of fetching related data
    .range(from, to)
    .order('created_at', { ascending: false });

  if (searchTerm) {
    query = query.or(`title.ilike.%${searchTerm}%,game_id.ilike.%${searchTerm}%,provider_slug.ilike.%${searchTerm}%`);
  }
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  if (filters.provider) {
    // This requires provider_slug on games table or a join if filtering by provider name/id
    query = query.eq('provider_slug', filters.provider); 
  }
   if (filters.category) {
    // This requires category_slugs on games table (array) or a join
     query = query.contains('category_slugs', [filters.category]);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { games: (data?.map(item => ({...item, providerName: item.provider?.name, categoryNames: item.categories?.map(c => c.name)} as unknown as Game)) || []), totalCount: count || 0 };
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

  const { data: gamesData, isLoading, error, refetch } = useQuery(
    ['adminGamesList', currentPage, filters, searchTerm], // Corrected queryKey
    () => fetchAdminGamesList(currentPage, filters, searchTerm),
    { keepPreviousData: true, staleTime: 5 * 60 * 1000 }
  );

  const games = gamesData?.games || [];
  const totalCount = gamesData?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  
  // Fetch providers and categories for filter dropdowns
  const { data: providers } = useQuery<GameProvider[], Error>({queryKey: ['allGameProviders'], queryFn: async () => {
    const { data, error } = await supabase.from('game_providers').select('*').eq('is_active', true);
    if (error) throw error;
    return data || [];
  }});
  const { data: categories } = useQuery<GameCategory[], Error>({queryKey:['allGameCategories'], queryFn: async () => {
    const { data, error } = await supabase.from('game_categories').select('*'); // assuming 'name', 'slug' exist
    if (error) throw error;
    return data || [];
  }});


  const deleteGameMutation = useMutation<void, Error, string>({
    mutationFn: async (gameId: string) => {
      const { error } = await supabase.from('games').delete().eq('id', gameId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Game deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['adminGamesList']});
      setShowDeleteConfirm(false);
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
    },
    onError: (error) => {
      toast.error(`Failed to update game status: ${error.message}`);
    },
  });

  const handleFilterChange = (filterName: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setCurrentPage(1); // Reset to first page on filter change
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
    if (gameToDelete) {
      deleteGameMutation.mutate(String(gameToDelete.id));
    }
  };
  
  const handleToggleStatus = (game: Game) => {
    const newStatus = game.status === GameStatusEnum.ACTIVE ? GameStatusEnum.INACTIVE : GameStatusEnum.ACTIVE;
    toggleGameStatusMutation.mutate({ gameId: String(game.id), newStatus });
  };


  if (error) return <p className="text-red-500 p-4">Error loading games: {error.message}</p>;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <CMSPageHeader
        title="Manage Games"
        description="Browse, filter, and manage all games in the casino."
        actionButton={
          <Button onClick={() => navigate('/admin/cms/games/new')}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Game
          </Button>
        }
      />

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
                        {Object.values(GameStatusEnum).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                </Select>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Provider</DropdownMenuLabel>
                 <Select value={filters.provider} onValueChange={(value) => handleFilterChange('provider', value)}>
                    <SelectTrigger><SelectValue placeholder="Filter by Provider" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">All Providers</SelectItem>
                        {providers?.map(p => <SelectItem key={p.id} value={p.slug}>{p.name}</SelectItem>)}
                    </SelectContent>
                </Select>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Category</DropdownMenuLabel>
                <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                    <SelectTrigger><SelectValue placeholder="Filter by Category" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">All Categories</SelectItem>
                        {categories?.map(c => <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>


      {isLoading && <p>Loading games...</p>}
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
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {games.map((game) => (
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
                      {game.category_slugs?.slice(0,3).map(slug => <Badge key={slug} variant="secondary" className="text-xs">{categories?.find(c=>c.slug===slug)?.name || slug}</Badge>)}
                      {game.category_slugs && game.category_slugs.length > 3 && <Badge variant="outline">+{game.category_slugs.length - 3} more</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={game.status === GameStatusEnum.ACTIVE ? 'default' : 'outline'} 
                           className={game.status === GameStatusEnum.ACTIVE ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                      {game.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => handleToggleStatus(game)} title={game.status === GameStatusEnum.ACTIVE ? "Deactivate" : "Activate"} disabled={toggleGameStatusMutation.isPending && toggleGameStatusMutation.variables?.gameId === String(game.id)}>
                      {game.status === GameStatusEnum.ACTIVE ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/cms/games/edit/${game.id}`)} title="Edit">
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
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages || isLoading}
          >
            Next
          </Button>
        </div>
      )}
      
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Confirm Delete Game"
        description={`Are you sure you want to delete "${gameToDelete?.title}"? This action cannot be undone.`}
        isLoading={deleteGameMutation.isPending}
        isDestructive
      />
    </div>
  );
};

export default GamesPage;
