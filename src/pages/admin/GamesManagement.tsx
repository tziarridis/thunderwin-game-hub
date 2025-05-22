import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ColumnDef, SortingState, getCoreRowModel, getSortedRowModel, getPaginationRowModel, useReactTable } from "@tanstack/react-table"; // Keep only one import
import { gameService } from '@/services/gameService';
import { Game, GameCategory, GameProvider as ProviderType } from '@/types'; // Ensure GameProvider is aliased if needed
import AdminPageLayout from '@/components/layout/AdminPageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table'; // Correct import
import GameForm from '@/components/admin/GameForm';
import ConfirmationDialog from '@/components/admin/shared/ConfirmationDialog';
import { toast } from 'sonner';
import { PlusCircle, Search, Edit, Trash2, RefreshCw, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DbGame } from '@/types/database'; // Assuming DbGame is the type for DB operations

// Mock data fetching functions (replace with actual service calls)
const fetchCategories = async (): Promise<GameCategory[]> => {
  // Placeholder: Replace with actual service call
  // return gameCategoryService.getAllCategories();
  return [{ id: '1', name: 'Slots', slug: 'slots', description: '', game_count: 0, status: 'active', created_at: '', updated_at: '' }];
};

const fetchProviders = async (): Promise<ProviderType[]> => {
  // Placeholder: Replace with actual service call
  // return gameProviderService.getAllProviders();
  return [{ id: '1', name: 'Provider A', slug: 'provider-a', logo_url: '', status: 'active', game_count: 0, created_at: '', updated_at: '' }];
};


const GamesManagementPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | Partial<Game> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);

  const { data: gamesData, isLoading: isLoadingGames, refetch: refetchGames } = useQuery<{ games: Game[], totalCount: number }, Error>({
    queryKey: ['adminGames', searchTerm, pagination, sorting],
    queryFn: async () => {
      const filters = { 
        search: searchTerm, 
        limit: pagination.pageSize, 
        offset: pagination.pageIndex * pagination.pageSize,
        // Convert Tanstack sorting to API format if needed
        // sortBy: sorting.length > 0 ? sorting[0].id : undefined,
        // sortOrder: sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : undefined,
      };
      return gameService.getAllGames(filters); // Use getAllGames, ensure it handles admin needs or use a specific admin variant
    },
  });

  const games = gamesData?.games || [];
  const totalCount = gamesData?.totalCount || 0;
  const pageCount = Math.ceil(totalCount / pagination.pageSize);
  
  const { data: categories, isLoading: isLoadingCategories } = useQuery<GameCategory[], Error>({
    queryKey: ['gameCategories'],
    queryFn: fetchCategories,
  });

  const { data: providers, isLoading: isLoadingProviders } = useQuery<ProviderType[], Error>({
    queryKey: ['gameProviders'],
    queryFn: fetchProviders,
  });


  const createOrUpdateGameMutation = useMutation({
    mutationFn: async (gameData: Partial<DbGame>) => { // Use DbGame for mutation
      if ((gameData as Game).id && typeof (gameData as Game).id === 'string') { // Check if id is string for update
        return gameService.updateGame((gameData as Game).id as string, gameData as Partial<DbGame>);
      } else {
        // ID might be number from DB, or not present for create
        // gameService.createGame expects DbGame compatible type
        const createData = { ...gameData };
        delete createData.id; // Remove ID for creation if it was a number
        return gameService.createGame(createData as Omit<DbGame, 'id' | 'created_at' | 'updated_at'>);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminGames'] });
      toast.success(`Game ${selectedGame && (selectedGame as Game).id ? 'updated' : 'created'} successfully!`);
      setIsFormOpen(false);
      setSelectedGame(null);
    },
    onError: (error: Error) => {
      toast.error(`Failed to ${selectedGame && (selectedGame as Game).id ? 'update' : 'create'} game: ${error.message}`);
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
    setSelectedGame({}); // Empty object for new game
    setIsFormOpen(true);
  };

  const handleEdit = (game: Game) => {
    setSelectedGame(game);
    setIsFormOpen(true);
  };

  const handleDelete = (game: Game) => {
    setSelectedGame(game);
    setIsConfirmDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedGame && (selectedGame as Game).id) {
      deleteGameMutation.mutate(String((selectedGame as Game).id)); // Ensure ID is string
    }
  };

  const handleSubmitForm = (values: Partial<DbGame>) => { // Expect DbGame compatible partial
    // Transform Game form values to DbGame if necessary (e.g. provider_id, category_id if they are objects in form)
    const gameDataToSubmit: Partial<DbGame> = {
        ...values,
        // Ensure provider_id and category_id are strings if they are IDs
        provider_id: typeof values.provider_id === 'object' ? (values.provider_id as ProviderType)?.id : values.provider_id,
        category_id: typeof values.category_id === 'object' ? (values.category_id as GameCategory)?.id : values.category_id,
        rtp: values.rtp ? Number(values.rtp) : undefined,
        // Ensure `id` is correctly handled or omitted for creation
    };
    if (selectedGame && (selectedGame as Game).id) {
        gameDataToSubmit.id = String((selectedGame as Game).id); // Pass string ID for update
    }


    createOrUpdateGameMutation.mutate(gameDataToSubmit);
  };
  
  const columns: ColumnDef<Game>[] = [
    { accessorKey: "id", header: "ID", cell: ({ row }) => <span className="truncate w-20 block">{String(row.original.id)}</span> }, // Ensure string
    { accessorKey: "title", header: "Title" },
    { accessorKey: "provider_id", header: "Provider", cell: ({row}) => providers?.find(p => p.id === row.original.provider_id)?.name || row.original.provider_id },
    { accessorKey: "category_id", header: "Category", cell: ({row}) => categories?.find(c => c.id === row.original.category_id)?.name || row.original.category_id },
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

  const headerActions = (
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
    <AdminPageLayout title="Games Management" headerActions={headerActions}>
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
        {/* Add dropdown filters for category and provider if needed */}
      </div>

      <DataTable table={table} columns={columns} isLoading={isLoadingGames || isLoadingCategories || isLoadingProviders} />

      {isFormOpen && (
        <GameForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleSubmitForm}
          initialData={selectedGame as Partial<DbGame>} // Pass DbGame compatible partial
          categories={categories || []}
          providers={providers || []}
          isLoading={createOrUpdateGameMutation.isPending}
        />
      )}

      {selectedGame && (selectedGame as Game).id && (
        <ConfirmationDialog
          isOpen={isConfirmDeleteDialogOpen}
          onOpenChange={setIsConfirmDeleteDialogOpen}
          title="Delete Game"
          description={`Are you sure you want to delete "${(selectedGame as Game).title}"? This action cannot be undone.`}
          onConfirm={confirmDelete}
          confirmText="Delete"
          isDestructive={true}
          isLoading={deleteGameMutation.isPending}
        />
      )}
    </AdminPageLayout>
  );
};

export default GamesManagementPage;
