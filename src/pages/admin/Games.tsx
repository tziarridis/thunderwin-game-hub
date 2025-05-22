
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient, QueryKey } from '@tanstack/react-query';
import { Game, GameCategory, GameProvider, DbGame, GameStatusEnum } from '@/types/game';
import GameForm from '@/components/admin/GameForm';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { mapDbGameToGameAdapter, mapGameToDbGameAdapter } from '@/components/admin/GameAdapter';
import { PlusCircle, Edit, Trash2, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Utility function to fetch games for admin view (includes all statuses)
const fetchAdminGames = async (filters: { searchTerm?: string; providerSlug?: string; categorySlug?: string; status?: string }): Promise<DbGame[]> => {
  let query = supabase.from('games').select(`
    *
  `); // Simplified select to avoid join errors

  if (filters.searchTerm) {
    query = query.ilike('title', `%${filters.searchTerm}%`);
  }
  if (filters.providerSlug) {
    query = query.eq('provider_slug', filters.providerSlug);
  }
  if (filters.categorySlug) {
    query = query.filter('category_slugs', 'cs', `{${filters.categorySlug}}`);
  }
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  query = query.order('title', { ascending: true });

  const { data, error } = await query;
  if (error) {
    toast.error('Failed to fetch games: ' + error.message);
    throw error;
  }
  return data as DbGame[];
};

// Utility function to fetch providers for filter dropdown
const fetchAdminProviders = async (): Promise<GameProvider[]> => {
  try {
    const { data, error } = await supabase
      .from('providers')
      .select('id, name, logo, is_active')
      .eq('status', 'active');
    
    if (error) throw error;
    
    // Convert to expected GameProvider format with generated slug
    const providers = (data || []).map(p => ({
      id: p.id,
      name: p.name,
      slug: p.name.toLowerCase().replace(/\s+/g, '-'), // Generate slug from name
      logo: p.logo,
      is_active: p.is_active
    }));
    
    return providers;
  } catch (error) {
    console.error("Error fetching providers:", error);
    toast.error("Failed to load providers");
    return [];
  }
};

// Utility function to fetch categories for filter dropdown
const fetchAdminCategories = async (): Promise<GameCategory[]> => {
  const { data, error } = await supabase.from('game_categories').select('id, name, slug, image, status').eq('status', 'active');
  if (error) throw error;
  return (data as GameCategory[]) || []; // Cast to GameCategory from types/game.ts
};


const AdminGamesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<DbGame | undefined>(undefined);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);


  const queryKey: QueryKey = ['adminGames', { searchTerm, providerSlug: selectedProvider, categorySlug: selectedCategory, status: selectedStatus }];

  const { data: games = [], isLoading: isLoadingGames } = useQuery({
    queryKey: queryKey,
    queryFn: () => fetchAdminGames({ searchTerm, providerSlug: selectedProvider, categorySlug: selectedCategory, status: selectedStatus }),
  });

  const { data: providers = [], isLoading: isLoadingProviders } = useQuery({
    queryKey: ['adminProviders'],
    queryFn: fetchAdminProviders,
  });

  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['adminCategories'],
    queryFn: fetchAdminCategories,
  });


  const upsertGameMutation = useMutation({
    mutationFn: async (gameData: DbGame) => {
      // Ensure slug is generated if not provided
      if (!gameData.slug && gameData.title) {
        gameData.slug = gameData.title.toLowerCase().replace(/\s+/g, '-');
      }
      
      // Separate meta properties if they are part of gameData and need special handling
      const { meta_demo_url, meta_real_url, ...restOfGameData } = gameData as any; // Type assertion for meta

      let finalGameData: Partial<DbGame> = { ...restOfGameData };

      // Handle provider_id based on provider_slug
      if (gameData.provider_slug) {
        const provider = providers.find(p => p.slug === gameData.provider_slug);
        if (provider && provider.id) {
          finalGameData.provider_id = String(provider.id); // Ensure it's string if DB expects UUID as string
        } else {
            // This case should ideally be handled by form validation
            toast.error(`Provider with slug ${gameData.provider_slug} not found.`);
            throw new Error(`Provider with slug ${gameData.provider_slug} not found.`);
        }
      }

      let response;
      if (finalGameData.id) {
        // Update
        const { data, error } = await supabase.from('games').update(finalGameData).eq('id', finalGameData.id).select().single();
        if (error) throw error;
        response = data;
      } else {
        // Create
        const { data, error } = await supabase.from('games').insert(finalGameData).select().single();
        if (error) throw error;
        response = data;
      }
      return response as DbGame;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminGames'] });
      toast.success(`Game ${editingGame ? 'updated' : 'added'} successfully!`);
      setIsFormOpen(false);
      setEditingGame(undefined);
    },
    onError: (error) => {
      toast.error(`Failed to save game: ${error.message}`);
    },
  });

  const deleteGameMutation = useMutation({
    mutationFn: async (gameId: string) => {
      const { error } = await supabase.from('games').delete().eq('id', gameId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminGames'] });
      toast.success('Game deleted successfully!');
    },
    onError: (error) => {
      toast.error('Failed to delete game: ' + error.message);
    },
  });

  const handleEdit = (game: DbGame) => {
    setEditingGame(game);
    setIsFormOpen(true);
  };

  const handleDelete = (gameId: string) => {
    if (window.confirm('Are you sure you want to delete this game?')) {
      deleteGameMutation.mutate(gameId);
    }
  };
  
  const displayedGames = useMemo(() => games.map(dbGame => mapDbGameToGameAdapter(dbGame)), [games]);


  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Games Management</h1>
        <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
          setIsFormOpen(isOpen);
          if (!isOpen) setEditingGame(undefined);
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingGame(undefined); setIsFormOpen(true); }}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Game
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] md:max-w-[800px] lg:max-w-[1000px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingGame ? 'Edit Game' : 'Add New Game'}</DialogTitle>
            </DialogHeader>
            <GameForm
              game={editingGame}
              onSave={(gameData) => upsertGameMutation.mutate(gameData)}
              onCancel={() => { setIsFormOpen(false); setEditingGame(undefined); }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-card rounded-lg shadow">
        <Input
          placeholder="Search by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-background"
        />
        <Select value={selectedProvider} onValueChange={(value) => setSelectedProvider(value === 'all' ? undefined : value)}>
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Filter by provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Providers</SelectItem>
            {providers.map(p => <SelectItem key={p.slug} value={p.slug}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value === 'all' ? undefined : value)}>
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(c => <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value === 'all' ? undefined : value)}>
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.values(GameStatusEnum).map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>


      {isLoadingGames && <p>Loading games...</p>}
      {!isLoadingGames && (
        <div className="overflow-x-auto bg-card rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedGames.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                    No games found.
                  </TableCell>
                </TableRow>
              )}
              {displayedGames.map((game) => (
                <TableRow key={game.id}>
                  <TableCell className="font-medium">{game.title}</TableCell>
                  <TableCell>{game.providerName || game.provider_slug}</TableCell>
                  <TableCell>{game.categoryNames?.join(', ') || game.category_slugs?.join(', ') || 'N/A'}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full ${game.status === GameStatusEnum.ACTIVE ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                      {game.status}
                    </span>
                  </TableCell>
                  <TableCell>{game.is_featured ? 'Yes' : 'No'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(games.find(g => g.id === game.id)!)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive/80" onClick={() => handleDelete(game.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminGamesPage;
