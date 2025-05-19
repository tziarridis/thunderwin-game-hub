import React from 'react';
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { GameForm } from '@/components/admin/GameForm';
import { gamesDatabaseService } from '@/services/gamesDatabaseService';
import { DbGame } from '@/types'; // Using DbGame as it's more likely for CMS


interface GameFilters {
  category?: string;
  provider?: string;
  status?: string;
}

const GamesManagement = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filters, setFilters] = React.useState<GameFilters>({});
  const [openCreateDialog, setOpenCreateDialog] = React.useState(false);
  const [openEditDialog, setOpenEditDialog] = React.useState(false);
  const [selectedGame, setSelectedGame] = React.useState<DbGame | null>(null);
  const queryClient = useQueryClient();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (filterName: keyof GameFilters, value: string) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterName]: value,
    }));
  };

  const handleCreateGame = () => {
    setSelectedGame(null);
    setOpenCreateDialog(true);
  };

  const handleEditGame = (game: DbGame) => {
    setSelectedGame(game);
    setOpenEditDialog(true);
  };

  const handleDeleteGame = async (gameId: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this game?");
    if (!confirmDelete) return;

    try {
      await gamesDatabaseService.deleteGame(gameId);
      toast.success("Game deleted successfully!");
      queryClient.invalidateQueries(['adminGames', searchTerm, filters]); // Refresh data
    } catch (error: any) {
      toast.error(`Error deleting game: ${error.message || 'Unknown error'}`);
    }
  };

  const handleFormSubmit = async (data: DbGame) => {
    try {
      if (selectedGame) {
        // Update existing game
        await gamesDatabaseService.updateGame(selectedGame.id, data);
        toast.success("Game updated successfully!");
      } else {
        // Create new game
        await gamesDatabaseService.createGame(data);
        toast.success("Game created successfully!");
      }
      setOpenCreateDialog(false);
      setOpenEditDialog(false);
      setSelectedGame(null);
      queryClient.invalidateQueries(['adminGames', searchTerm, filters]); // Refresh data
    } catch (error: any) {
      toast.error(`Error saving game: ${error.message || 'Unknown error'}`);
    }
  };

  const handleFormCancel = () => {
    setOpenCreateDialog(false);
    setOpenEditDialog(false);
    setSelectedGame(null);
  };

  const { data: gamesData, isLoading, error, refetch } = useQuery<DbGame[], Error>({ // Ensure DbGame[]
    queryKey: ['adminGames', searchTerm, filters],
    queryFn: () => gamesDatabaseService.getAllGames({ search: searchTerm, ...filters }), // Assuming this returns DbGame[]
  });

  const columns: ColumnDef<DbGame>[] = React.useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
            className="ml-2"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="ml-2"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            {row.original.image_url && <img src={row.original.image_url} alt={row.original.title} className="h-10 w-10 rounded object-cover" />}
            <span className="font-medium">{row.original.title}</span>
          </div>
        ),
      },
      {
        accessorKey: "provider_name", // From DbGame, assuming joined or denormalized
        header: "Provider",
        cell: ({ row }) => row.original.provider_name || row.original.provider_slug || 'N/A',
      },
      {
        accessorKey: "category_names", // From DbGame, assuming joined or denormalized
        header: "Categories",
        cell: ({ row }) => {
          const categories = row.original.category_slugs || row.original.category_names;
          if (Array.isArray(categories)) return categories.join(', ');
          if (typeof categories === 'string') return categories; // if category_slugs is a string
          return 'N/A';
        },
      },
      {
        accessorKey: "rtp",
        header: "RTP",
        cell: ({ row }) => row.original.rtp ? `${row.original.rtp}%` : 'N/A',
      },
      {
        accessorKey: "status",
        header: "Status",
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button variant="secondary" size="icon" onClick={() => handleEditGame(row.original)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="destructive" size="icon" onClick={() => handleDeleteGame(row.original.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [handleEditGame, handleDeleteGame]
  );

  return (
     <div className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Games Management</h1>
          <Button onClick={handleCreateGame}>
            <Plus className="mr-2 h-4 w-4" />
            Add Game
          </Button>
        </div>

        <div className="flex items-center justify-between mb-4">
          <Input
            type="text"
            placeholder="Search games..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="max-w-sm"
          />
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Filter by category..."
              value={filters.category || ''}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="max-w-xs"
            />
            <Input
              type="text"
              placeholder="Filter by provider..."
              value={filters.provider || ''}
              onChange={(e) => handleFilterChange('provider', e.target.value)}
              className="max-w-xs"
            />
          </div>
        </div>
        <DataTable columns={columns} data={gamesData || []} isLoading={isLoading} />

        <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>Create New Game</DialogTitle>
              <DialogDescription>
                Add a new game to the database.
              </DialogDescription>
            </DialogHeader>
            <GameForm onSubmit={handleFormSubmit} onCancel={handleFormCancel} />
          </DialogContent>
        </Dialog>

        <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>Edit Game</DialogTitle>
              <DialogDescription>
                Update game details.
              </DialogDescription>
            </DialogHeader>
            <GameForm game={selectedGame} onSubmit={handleFormSubmit} onCancel={handleFormCancel} />
          </DialogContent>
        </Dialog>
     </div>
  );
};
export default GamesManagement;

import { Checkbox } from "@/components/ui/checkbox"
