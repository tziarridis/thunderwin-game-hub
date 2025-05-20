
import React, { useState, useEffect, useMemo } from 'react';
import { ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable, ColumnFiltersState, getFilteredRowModel } from '@tanstack/react-table';
import { Game } from '@/types'; // Game type should be sufficient
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import GameForm, { GameFormProps, GameFormData } from '@/components/admin/GameForm'; // GameFormProps imported
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { gameService } from '@/services/gameService';
import { PlusCircle, Edit, Trash2, RefreshCw, Search } from 'lucide-react';
import { ResponsiveContainer } from '@/components/ui/responsive-container'; // Corrected import
import CMSPageHeader from '@/components/admin/cms/CMSPageHeader';
import ConfirmationDialog from '@/components/admin/shared/ConfirmationDialog';

// Helper to map GameFormData (from form) to Partial<Game> (for service)
const mapFormDataToGameServiceData = (formData: GameFormData): Partial<Game> => {
    return {
        title: formData.title,
        slug: formData.slug,
        provider_slug: formData.provider_slug, // Assuming gameService expects provider_slug
        // providerName: needs mapping if service expects name
        category_slugs: formData.category_slugs, // Assuming gameService expects category_slugs
        // categoryName: needs mapping if service expects name
        rtp: formData.rtp ?? undefined, // Ensure number or undefined
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
        releaseDate: formData.releaseDate ?? undefined,
    };
};


const GamesManagement = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
  const [gameToDeleteId, setGameToDeleteId] = useState<string | number | null>(null);


  const fetchGames = async () => {
    setIsLoading(true);
    try {
      // Pass pagination/filter params to getAllGames if supported by service
      const fetchedGamesResult = await gameService.getAllGames({ search: globalFilter, limit: 1000, offset: 0 }); // Example
      setGames(fetchedGamesResult.games || []); // Adjust if service returns { games: [], count: X }
    } catch (error) {
      console.error('Failed to fetch games:', error);
      toast.error('Failed to load games.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, [globalFilter]); // Re-fetch on globalFilter change, add other dependencies if needed (sorting, pagination)

  const handleFormSubmit = async (data: GameFormData, id?: string | number) => {
    // data is GameFormData, map it to Partial<Game> for the service
    const gameServiceData = mapFormDataToGameServiceData(data);
    
    try {
      setIsLoading(true); // For form submission
      const gameIdToUpdate = id || editingGame?.id;
      if (gameIdToUpdate) {
        await gameService.updateGame(String(gameIdToUpdate), gameServiceData as Game); 
        toast.success('Game updated successfully!');
      } else {
        await gameService.createGame(gameServiceData as Game); 
        toast.success('Game created successfully!');
      }
      setIsFormOpen(false);
      setEditingGame(null);
      fetchGames(); 
    } catch (error: any) {
      console.error('Failed to save game:', error);
      toast.error(`Error: ${error.message || 'Failed to save game.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (game: Game) => {
    setEditingGame(game);
    setIsFormOpen(true);
  };

  const openDeleteConfirmation = (gameId: string | number) => {
    setGameToDeleteId(gameId);
    setIsConfirmDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (gameToDeleteId) {
      try {
        setIsLoading(true); // For delete operation
        await gameService.deleteGame(String(gameToDeleteId));
        toast.success('Game deleted successfully!');
        fetchGames(); 
      } catch (error: any) {
        console.error('Failed to delete game:', error);
        toast.error(`Error: ${error.message || 'Failed to delete game.'}`);
      } finally {
        setIsLoading(false);
        setIsConfirmDeleteDialogOpen(false);
        setGameToDeleteId(null);
      }
    }
  };
  
  const columns = useMemo<ColumnDef<Game>[]>(() => [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => <span className="font-medium">{row.original.title}</span>,
    },
    {
      accessorKey: "providerName", 
      header: "Provider",
      cell: ({ row }) => row.original.providerName || row.original.provider_slug || 'N/A',
    },
    {
      accessorKey: "categoryName", 
      header: "Category",
      cell: ({ row }) => row.original.categoryName || (Array.isArray(row.original.category_slugs) ? row.original.category_slugs.join(', ') : row.original.category_slugs) || 'N/A',
    },
    {
      accessorKey: "rtp",
      header: "RTP (%)",
      cell: ({ row }) => (row.original.rtp ? `${Number(row.original.rtp).toFixed(2)}%` : 'N/A'),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <span className={`px-2 py-1 text-xs rounded-full ${row.original.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-700/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-700/30 dark:text-red-300'}`}>{row.original.status || 'N/A'}</span>,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" onClick={() => handleEdit(row.original)} title="Edit Game">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="destructive" size="icon" onClick={() => openDeleteConfirmation(row.original.id)} title="Delete Game">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ], []);


  const table = useReactTable({
    data: games,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } }, 
  });

  return (
    <ResponsiveContainer className="p-4 md:p-6">
      <CMSPageHeader 
        title="Games Management" 
        description="Manage all casino games available on the platform."
        actions={
            <div className="flex gap-2">
                <Button onClick={fetchGames} variant="outline" disabled={isLoading && table.options.state.globalFilter === globalFilter}>
                    <RefreshCw className={`h-4 w-4 ${isLoading && table.options.state.globalFilter === globalFilter ? 'animate-spin' : ''} mr-2`} />
                    Refresh Games
                </Button>
                <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
                    setIsFormOpen(isOpen);
                    if (!isOpen) setEditingGame(null);
                }}>
                    <DialogTrigger asChild>
                        <Button onClick={() => { setEditingGame(null); setIsFormOpen(true); }}>
                            <PlusCircle className="h-4 w-4 mr-2" /> Add New Game
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingGame ? 'Edit Game' : 'Add New Game'}</DialogTitle>
                            <DialogDescription>
                                {editingGame ? `Update details for ${editingGame.title}.` : 'Fill in the details for the new game.'}
                            </DialogDescription>
                        </DialogHeader>
                        <GameForm
                            game={editingGame}
                            onSubmit={handleFormSubmit}
                            onCancel={() => { setIsFormOpen(false); setEditingGame(null); }}
                            isEditing={!!editingGame}
                            isLoading={isLoading && (isFormOpen || !!editingGame)} // More specific loading for form
                        />
                    </DialogContent>
                </Dialog>
            </div>
        }
      />

      <div className="mb-4 mt-6 flex items-center justify-between gap-4">
        <div className="relative flex items-center gap-2 w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
            placeholder="Search all columns..."
            value={globalFilter ?? ''}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="w-full pl-10" // Padding for the icon
            />
        </div>
      </div>

      {isLoading && games.length === 0 && <p className="text-center py-4">Loading games...</p>}
      {!isLoading && games.length === 0 && !globalFilter && (
         <p className="text-center py-4 text-muted-foreground">No games found. Try adding some!</p>
      )}
      
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableHead key={header.id} 
                        className={header.column.getCanSort() ? 'cursor-pointer select-none' : ''}
                        onClick={header.column.getToggleSortingHandler()}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{
                        asc: ' ▲',
                        desc: ' ▼',
                      }[header.column.getIsSorted() as string] ?? null}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map(row => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    {globalFilter ? "No games match your search." : (isLoading ? "Loading..." : "No games found.")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      
      <div className="flex items-center justify-between space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
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
        onConfirm={handleDeleteConfirm}
        title="Confirm Deletion"
        description="Are you sure you want to delete this game? This action cannot be undone."
        confirmText="Delete"
        isLoading={isLoading && !!gameToDeleteId} // Loading state for delete confirmation
      />
    </ResponsiveContainer>
  );
};

export default GamesManagement;
