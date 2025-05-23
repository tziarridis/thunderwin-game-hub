
import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ColumnDef, SortingState, getCoreRowModel, getSortedRowModel, getPaginationRowModel, useReactTable } from "@tanstack/react-table";
import { gameService } from '@/services/gameService';
import { Game, GameCategory, GameProvider as ProviderType, DbGame } from '@/types'; // DbGame imported from @/types which re-exports from game.ts
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
const fetchCategories = async (): Promise<GameCategory[]> => {
  // Placeholder: Replace with actual service call
  // return gameCategoryService.getAllCategories();
  return [{ id: '1', name: 'Slots', slug: 'slots', description: '', game_count: 10, /*icon, image_url etc.*/ }];
};

const fetchProviders = async (): Promise<ProviderType[]> => {
  // Placeholder: Replace with actual service call
  // return gameProviderService.getAllProviders();
  return [{ id: '1', name: 'Provider A', slug: 'provider-a', logoUrl: '', /* status, games_count etc. */ }];
};


const GamesManagementPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | Partial<Game> | null>(null); // Game is from @/types
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
        sortBy: sorting.length > 0 ? sorting[0].id : undefined,
        sortOrder: sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : undefined,
      };
      // Assuming gameService.getAllGames returns { games: Game[], totalCount: number }
      const result = await gameService.getAllGames(filters); 
      return result; 
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
    mutationFn: async (gameData: Partial<DbGame>) => {
      // Ensure ID is string for Supabase if it's typically UUID string
      const idToUse = gameData.id ? String(gameData.id) : undefined;

      if (idToUse) {
        return gameService.updateGame(idToUse, gameData as Partial<DbGame>);
      } else {
        const createData = { ...gameData };
        delete createData.id; 
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
    setSelectedGame({}); 
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
      deleteGameMutation.mutate(String((selectedGame as Game).id));
    }
  };

  const handleSubmitForm = (values: Partial<DbGame>) => {
    const gameDataToSubmit: Partial<DbGame> = {
        ...values,
        provider_id: typeof values.provider_id === 'object' && values.provider_id !== null ? String((values.provider_id as ProviderType)?.id) : String(values.provider_id),
        // category_id: typeof values.category_id === 'object' && values.category_id !== null ? String((values.category_id as GameCategory)?.id) : String(values.category_id),
        rtp: values.rtp ? Number(values.rtp) : undefined,
    };
    if (selectedGame && (selectedGame as Game).id) {
        gameDataToSubmit.id = String((selectedGame as Game).id);
    }
    createOrUpdateGameMutation.mutate(gameDataToSubmit);
  };
  
  const columns: ColumnDef<Game>[] = [
    { accessorKey: "id", header: "ID", cell: ({ row }) => <span className="truncate w-20 block">{String(row.original.id)}</span> },
    { accessorKey: "title", header: "Title" },
    { 
      accessorKey: "providerName", // Assuming Game type has providerName or provider.name
      header: "Provider", 
      cell: ({row}) => row.original.providerName || row.original.provider?.name || String(row.original.provider_id) 
    },
    { 
      accessorKey: "categoryName", // Assuming Game type has categoryName or category.name
      header: "Category", 
      // cell: ({row}) => row.original.categoryName || row.original.category?.name || String(row.original.category_id) 
      // If categories are slugs
      cell: ({row}) => row.original.category_slugs?.join(', ') || 'N/A'
    },
    { accessorKey: "status", header: "Status", cell: ({row}) => <Badge variant={row.original.status === 'active' ? 'default' : 'secondary'}>{row.original.status}</Badge>},
    { accessorKey: "rtp", header: "RTP", cell: ({row}) => row.original.rtp ? `${row.original.rtp}%` : 'N/A'},
    {
      id: "actions", // This is a display column, no accessorKey needed
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

  const pageHeaderActions = ( // Changed variable name to avoid conflict if AdminPageLayout takes 'actions'
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
    <AdminPageLayout title="Games Management" actions={pageHeaderActions}> {/* Changed to 'actions' prop */}
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

      <DataTable table={table} columns={columns} isLoading={isLoadingGames || isLoadingCategories || isLoadingProviders} />

      {isFormOpen && (
        <GameForm
          // isOpen prop removed as it's controlled by Dialog wrapper if GameForm is not a Dialog itself
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleSubmitForm}
          initialData={selectedGame as Partial<DbGame>}
          categories={categories || []}
          providers={providers || []}
          isLoading={createOrUpdateGameMutation.isPending}
        />
      )}

      {selectedGame && (selectedGame as Game).id && (
        <ConfirmationDialog
          isOpen={isConfirmDeleteDialogOpen}
          onClose={() => setIsConfirmDeleteDialogOpen(false)} // Changed from onOpenChange
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
