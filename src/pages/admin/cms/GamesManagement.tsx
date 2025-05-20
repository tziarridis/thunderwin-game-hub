
import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gameService } from '@/services/gameService'; 
import { Game, DbGame } from '@/types'; // Using updated types
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search, Edit2, Trash2, ChevronDown, ChevronUp, Filter, Loader2 } from 'lucide-react';
import GameForm, { GameFormProps, GameFormData } from '@/components/admin/GameForm'; // Ensure GameFormProps is exported
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  ColumnFiltersState,
} from '@tanstack/react-table';
import ConfirmationDialog from '@/components/admin/shared/ConfirmationDialog'; 
import CMSPageHeader from '@/components/admin/cms/CMSPageHeader';
import { ResponsiveContainer } from '@/components/ui/responsive-container';

// Helper to map GameFormData from form to Game for service
const mapFormDataToGame = (formData: GameFormData): Partial<Game> => {
  return {
    title: formData.title,
    slug: formData.slug,
    provider_slug: formData.provider_slug,
    category_slugs: formData.category_slugs,
    rtp: formData.rtp ?? undefined,
    description: formData.description ?? undefined,
    image: formData.image ?? undefined,
    banner: formData.banner ?? undefined,
    status: formData.status,
    isPopular: formData.isPopular,
    isNew: formData.isNew,
    is_featured: formData.is_featured,
    show_home: formData.show_home,
    game_id: formData.game_id ?? undefined,
    game_code: formData.game_code ?? undefined,
    minBet: formData.minBet ?? undefined,
    maxBet: formData.maxBet ?? undefined,
    volatility: formData.volatility ?? undefined,
    lines: formData.lines ?? undefined,
    features: formData.features,
    tags: formData.tags,
    themes: formData.themes,
    releaseDate: formData.releaseDate ?? undefined, // Ensure this is a string or compatible type
  };
};

const GamesCmsPage: React.FC = () => { // Renamed to avoid conflict if another GamesManagement exists
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null); // Use Game type from '@/types'
  const [globalFilter, setGlobalFilter] = useState(''); // For global search
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
  const [gameToDeleteId, setGameToDeleteId] = useState<string | null>(null);


  const { data: gamesData, isLoading: isLoadingGames, error: gamesError } = useQuery<{ games: Game[], count: number | null }, Error>({
    queryKey: ['adminCmsGames', { globalFilter, sorting, columnFilters }], // Query key includes filters
    queryFn: () => gameService.getAllGames({ 
        search: globalFilter, 
        limit: 1000, // Handle pagination properly if needed
        // Pass sorting and columnFilters if service supports them
    }), 
  });

  const games = gamesData?.games || [];

  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCmsGames'] });
      setIsFormOpen(false);
      setSelectedGame(null);
    },
    onError: (err: any) => {
      toast.error(`Operation failed: ${err.message}`);
    },
  };

  const createMutation = useMutation({
    mutationFn: (newGameData: Partial<Game>) => gameService.createGame(newGameData as Game),
    ...mutationOptions,
    onSuccess: (...args) => {
      toast.success('Game created successfully!');
      mutationOptions.onSuccess(...args);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, gameData }: { id: string; gameData: Partial<Game> }) => gameService.updateGame(id, gameData as Game),
    ...mutationOptions,
    onSuccess: (...args) => {
      toast.success('Game updated successfully!');
      mutationOptions.onSuccess(...args);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => gameService.deleteGame(id),
    ...mutationOptions,
    onSuccess: (...args) => {
      toast.success('Game deleted successfully!');
      setIsConfirmDeleteDialogOpen(false);
      setGameToDeleteId(null);
      mutationOptions.onSuccess(...args);
    }
  });

  const handleCreateNew = () => {
    setSelectedGame(null);
    setIsFormOpen(true);
  };

  const handleEdit = (game: Game) => {
    setSelectedGame(game); // GameForm expects Game type now based on its props
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setGameToDeleteId(id);
    setIsConfirmDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (gameToDeleteId) {
      deleteMutation.mutate(gameToDeleteId);
    }
  };

  const handleSubmitForm = async (formData: GameFormData, id?: string) => {
    const gameServiceData = mapFormDataToGame(formData);
    if (id) { // id is passed from GameForm for editing
      updateMutation.mutate({ id, gameData: gameServiceData });
    } else {
      createMutation.mutate(gameServiceData);
    }
  };

  const columns = useMemo<ColumnDef<Game>[]>(() => [
    { accessorKey: 'title', header: 'Title', cell: info => info.getValue() },
    { accessorKey: 'providerName', header: 'Provider', cell: info => info.getValue() || 'N/A' },
    { accessorKey: 'categoryName', header: 'Category', cell: info => info.getValue() || 'N/A' },
    { accessorKey: 'status', header: 'Status', cell: info => <span className={`px-2 py-1 text-xs rounded-full ${info.getValue() === 'active' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>{String(info.getValue())}</span> },
    { accessorKey: 'rtp', header: 'RTP', cell: info => `${Number(info.getValue() || 0).toFixed(2)}%` },
    { 
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" onClick={() => handleEdit(row.original)} title="Edit Game"><Edit2 className="h-4 w-4" /></Button>
            <Button variant="destructive" size="icon" onClick={() => handleDelete(row.original.id)} title="Delete Game"><Trash2 className="h-4 w-4" /></Button>
          </div>
        )
    }
  ], []);

  const table = useReactTable({
    data: games,
    columns,
    state: { sorting, columnFilters, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter, // Hook up global filter
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: false, // Set to true if API handles pagination
    manualFiltering: true, // API handles global search via `globalFilter`
    manualSorting: false, // Set to true if API handles sorting
    pageCount: gamesData?.count ? Math.ceil(gamesData.count / (table.getState().pagination.pageSize || 10)) : -1, // For manual pagination
  });
  
  const isMutationLoading = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  if (gamesError) return <div className="p-4 text-red-500">Error loading games: {gamesError.message}</div>;

  return (
    <ResponsiveContainer className="p-4 md:p-6 space-y-6">
      <CMSPageHeader 
        title="Games Content Management"
        description="Add, edit, and manage game details and assets."
        actions={
            <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
                setIsFormOpen(isOpen);
                if (!isOpen) setSelectedGame(null);
            }}>
            <DialogTrigger asChild>
                <Button onClick={handleCreateNew}><PlusCircle className="mr-2 h-4 w-4" /> Add New Game</Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                <DialogTitle>{selectedGame ? 'Edit Game' : 'Add New Game'}</DialogTitle>
                <DialogDescription>
                    {selectedGame ? `Editing details for ${selectedGame.title}` : 'Provide details for the new game.'}
                </DialogDescription>
                </DialogHeader>
                <GameForm 
                game={selectedGame} 
                onSubmit={handleSubmitForm} 
                onCancel={() => { setIsFormOpen(false); setSelectedGame(null);}} 
                isLoading={createMutation.isPending || updateMutation.isPending}
                isEditing={!!selectedGame}
                />
            </DialogContent>
            </Dialog>
        }
      />

      <div className="flex flex-col md:flex-row items-center gap-4 bg-card p-4 rounded-lg shadow">
        <div className="relative w-full md:flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search games (title, provider, category)..."
            value={globalFilter ?? ''}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="pl-10 w-full"
          />
        </div>
        {/* Add more specific filters here if needed, e.g., for provider or category, then connect them to onColumnFiltersChange */}
      </div>
      
      {isLoadingGames && games.length === 0 ? (
        <div className="text-center py-10"><Loader2 className="h-8 w-8 animate-spin mx-auto" /> <p>Loading games...</p></div>
      ) : (
        <div className="overflow-x-auto bg-card shadow rounded-lg">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableHead key={header.id} onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                        className={header.column.getCanSort() ? 'cursor-pointer select-none' : ''}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{ asc: <ChevronUp className="ml-2 h-4 w-4 inline" />, desc: <ChevronDown className="ml-2 h-4 w-4 inline" /> }[header.column.getIsSorted() as string] ?? null}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map(row => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">No games found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between gap-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() === -1 ? '...' : table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>

      <ConfirmationDialog
        isOpen={isConfirmDeleteDialogOpen}
        onClose={() => setIsConfirmDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        description="Are you sure you want to delete this game? This action cannot be undone."
        confirmText="Delete"
        isLoading={deleteMutation.isPending}
      />
    </ResponsiveContainer>
  );
};

export default GamesCmsPage;
