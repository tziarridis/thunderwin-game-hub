import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient, QueryKey } from '@tanstack/react-query';
import { gameService } from '@/services/gameService';
import { DbGame, GameCategory, GameProvider } from '@/types';
import AdminPageLayout from '@/components/layout/AdminPageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable, DataTableColumn } from '@/components/ui/data-table';
import GameForm from '@/components/admin/GameForm';
import ConfirmationDialog from '@/components/admin/shared/ConfirmationDialog';
import { toast } from 'sonner';
import { PlusCircle, Search, Edit, Trash2, RefreshCw, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const fetchCategories = async (): Promise<GameCategory[]> => {
  const categories = await gameService.getGameCategories();
  return categories || [];
};

const fetchProviders = async (): Promise<GameProvider[]> => {
  const providers = await gameService.getGameProviders();
  return providers || [];
};

type GamesQueryResponse = { games: DbGame[], count: number };

const GamesManagementPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<DbGame | Partial<DbGame> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const { data: gamesData, isLoading: isLoadingGames, refetch: refetchGames } = useQuery<GamesQueryResponse, Error, GamesQueryResponse, QueryKey>({
    queryKey: ['adminGames', searchTerm, pagination] as QueryKey,
    queryFn: async (): Promise<GamesQueryResponse> => {
      const filters = { 
        search: searchTerm || undefined, 
        limit: pagination.pageSize, 
        offset: pagination.pageIndex * pagination.pageSize,
      };
      const result = await gameService.getAllGames(filters);
      return result;
    },
  });

  const games = gamesData?.games || [];
  const totalCount = gamesData?.count || 0;
  const pageCount = totalCount > 0 ? Math.ceil(totalCount / pagination.pageSize) : 0;
  
  const { data: categories, isLoading: isLoadingCategories } = useQuery<GameCategory[], Error>({
    queryKey: ['gameCategories'],
    queryFn: fetchCategories,
  });

  const { data: providers, isLoading: isLoadingProviders } = useQuery<GameProvider[], Error>({
    queryKey: ['gameProviders'],
    queryFn: fetchProviders,
  });

  const createOrUpdateGameMutation = useMutation({
    mutationFn: async (gameData: Partial<DbGame>) => {
      if (gameData.id) {
        return gameService.updateGame(String(gameData.id), gameData);
      } else {
        const createData = { ...gameData };
        delete createData.id; 
        const requiredFields: Omit<DbGame, 'id' | 'created_at' | 'updated_at'> = {
          title: createData.title || 'Untitled Game',
          slug: createData.slug || `untitled-game-${Date.now()}`,
          provider_id: String(createData.provider_id) || '',
          status: createData.status || 'active',
          rtp: createData.rtp || 0,
          image_url: createData.image_url || '',
          game_name: createData.game_name || createData.title || 'Untitled Game',
        };
        return gameService.createGame(requiredFields);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminGames'] });
      toast.success(`Game ${selectedGame && (selectedGame as DbGame).id ? 'updated' : 'created'} successfully!`);
      setIsFormOpen(false);
      setSelectedGame(null);
    },
    onError: (error: Error) => {
      toast.error(`Failed to ${selectedGame && (selectedGame as DbGame).id ? 'update' : 'create'} game: ${error.message}`);
    },
  });

  const deleteGameMutation = useMutation({
    mutationFn: (gameId: string) => gameService.deleteGame(gameId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminGames'] });
      toast.success('Game deleted successfully!');
      setIsConfirmDeleteDialogOpen(false);
      setSelectedGame(null);
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete game: ${error.message}`);
    },
  });
  
  const handleAddNew = () => {
    setSelectedGame({}); 
    setIsFormOpen(true);
  };

  const handleEdit = (game: DbGame) => {
    setSelectedGame(game);
    setIsFormOpen(true);
  };

  const handleDelete = (game: DbGame) => {
    setSelectedGame(game);
    setIsConfirmDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedGame && (selectedGame as DbGame).id) {
      deleteGameMutation.mutate(String((selectedGame as DbGame).id));
    }
  };

  const handleSubmitForm = (values: Partial<DbGame>) => {
    createOrUpdateGameMutation.mutate(values);
  };

  const columns: DataTableColumn<DbGame>[] = [
    { 
      accessorKey: "id", 
      header: "ID", 
      cell: (row) => <span className="truncate w-20 block">{String(row.id)}</span> 
    },
    { accessorKey: "title", header: "Title" },
    { 
      accessorKey: "provider", 
      header: "Provider", 
      cell: (row) => row.provider?.name || row.providerName || String(row.provider_id) || 'N/A'
    },
    { 
      accessorKey: "categories", 
      header: "Categories", 
      cell: (row) => {
        if (row.categories && Array.isArray(row.categories) && row.categories.length > 0) {
          return row.categories.map(cat => (cat as GameCategory).name).join(', ');
        }
        return row.category_slugs?.join(', ') || 'N/A';
      }
    },
    { 
      accessorKey: "status", 
      header: "Status", 
      cell: (row) => <Badge variant={row.status === 'active' ? 'default' : 'secondary'}>{row.status}</Badge>
    },
    { 
      accessorKey: "rtp", 
      header: "RTP", 
      cell: (row) => row.rtp ? `${row.rtp}%` : 'N/A'
    },
    {
      accessorKey: "actions", 
      header: "Actions",
      cell: (row) => (
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => handleEdit(row)}><Edit className="h-4 w-4" /></Button>
          <Button variant="destructive" size="sm" onClick={() => handleDelete(row)}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ];

  const pageHeaderActions = (
    <div className="flex items-center gap-2">
      <Button onClick={handleAddNew}>
        <PlusCircle className="mr-2 h-4 w-4" /> Add New Game
      </Button>
      <Button onClick={() => refetchGames()} variant="outline" disabled={isLoadingGames || createOrUpdateGameMutation.isPending || deleteGameMutation.isPending}>
        {isLoadingGames ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
        Refresh
      </Button>
    </div>
  );

  return (
    <AdminPageLayout title="Games Management" headerActions={pageHeaderActions}>
      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-grow">
          <Input
            placeholder="Search games by title, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      <DataTable columns={columns} data={games} />

      {isFormOpen && (
        <GameForm 
          onCancel={() => setIsFormOpen(false)}
          onSubmit={handleSubmitForm}
          initialData={selectedGame as Partial<DbGame>}
          categories={categories || []}
          providers={providers || []}
          isLoading={createOrUpdateGameMutation.isPending}
        />
      )}

      {selectedGame && (selectedGame as DbGame).id && (
        <ConfirmationDialog
          isOpen={isConfirmDeleteDialogOpen}
          onClose={() => setIsConfirmDeleteDialogOpen(false)} 
          title="Delete Game"
          description={`Are you sure you want to delete "${(selectedGame as DbGame).title}"? This action cannot be undone.`}
          onConfirm={confirmDelete}
          confirmText="Delete"
          isLoading={deleteGameMutation.isPending}
        />
      )}
    </AdminPageLayout>
  );
};

export default GamesManagementPage;
