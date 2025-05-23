import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient, QueryKey } from '@tanstack/react-query';
import { ColumnDef, SortingState, getCoreRowModel, getSortedRowModel, getPaginationRowModel, useReactTable, Table as ReactTableInstance } from "@tanstack/react-table"; // Renamed Table to ReactTableInstance
import { gameService } from '@/services/gameService';
import { Game, GameCategory, GameProvider as ProviderType, DbGame } from '@/types'; // Game should be DbGame or a display version
import AdminPageLayout from '@/components/layout/AdminPageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import GameForm from '@/components/admin/GameForm';
import ConfirmationDialog from '@/components/admin/shared/ConfirmationDialog';
import { toast } from 'sonner';
import { PlusCircle, Search, Edit, Trash2, RefreshCw, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Mock data fetching functions (replace with actual service calls)
// These should ideally come from a service or be part of gameService
const fetchCategories = async (): Promise<GameCategory[]> => {
  const { data, error } = await gameService.getGameCategories(); // Assuming this service method exists
  if (error) throw new Error('Failed to fetch categories');
  return data || [];
};

const fetchProviders = async (): Promise<ProviderType[]> => {
 const { data, error } = await gameService.getGameProviders(); // Assuming this service method exists
  if (error) throw new Error('Failed to fetch providers');
  return data || [];
};


type GamesQueryResponse = { games: DbGame[], totalCount: number }; // Use DbGame for consistency with form

const GamesManagementPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<DbGame | Partial<DbGame> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);

  const { data: gamesData, isLoading: isLoadingGames, refetch: refetchGames } = useQuery<GamesQueryResponse, Error, GamesQueryResponse, QueryKey>({
    queryKey: ['adminGames', searchTerm, pagination, sorting] as QueryKey,
    queryFn: async (): Promise<GamesQueryResponse> => {
      const filters = { 
        search: searchTerm || undefined, 
        limit: pagination.pageSize, 
        offset: pagination.pageIndex * pagination.pageSize,
        sortBy: sorting.length > 0 ? sorting[0].id : undefined,
        sortOrder: sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : undefined,
      };
      const result = await gameService.getAllGames(filters); // Assuming getAllGames returns { games: DbGame[], count: number } or similar
      const gamesList = result.games || (Array.isArray(result) ? result : []); // Handle if result is just an array
      const total = result.count ?? result.totalCount ?? gamesList.length; // Adjusted to check for count or totalCount
      return { games: gamesList, totalCount: total };
    },
  });

  const games = gamesData?.games || [];
  const totalCount = gamesData?.totalCount || 0;
  const pageCount = totalCount > 0 ? Math.ceil(totalCount / pagination.pageSize) : 0;
  
  const { data: categories, isLoading: isLoadingCategories } = useQuery<GameCategory[], Error>({
    queryKey: ['gameCategories'],
    queryFn: fetchCategories,
  });

  const { data: providers, isLoading: isLoadingProviders } = useQuery<ProviderType[], Error>({
    queryKey: ['gameProviders'],
    queryFn: fetchProviders,
  });

  const createOrUpdateGameMutation = useMutation({
    mutationFn: async (gameData: Partial<DbGame>) => {
      const idToUse = gameData.id ? String(gameData.id) : undefined;

      if (idToUse) {
        return gameService.updateGame(idToUse, gameData as Partial<DbGame>);
      } else {
        const createData = { ...gameData };
        delete createData.id; 
        // Ensure all required fields for creation are present
        const requiredFields: Omit<DbGame, 'id' | 'created_at' | 'updated_at' | 'provider' | 'categories' | 'tags' | 'features' | 'volatility' | 'type' | 'providerName' | 'category_slugs'> = {
            title: createData.title || 'Untitled Game',
            slug: createData.slug || `untitled-game-${Date.now()}`,
            provider_id: String(createData.provider_id) || '', // must be string
            status: createData.status || 'active', // default status
            // Add other required fields with defaults if necessary
            rtp: createData.rtp || 0,
            image_url: createData.image_url || '',
        };

        return gameService.createGame(requiredFields as Omit<DbGame, 'id' | 'created_at' | 'updated_at'>);
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
    const gameDataToSubmit: Partial<DbGame> = {
        ...values,
        provider_id: typeof values.provider_id === 'object' && values.provider_id !== null 
                       ? String((values.provider_id as ProviderType)?.id) 
                       : (values.provider_id ? String(values.provider_id) : undefined),
        rtp: values.rtp ? Number(values.rtp) : undefined,
        category_ids: values.category_ids ? (values.category_ids as (string[] | GameCategory[])).map(cat => typeof cat === 'string' ? cat : cat.id) : undefined,
    };
    if (selectedGame && (selectedGame as DbGame).id) {
        gameDataToSubmit.id = String((selectedGame as DbGame).id);
    }
    createOrUpdateGameMutation.mutate(gameDataToSubmit);
  };

  const columns: ColumnDef<DbGame>[] = [
    { accessorKey: "id", header: "ID", cell: ({ row }) => <span className="truncate w-20 block">{String(row.original.id)}</span> },
    { accessorKey: "title", header: "Title" },
    { 
      accessorKey: "provider.name", // Access nested provider name
      header: "Provider", 
      cell: ({row}) => row.original.provider?.name || row.original.providerName || String(row.original.provider_id) || 'N/A'
    },
    { 
      accessorKey: "categories", 
      header: "Categories", 
      cell: ({row}) => {
        if (row.original.categories && Array.isArray(row.original.categories) && row.original.categories.length > 0) {
          return row.original.categories.map(cat => (cat as GameCategory).name).join(', ');
        }
        return row.original.category_slugs?.join(', ') || 'N/A';
      }
    },
    { accessorKey: "status", header: "Status", cell: ({row}) => <Badge variant={row.original.status === 'active' ? 'default' : 'secondary'}>{row.original.status}</Badge>},
    { accessorKey: "rtp", header: "RTP", cell: ({row}) => row.original.rtp ? `${row.original.rtp}%` : 'N/A'},
    {
      id: "actions", 
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => handleEdit(row.original)}><Edit className="h-4 w-4" /></Button>
          <Button variant="destructive" size="sm" onClick={() => handleDelete(row.original)}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: games,
    columns,
    pageCount: pageCount,
    state: { pagination, sorting },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    manualSorting: true,
  });

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
  
  // GameForm is read-only, so we assume its props are { initialData, onSubmit, onCancel, categories, providers, isLoading }
  // The type cast to `any` for GameForm is a workaround for potential prop type mismatches with the read-only component.
  const AnyGameForm = GameForm as any;

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

      <DataTable columns={columns} data={games} isLoading={isLoadingGames || isLoadingCategories || isLoadingProviders} />

      {isFormOpen && (
        <AnyGameForm 
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
