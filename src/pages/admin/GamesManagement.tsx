import React, { useState, useEffect, useMemo } from 'react';
import { ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable, ColumnFiltersState, getFilteredRowModel } from '@tanstack/react-table';
import { Game, DbGame } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import GameForm from '@/components/admin/GameForm';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { gameService } from '@/services/gameService'; // Main service for CRUD
import { adaptDbGameToGame, adaptGameToDbGame } from '@/components/admin/GameAdapter';
import { PlusCircle, Edit, Trash2, RefreshCw, Search } from 'lucide-react';
import ResponsiveContainer from '@/components/ui/responsive-container'; // Assuming this is a custom component
import CMSPageHeader from '@/components/admin/cms/CMSPageHeader'; // Reusable page header

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
      const dbGames = await gameService.getGames(); // This should return raw DbGame[]
      // Adapt DbGame to Game if your service returns DbGame and table expects Game
      // If gameService.getGames() already returns Game[], this map is not needed.
      // For this example, let's assume getGames directly returns Game[] for simplicity,
      // or it handles adaptation internally. If it returns DbGame[], adapt it:
      // const adaptedGames = dbGames.map(adaptDbGameToGame);
      setGames(dbGames); // Assuming gameService.getGames() returns Game[]
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
      // const dbGameData = adaptGameToDbGame(data as Game); // Adapt Game to DbGame/Partial<DbGame> for saving
      if (id) {
        await gameService.updateGame(String(id), data as Game); // gameService.updateGame should expect Game or Partial<Game>
        toast.success('Game updated successfully!');
      } else {
        await gameService.createGame(data as Game); // gameService.createGame should expect Game
        toast.success('Game created successfully!');
      }
      setIsFormOpen(false);
      setEditingGame(null);
      fetchGames(); // Refresh list
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
        fetchGames(); // Refresh list
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
      cell: ({ row }) => row.original.rtp || 'N/A',
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <span className={`px-2 py-1 text-xs rounded-full ${row.original.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{row.original.status || 'N/A'}</span>,
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
                        game={editingGame}
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
        {/* Add more specific column filters here if needed */}
      </div>

      {isLoading && <p>Loading games...</p>}
      {!isLoading && (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableHead key={header.id} onClick={header.column.getToggleSortingHandler()}>
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
                  <TableRow key={row.id}>
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
                    No games found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
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
