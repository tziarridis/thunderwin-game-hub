import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gameService } from '@/services/gameService'; // Using the updated gameService
import { Game, DbGame } from '@/types'; // Using updated types
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search, Edit2, Trash2, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import GameForm from '@/components/admin/GameForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import ConfirmationDialog from '@/components/admin/shared/ConfirmationDialog'; // Assuming this exists

const GamesManagement = () => {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<DbGame | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
  const [gameToDelete, setGameToDelete] = useState<string | null>(null);


  const { data, isLoading, error } = useQuery<{ games: Game[], count: number | null }, Error>({
    queryKey: ['adminGames', { searchTerm }], // Add filters to queryKey if they affect fetching
    queryFn: () => gameService.getAllGames({ search: searchTerm, limit: 1000 }), // Fetch all for admin for now
  });

  const games = data?.games || [];

  const createMutation = useMutation({
    mutationFn: (newGameData: Partial<DbGame>) => gameService.createGame(newGameData as Game), // service expects Game-like
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminGames'] });
      toast.success('Game created successfully!');
      setIsFormOpen(false);
    },
    onError: (err: any) => {
      toast.error(`Failed to create game: ${err.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, gameData }: { id: string; gameData: Partial<DbGame> }) => gameService.updateGame(id, gameData as Game),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminGames'] });
      toast.success('Game updated successfully!');
      setIsFormOpen(false);
      setSelectedGame(null);
    },
    onError: (err: any) => {
      toast.error(`Failed to update game: ${err.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => gameService.deleteGame(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminGames'] });
      toast.success('Game deleted successfully!');
    },
    onError: (err: any) => {
      toast.error(`Failed to delete game: ${err.message}`);
    },
  });

  const handleCreateNew = () => {
    setSelectedGame(null);
    setIsFormOpen(true);
  };

  const handleEdit = (game: Game) => {
    // gameService.getGameById expects string ID for DbGame.
    // The 'game' object here is already a frontend 'Game' type.
    // We need to map it to DbGame or ensure GameForm can take Game and map internally.
    // For simplicity, GameForm now takes DbGame.
    // We need to fetch the full DbGame object or ensure 'game' has all DbGame fields.
    // Let's assume gameService.getGameById is best.
    gameService.getGameById(game.id).then(fullGameData => {
        if (fullGameData) {
            // The GameForm expects a DbGame. mapDbGameToGameAdapter is used inside GameForm.
            // So, we can construct a DbGame-like object or fetch it.
            // For now, let's assume `fullGameData` from `getGameById` is `Game` which is then mapped to `DbGame` in the form or adapter.
            // This part is tricky: GameForm expects `DbGame`. `game` from the table is `Game`.
            // Let's pass the `Game` object and let `GameForm` use `mapGameToDbGameAdapter` if it's for creating the initial DbGame-like form state,
            // or pass `DbGame` directly if `selectedGame` is already `DbGame`.
            // The current GameForm takes DbGame.
            // The 'game' object from the table IS of type Game. GameService.getGameById also returns Game.
            // We need to convert `Game` to `DbGame` to pass to the form.
            // This is slightly circular. The GameForm expects `DbGame` so it can use `mapDbGameToGameAdapter`.
            // The simplest approach: if GameForm receives `Game`, it should map it.
            // Or `selectedGame` state should be `Game`, and `GameForm` receives `Game`.
            // Let's adjust GameForm to accept `Game` for editing.
            // For now, assuming `game` (type Game) is what we want to edit.
            // The selectedGame state variable will be `DbGame | null`. We need to fetch the `DbGame` version.
            const dbGameRepresentation: DbGame = {
              id: game.id,
              game_name: game.title,
              slug: game.slug,
              provider_slug: game.provider_slug,
              game_type: game.categoryName,
              category_slugs: game.category_slugs,
              cover: game.image,
              banner: game.banner,
              description: game.description,
              rtp: game.rtp,
              is_popular: game.isPopular,
              is_new: game.isNew,
              is_featured: game.is_featured,
              show_home: game.show_home,
              volatility: game.volatility,
              lines: game.lines,
              min_bet: game.minBet,
              max_bet: game.maxBet,
              features: game.features,
              tags: game.tags,
              themes: game.themes,
              release_date: game.releaseDate,
              game_id: game.game_id,
              game_code: game.game_code,
              status: game.status,
              // title: game.title // if DbGame also has title for forms
            };
            setSelectedGame(dbGameRepresentation);
            setIsFormOpen(true);
        } else {
            toast.error("Could not load game details for editing.");
        }
    });
  };

  const handleDelete = (id: string) => {
    setGameToDelete(id);
    setIsConfirmDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (gameToDelete) {
      deleteMutation.mutate(gameToDelete);
    }
    setIsConfirmDeleteDialogOpen(false);
    setGameToDelete(null);
  };

  const handleSubmitForm = (data: Partial<DbGame>) => {
    if (selectedGame && selectedGame.id) {
      updateMutation.mutate({ id: selectedGame.id, gameData: data });
    } else {
      createMutation.mutate(data);
    }
  };

  const columns = useMemo<ColumnDef<Game>[]>(() => [
    { accessorKey: 'title', header: 'Title', cell: info => info.getValue() },
    { accessorKey: 'providerName', header: 'Provider', cell: info => info.getValue() || 'N/A' },
    { accessorKey: 'categoryName', header: 'Category', cell: info => info.getValue() || 'N/A' },
    { accessorKey: 'status', header: 'Status', cell: info => <span className={`px-2 py-1 text-xs rounded-full ${info.getValue() === 'active' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>{String(info.getValue())}</span> },
    { accessorKey: 'rtp', header: 'RTP', cell: info => `${info.getValue() || 0}%` },
    { 
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => handleEdit(row.original)}><Edit2 className="h-4 w-4" /></Button>
            <Button variant="destructive" size="sm" onClick={() => handleDelete(row.original.id)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        )
    }
  ], []);

  const table = useReactTable({
    data: games,
    columns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualFiltering: false, // Set to true if API handles filtering
    manualSorting: false, // Set to true if API handles sorting
  });

  if (isLoading) return <div className="p-4">Loading games...</div>;
  if (error) return <div className="p-4 text-red-500">Error loading games: {error.message}</div>;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">Games Management</h1>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreateNew}><PlusCircle className="mr-2 h-4 w-4" /> Add New Game</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedGame ? 'Edit Game' : 'Add New Game'}</DialogTitle>
            </DialogHeader>
            <GameForm 
              game={selectedGame} 
              onSubmit={handleSubmitForm} 
              onCancel={() => { setIsFormOpen(false); setSelectedGame(null);}} 
              isLoading={createMutation.isPending || updateMutation.isPending}
              // Pass actual providers and categories if fetched
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 bg-card p-4 rounded-lg shadow">
        <div className="relative w-full md:flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search games (title, provider, category)..."
            value={(table.getColumn('title')?.getFilterValue() as string) ?? ''} // Example for specific column
            // Or a global filter: value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            onChange={(event) => {
                table.getColumn('title')?.setFilterValue(event.target.value); // Example: filter 'title' column
                // Or implement global filter: table.setGlobalFilter(event.target.value);
            }}
            className="pl-10 w-full"
          />
        </div>
        {/* Add more specific filters here if needed, e.g., for provider or category */}
      </div>
      
      <div className="overflow-x-auto bg-card shadow rounded-lg">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id} onClick={header.column.getToggleSortingHandler()}>
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
          <span className="text-sm">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
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
    </div>
  );
};

export default GamesManagement;
