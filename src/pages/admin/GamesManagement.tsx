import React, { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Game, DbGame, GameProvider, GameCategory, GameStatusEnum, GameVolatilityEnum } from '@/types/game';
import GameForm from '@/components/admin/GameForm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { PlusCircle, Edit, Trash2, Search, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import CMSPageHeader, { CMSPageHeaderProps } from '@/components/admin/cms/CMSPageHeader'; // Import CMSPageHeaderProps
import ConfirmationDialog, { ConfirmationDialogProps } from '@/components/admin/shared/ConfirmationDialog'; // Import ConfirmationDialogProps

const fetchAdminGames = async (searchTerm: string = ''): Promise<DbGame[]> => {
  let query = supabase.from('games').select('*').order('title', { ascending: true });
  if (searchTerm) {
    query = query.or(`title.ilike.%${searchTerm}%,slug.ilike.%${searchTerm}%,provider_slug.ilike.%${searchTerm}%`);
  }
  const { data, error } = await query;
  if (error) {
    console.error("Error fetching games:", error);
    throw new Error('Failed to fetch games');
  }
  return data as DbGame[];
};

const fetchProvidersForForm = async (): Promise<{ slug: string; name: string }[]> => {
    const { data, error } = await supabase.from('game_providers').select('slug, name').eq('is_active', true);
    if (error) throw error;
    return data || [];
};

const fetchCategoriesForForm = async (): Promise<{ slug: string; name: string }[]> => {
    const { data, error } = await supabase.from('game_categories').select('slug, name'); // Add filtering if needed e.g. by active status
    if (error) throw error;
    return data || [];
};


const GamesManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<DbGame | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [gameToDelete, setGameToDelete] = useState<DbGame | null>(null);


  const { data: games = [], isLoading: isLoadingGames, refetch: refetchGames } = useQuery<DbGame[], Error>({
    queryKey: ['adminGames', searchTerm],
    queryFn: () => fetchAdminGames(searchTerm),
    staleTime: 1000 * 60 * 1, // 1 minute
  });

  const { data: providersForForm = [], isLoading: isLoadingProviders } = useQuery<{ slug: string; name: string }[], Error>({
    queryKey: ['formProviders'],
    queryFn: fetchProvidersForForm,
    staleTime: Infinity, // Providers list doesn't change often
  });

  const { data: categoriesForForm = [], isLoading: isLoadingCategories } = useQuery<{ slug: string; name: string }[], Error>({
    queryKey: ['formCategories'],
    queryFn: fetchCategoriesForForm,
    staleTime: Infinity, // Categories list doesn't change often
  });


  const deleteGameMutation = useMutation({
    mutationFn: async (gameId: string) => {
      const { error } = await supabase.from('games').delete().eq('id', gameId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Game deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['adminGames'] });
      queryClient.invalidateQueries({ queryKey: ['allGames'] }); // Also invalidate public games list
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
    if (gameToDelete) {
      deleteGameMutation.mutate(gameToDelete.id);
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingGame(null);
    refetchGames(); // Refetch games list after add/edit
  };
  
  const toggleGameStatusMutation = useMutation({
    mutationFn: async ({ gameId, newStatus }: { gameId: string; newStatus: GameStatusEnum }) => {
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
    toggleGameStatusMutation.mutate({ gameId: game.id, newStatus });
  };
  
  const cmsHeaderProps: CMSPageHeaderProps = {
    title:"Games Management",
    description:"Add, edit, and manage all casino games.",
    actions: ( // Changed actionButton to actions
      <Button onClick={handleAddNewGame}>
        <PlusCircle className="mr-2 h-4 w-4" /> Add New Game
      </Button>
    )
  };

  const deleteDialogProps: ConfirmationDialogProps = {
    isOpen:showDeleteConfirm,
    onClose:() => setShowDeleteConfirm(false),
    onConfirm:confirmDeleteGame,
    title:"Confirm Deletion",
    description:`Are you sure you want to delete the game "${gameToDelete?.title || gameToDelete?.game_name}"? This action cannot be undone.`,
    confirmText:"Delete",
    variant:"destructive", // Assuming 'variant' is used for styling, not 'isDestructive' directly
    isLoading:deleteGameMutation.isPending
  };


  return (
    <div className="p-6">
      <CMSPageHeader {...cmsHeaderProps} />

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

      {isLoadingGames || isLoadingProviders || isLoadingCategories ? (
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
                  <TableCell>{game.provider_slug}</TableCell>
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
                      >
                        {game.status === GameStatusEnum.ACTIVE ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEditGame(game)} className="mr-2 hover:text-blue-500">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteGame(game)} className="hover:text-red-500">
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
            />
          }
        </DialogContent>
      </Dialog>
      
      <ConfirmationDialog {...deleteDialogProps} />

    </div>
  );
};

export default GamesManagement;
