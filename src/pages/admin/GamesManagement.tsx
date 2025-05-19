import React, { useState, useEffect, useMemo } from 'react';
import { ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable, ColumnFiltersState, getFilteredRowModel } from '@tanstack/react-table';
import { Game } from '@/types'; // DbGame removed as Game type should be sufficient, adapt if needed
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import GameForm from '@/components/admin/GameForm';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'; // DialogFooter, DialogClose removed as not used
import { gameService } from '@/services/gameService';
// adaptDbGameToGame, adaptGameToDbGame removed as GameForm should handle Game type
import { PlusCircle, Edit, Trash2, RefreshCw, Search } from 'lucide-react';
import { ResponsiveContainer } from '@/components/ui/responsive-container'; // Corrected import
import CMSPageHeader from '@/components/admin/cms/CMSPageHeader';

const GamesManagement = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const fetchGames = async () => {
    setIsLoading(true);
    try {
      const fetchedGames = await gameService.getAllGames(); // Corrected: use getAllGames
      setGames(fetchedGames); 
    } catch (error) {
      console.error('Failed to fetch games:', error);
      toast.error('Failed to load games.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const handleFormSubmit = async (data: Partial<Game>, id?: string | number) => {
    try {
      const gameId = id || editingGame?.id;
      if (gameId) {
        // Ensure data is at least Partial<Game>. GameForm should provide this.
        await gameService.updateGame(String(gameId), data as Game); 
        toast.success('Game updated successfully!');
      } else {
        await gameService.createGame(data as Game); 
        toast.success('Game created successfully!');
      }
      setIsFormOpen(false);
      setEditingGame(null);
      fetchGames(); 
    } catch (error: any) {
      console.error('Failed to save game:', error);
      toast.error(`Error: ${error.message || 'Failed to save game.'}`);
    }
  };

  const handleEdit = (game: Game) => {
    setEditingGame(game);
    setIsFormOpen(true);
  };

  const handleDelete = async (gameId: string | number) => {
    if (window.confirm('Are you sure you want to delete this game?')) {
      try {
        await gameService.deleteGame(String(gameId));
        toast.success('Game deleted successfully!');
        fetchGames(); 
      } catch (error: any) {
        console.error('Failed to delete game:', error);
        toast.error(`Error: ${error.message || 'Failed to delete game.'}`);
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
      accessorKey: "providerName", // Or provider_slug, provider
      header: "Provider",
      cell: ({ row }) => row.original.providerName || row.original.provider_slug || row.original.provider || 'N/A',
    },
    {
      accessorKey: "categoryName", // Or category_slugs, category
      header: "Category",
      cell: ({ row }) => row.original.categoryName || (Array.isArray(row.original.category_slugs) ? row.original.category_slugs.join(', ') : row.original.category_slugs) || row.original.category || 'N/A',
    },
    {
      accessorKey: "rtp",
      header: "RTP (%)",
      cell: ({ row }) => (row.original.rtp ? (typeof row.original.rtp === 'number' ? `${row.original.rtp.toFixed(2)}%` : `${row.original.rtp}%`) : 'N/A'),
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
          <Button variant="outline" size="sm" onClick={() => handleEdit(row.original)}>
            <Edit className="h-4 w-4 mr-1" /> Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => handleDelete(row.original.id)}>
            <Trash2 className="h-4 w-4 mr-1" /> Delete
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
    initialState: { pagination: { pageSize: 10 } }, // Default page size
  });

  return (
    <ResponsiveContainer>
      <CMSPageHeader title="Games Management" description="Manage all casino games available on the platform.">
        <div className="flex gap-2">
            <Button onClick={fetchGames} variant="outline" disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''} mr-2`} />
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
                        game={editingGame} // Pass the Game object or null
                        onSubmit={handleFormSubmit}
                        onCancel={() => { setIsFormOpen(false); setEditingGame(null); }}
                        isEditing={!!editingGame}
                    />
                </DialogContent>
            </Dialog>
        </div>
      </CMSPageHeader>

      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full max-w-sm">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
            placeholder="Search all columns..."
            value={globalFilter ?? ''}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="w-full"
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
    </ResponsiveContainer>
  );
};

export default GamesManagement;
