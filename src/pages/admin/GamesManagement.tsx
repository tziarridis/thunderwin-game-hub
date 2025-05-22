import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Game, DbGame, GameProvider as FormGameProvider, GameCategory as FormGameCategory, GameStatusEnum, GameVolatilityEnum, GameStatus } from '@/types/game';
import GameForm from '@/components/admin/GameForm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { PlusCircle, Edit, Trash2, Search, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import CMSPageHeader, { CMSPageHeaderProps } from '@/components/admin/cms/CMSPageHeader'; // Import props type
import ConfirmationDialog, { ConfirmationDialogProps } from '@/components/admin/shared/ConfirmationDialog'; // Import props type
import { useLocation } from 'react-router-dom'; // To get gameIdToEdit from state

// Removed convertAPIGameToUIGame, convertDbGameToGame, convertGameToDbGame as GameForm and adapter handle this.

const fetchAdminGames = async (searchTerm: string = ''): Promise<DbGame[]> => {
  let query = supabase.from('games').select('*').order('title', { ascending: true });
  if (searchTerm) {
    query = query.or(`title.ilike.%${searchTerm}%,game_name.ilike.%${searchTerm}%,slug.ilike.%${searchTerm}%,provider_slug.ilike.%${searchTerm}%`);
  }
  const { data, error } = await query;
  if (error) {
    console.error("Error fetching games for management:", error);
    throw new Error('Failed to fetch games');
  }
  return (data || []) as DbGame[];
};

// Fetching from 'game_providers'
const fetchProvidersForForm = async (): Promise<FormGameProvider[]> => {
    const { data, error } = await supabase.from('game_providers').select('id, name, slug, logo_url, is_active').eq('is_active', true);
    if (error) throw error;
    return (data || []).map(p => ({ slug: p.slug, name: p.name, id: String(p.id), logo_url: p.logo_url, is_active: p.is_active } as FormGameProvider));
};

// Fetching from 'game_categories'
const fetchCategoriesForForm = async (): Promise<FormGameCategory[]> => {
    const { data, error } = await supabase.from('game_categories').select('id, slug, name, icon, image_url, status').eq('status', 'active');
    if (error) throw error;
    return (data || []).map(c => ({slug: c.slug, name: c.name, id: String(c.id), icon:c.icon, image_url:c.image_url, status:c.status} as FormGameCategory));
};


const GamesManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const location = useLocation();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<DbGame | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [gameToDelete, setGameToDelete] = useState<DbGame | null>(null);

  const { data: games = [], isLoading: isLoadingGamesTable, refetch: refetchGames } = useQuery<DbGame[], Error>({
    queryKey: ['adminGamesForManagementTable', searchTerm], // Unique key for this component's game list
    queryFn: () => fetchAdminGames(searchTerm),
  });

  const { data: providersForForm = [], isLoading: isLoadingProviders } = useQuery<FormGameProvider[], Error>({
    queryKey: ['formProvidersForGameForm'], // Unique key
    queryFn: fetchProvidersForForm,
    staleTime: Infinity,
  });

  const { data: categoriesForForm = [], isLoading: isLoadingCategories } = useQuery<FormGameCategory[], Error>({
    queryKey: ['formCategoriesForGameForm'], // Unique key
    queryFn: fetchCategoriesForForm,
    staleTime: Infinity,
  });

  // Effect to open form if gameIdToEdit is passed in navigation state
  useEffect(() => {
    if (location.state?.gameIdToEdit) {
      const gameId = location.state.gameIdToEdit;
      const gameToEdit = games.find(g => g.id === gameId);
      if (gameToEdit) {
        setEditingGame(gameToEdit);
        setIsFormOpen(true);
      } else if (!isLoadingGamesTable) {
        // If games are loaded but not found, maybe fetch it individually or show error
        console.warn(`Game with ID ${gameId} not found in the list for editing.`);
        // Optionally, fetch the specific game if not found in the list:
        // supabase.from('games').select('*').eq('id', gameId).single().then(({ data, error }) => { ... });
      }
    }
  }, [location.state, games, isLoadingGamesTable]);
  
  // GameForm's onSubmit now directly calls the mutation in GameForm itself.
  // No addOrUpdateGameMutation needed here anymore if GameForm encapsulates it.
  // However, if we want to keep mutation logic here:
  // const addOrUpdateGameMutation = useMutation... (as before)

  const deleteGameMutation = useMutation<void, Error, string>({
    mutationFn: async (gameId: string) => {
      const { error } = await supabase.from('games').delete().eq('id', gameId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Game deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['adminGamesForManagementTable'] });
      queryClient.invalidateQueries({ queryKey: ['adminGamesList'] }); // For the other admin games page
      queryClient.invalidateQueries({ queryKey: ['allGames'] }); // Public games list
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
    setEditingGame(game);
    setIsFormOpen(true);
  };

  const handleDeleteGame = (game: DbGame) => {
    setGameToDelete(game);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteGame = () => {
    if (gameToDelete?.id) {
      deleteGameMutation.mutate(gameToDelete.id);
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingGame(null);
    refetchGames(); 
  };
  
  const toggleGameStatusMutation = useMutation<void, Error, { gameId: string; newStatus: GameStatusEnum }>({
    mutationFn: async ({ gameId, newStatus }) => {
      const { error } = await supabase.from('games').update({ status: newStatus }).eq('id', gameId);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast.success(`Game status updated to ${variables.newStatus}`);
      queryClient.invalidateQueries({ queryKey: ['adminGamesForManagementTable'] });
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
  
  const headerProps: CMSPageHeaderProps = { // Explicitly type props
    title: "Games Management",
    description: "Add, edit, and manage all casino games.",
    actionButton: (
        <Button onClick={handleAddNewGame}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Game
        </Button>
    )
  };

   const deleteDialogProps: ConfirmationDialogProps = { // Explicitly type props
    isOpen: showDeleteConfirm,
    onClose: () => setShowDeleteConfirm(false),
    onConfirm: confirmDeleteGame,
    title: "Confirm Deletion",
    description: `Are you sure you want to delete the game "${gameToDelete?.title || gameToDelete?.game_name}"? This action cannot be undone.`,
    confirmText: "Delete",
    confirmButtonVariant: "destructive", // Ensure this prop matches ConfirmationDialog definition
    isLoading: deleteGameMutation.isPending
  };


  return (
    <div className="p-6">
      <CMSPageHeader {...headerProps} />

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

      {isLoadingGamesTable ? (
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
                game={editingGame} 
                onSubmitSuccess={handleFormSuccess}
                onCancel={() => setIsFormOpen(false)}
                providers={providersForForm} 
                categories={categoriesForForm}
                // isLoading={addOrUpdateGameMutation.isPending} // If mutation is in GameForm, it handles its own loading state
            />
          }
        </DialogContent>
      </Dialog>
      
      <ConfirmationDialog {...deleteDialogProps} />

    </div>
  );
};

export default GamesManagement;
