import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Game, DbGame, GameProvider, GameCategory, GameStatusEnum, GameVolatilityEnum, GameStatus } from '@/types/game';
import GameForm from '@/components/admin/GameForm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'; // Removed DialogTrigger, DialogFooter, DialogClose as form handles submission/cancel
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { PlusCircle, Edit, Trash2, Search, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import CMSPageHeader from '@/components/admin/cms/CMSPageHeader';
import ConfirmationDialog from '@/components/admin/shared/ConfirmationDialog';
// Removed convertAPIGameToUIGame, convertDbGameToGame, convertGameToDbGame as we use mapDbGameToGameAdapter and mapGameToDbGameAdapter
import { mapDbGameToGameAdapter, mapGameToDbGameAdapter } from '@/components/admin/GameAdapter';


const fetchAdminGames = async (searchTerm: string = ''): Promise<DbGame[]> => {
  let query = supabase.from('games').select('*').order('title', { ascending: true });
  if (searchTerm) {
    // Ensure search covers relevant fields like title, game_name, slug, provider_slug
    query = query.or(`title.ilike.%${searchTerm}%,game_name.ilike.%${searchTerm}%,slug.ilike.%${searchTerm}%,provider_slug.ilike.%${searchTerm}%`);
  }
  const { data, error } = await query;
  if (error) {
    console.error("Error fetching games:", error);
    throw new Error('Failed to fetch games');
  }
  return (data || []) as DbGame[];
};

const fetchProvidersForForm = async (): Promise<{ slug: string; name: string; id: string }[]> => {
    // Assuming 'game_providers' table has 'slug' and 'name', and 'id' (UUID or int)
    const { data, error } = await supabase.from('game_providers').select('id, name, slug').eq('is_active', true);
    if (error) throw error;
    // Ensure 'id' is string for consistency if GameForm's provider_id expects string
    return (data || []).map(p => ({ slug: p.slug, name: p.name, id: String(p.id) }));
};

const fetchCategoriesForForm = async (): Promise<{ slug: string; name: string }[]> => {
    const { data, error } = await supabase.from('game_categories').select('slug, name').eq('status', 'active'); // Assuming active categories
    if (error) throw error;
    return data || [];
};


const GamesManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<DbGame | null>(null); // Store DbGame for editing
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [gameToDelete, setGameToDelete] = useState<DbGame | null>(null);

  const { data: games = [], isLoading: isLoadingGames, refetch: refetchGames } = useQuery<DbGame[], Error>({
    queryKey: ['adminGames', searchTerm],
    queryFn: () => fetchAdminGames(searchTerm),
  });

  const { data: providersForForm = [], isLoading: isLoadingProviders } = useQuery<{ slug: string; name: string; id: string }[], Error>({
    queryKey: ['formProviders'],
    queryFn: fetchProvidersForForm,
    staleTime: Infinity,
  });

  const { data: categoriesForForm = [], isLoading: isLoadingCategories } = useQuery<{ slug: string; name: string }[], Error>({
    queryKey: ['formCategories'],
    queryFn: fetchCategoriesForForm,
    staleTime: Infinity,
  });
  
  const addOrUpdateGameMutation = useMutation<DbGame, Error, Partial<DbGame>>({
    mutationFn: async (gameData: Partial<DbGame>): Promise<DbGame> => {
      // gameData is already expected to be Partial<DbGame> by GameForm's onSubmit
      const payload = { ...gameData };
      // Remove id from payload if it's for an insert, Supabase handles ID generation or it's part of game_id
      if (!editingGame && payload.id) {
          // If it's a new game, ensure 'id' is not part of the insert payload unless it's a specific UUID you want to use
          // delete payload.id; // Or ensure your DB handles this. For now, assume payload.id from gameData is for updates.
      }


      if (editingGame && editingGame.id) {
        // For updates, ensure no `id` in the payload itself, use `eq('id', editingGame.id)`
        const updatePayload = { ...payload };
        delete updatePayload.id; // remove id from the object to update
        const { data, error } = await supabase.from('games').update(updatePayload).eq('id', editingGame.id).select().single();
        if (error) throw error;
        return data as DbGame;
      } else {
        // For inserts, Supabase typically generates the id or it's provided
        const insertPayload = { ...payload };
        // If your DB auto-generates UUIDs for 'id', you might not need to provide it.
        // If 'id' is manually set (e.g. from game_id), ensure it's in payload.
        const { data, error } = await supabase.from('games').insert(insertPayload).select().single();
        if (error) throw error;
        return data as DbGame;
      }
    },
    onSuccess: (data) => {
      toast.success(`Game ${editingGame ? 'updated' : 'added'} successfully: ${data.title || data.game_name}`);
      queryClient.invalidateQueries({ queryKey: ['adminGames'] });
      queryClient.invalidateQueries({ queryKey: ['allGames'] }); // Assuming this query key is used elsewhere
      queryClient.invalidateQueries({ queryKey: ['adminGamesList'] }); // If you have another list page
      handleFormSuccess();
    },
    onError: (error) => {
      toast.error(`Failed to save game: ${error.message}`);
    },
  });

  const deleteGameMutation = useMutation<void, Error, string>({
    mutationFn: async (gameId: string) => {
      const { error } = await supabase.from('games').delete().eq('id', gameId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Game deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['adminGames'] });
      queryClient.invalidateQueries({ queryKey: ['allGames'] });
      queryClient.invalidateQueries({ queryKey: ['adminGamesList'] });
      setShowDeleteConfirm(false);
      setGameToDelete(null);
    },
    onError: (error) => {
      toast.error(`Failed to delete game: ${error.message}`);
      setShowDeleteConfirm(false);
      setGameToDelete(null);
    },
  });

  const handleAddNewGame = () => {
    setEditingGame(null);
    setIsFormOpen(true);
  };

  const handleEditGame = (game: DbGame) => {
    setEditingGame(game); // GameForm will adapt this DbGame
    setIsFormOpen(true);
  };

  const handleDeleteGame = (game: DbGame) => {
    setGameToDelete(game);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteGame = () => {
    if (gameToDelete?.id) { // Ensure gameToDelete and its id are valid
      deleteGameMutation.mutate(gameToDelete.id);
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingGame(null);
  };
  
  const toggleGameStatusMutation = useMutation<void, Error, { gameId: string; newStatus: GameStatusEnum }>({
    mutationFn: async ({ gameId, newStatus }) => {
      const { error } = await supabase.from('games').update({ status: newStatus }).eq('id', gameId);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast.success(`Game status updated to ${variables.newStatus}`);
      queryClient.invalidateQueries({ queryKey: ['adminGames'] });
    },
    onError: (error) => {
      toast.error(`Failed to update game status: ${error.message}`);
    },
  });

  const handleToggleStatus = (game: DbGame) => {
    const newStatus = game.status === GameStatusEnum.ACTIVE ? GameStatusEnum.INACTIVE : GameStatusEnum.ACTIVE;
    if (game.id) {
      toggleGameStatusMutation.mutate({ gameId: game.id, newStatus });
    }
  };
  
  // GameForm now directly accepts DbGame or Game and its onSubmit expects DbGame compatible data.
  // No need for explicit transformation here if GameForm handles it.
  // const transformedEditingGame = useMemo(() => {
  //   if (!editingGame) return null;
  //   return mapDbGameToGameAdapter(editingGame); // GameForm expects Game, so adapt DbGame
  // }, [editingGame]);
  // GameForm's `game` prop can take DbGame directly and map it internally.

  return (
    <div className="p-6">
      <CMSPageHeader
        title="Games Management"
        description="Add, edit, and manage all casino games."
        actionButton={
          <Button onClick={handleAddNewGame}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Game
          </Button>
        }
      />

      <div className="my-6">
        <div className="relative">
          <Input
            placeholder="Search games by title, slug, provider..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      {isLoadingGames ? ( // Removed isLoadingProviders, isLoadingCategories from main loader check
        <p>Loading game data...</p>
      ) : (
        <div className="bg-card p-4 rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {games.map((game) => (
                <TableRow key={game.id}>
                  <TableCell className="font-medium">{game.title || game.game_name}</TableCell>
                  <TableCell>{game.provider_slug || game.distribution}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {game.category_slugs?.map(slug => <Badge key={slug} variant="secondary">{slug}</Badge>)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={game.status === GameStatusEnum.ACTIVE ? 'default' : 'outline'}
                      className={game.status === GameStatusEnum.ACTIVE ? 'bg-green-500 text-white' : 'border-gray-500'}
                    >
                      {game.status ? game.status.toString().charAt(0).toUpperCase() + game.status.toString().slice(1) : 'Unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                     <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleStatus(game)}
                        title={game.status === GameStatusEnum.ACTIVE ? "Deactivate" : "Activate"}
                        className="mr-2 hover:text-primary"
                        disabled={toggleGameStatusMutation.isPending && toggleGameStatusMutation.variables?.gameId === game.id}
                      >
                        {game.status === GameStatusEnum.ACTIVE ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEditGame(game)} className="mr-2 hover:text-blue-500">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteGame(game)} className="hover:text-red-500" disabled={deleteGameMutation.isPending && gameToDelete?.id === game.id}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
           {games.length === 0 && <p className="text-center py-4 text-muted-foreground">No games found.</p>}
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[800px] md:max-w-[1000px] lg:max-w-[1200px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingGame ? 'Edit Game' : 'Add New Game'}</DialogTitle>
          </DialogHeader>
          { (isLoadingProviders || isLoadingCategories) && !isFormOpen ? <p>Loading form dependencies...</p> :
            <GameForm
                game={editingGame} // Pass DbGame directly
                onSubmit={(values) => { // values here is Partial<DbGame>
                    addOrUpdateGameMutation.mutate(values);
                }}
                onCancel={() => setIsFormOpen(false)}
                providers={providersForForm} 
                categories={categoriesForForm}
                isLoading={addOrUpdateGameMutation.isPending}
            />
          }
        </DialogContent>
      </Dialog>
      
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDeleteGame}
        title="Confirm Deletion"
        description={`Are you sure you want to delete the game "${gameToDelete?.title || gameToDelete?.game_name}"? This action cannot be undone.`}
        confirmText="Delete"
        isDestructive
        isLoading={deleteGameMutation.isPending}
      />

    </div>
  );
};

export default GamesManagement;
