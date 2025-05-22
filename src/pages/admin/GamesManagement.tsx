import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  ColumnDef,
  SortingState,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  CellContext
} from "@tanstack/react-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PlusCircle, Edit3, Trash2, Loader2, RefreshCw } from 'lucide-react';
import { Game, GameCategory, GameProvider, GameStatus } from '@/types';
import { gameService } from '@/services/gameService';
import AdminPageLayout from "@/components/layout/AdminPageLayout";
import { toast } from 'sonner';
import { useToast } from "@/components/ui/use-toast";
import { useReactTable } from "@tanstack/react-table";
import ConfirmationDialog from "@/components/admin/shared/ConfirmationDialog";

const GamesManagementPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [gameToDelete, setGameToDelete] = useState<Game | null>(null);
  const [filters, setFilters] = useState({ searchTerm: '', provider: '', category: '', status: '' });
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);

  const { data, isLoading, error, refetch } = useQuery<{games: Game[], totalCount: number}, Error>({
    queryKey: ['adminGames', filters, pagination, sorting],
    queryFn: async () => {
      const result = await gameService.getAllGamesAdmin({
        searchTerm: filters.searchTerm,
        provider: filters.provider,
        category: filters.category,
        status: filters.status,
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        sortBy: sorting.length ? sorting[0].id : undefined,
        sortOrder: sorting.length ? (sorting[0].desc ? 'desc' : 'asc') : undefined,
      });
      return { games: result.data, totalCount: result.count };
    },
  });

  const games = data?.games || [];
  const totalCount = data?.totalCount || 0;

  const gameMutation = useMutation({
    mutationFn: async (gameData: Partial<Game> & { id?: string }) => {
      if (gameData.id) {
        await gameService.updateGame(gameData.id, gameData);
      } else {
        await gameService.createGame(gameData as Game); // Ensure type matches
      }
      return Promise.resolve(); // Placeholder
    },
    onSuccess: () => {
      toast.success(`Game ${selectedGame ? 'updated' : 'created'} successfully.`);
      setIsFormOpen(false);
      setSelectedGame(null);
      refetch();
    },
    onError: (e: Error) => toast.error(`Error: ${e.message}`),
  });
  
  const deleteMutation = useMutation({
    mutationFn: async (gameId: string) => {
      await gameService.deleteGame(gameId);
      return Promise.resolve(); // Placeholder
    },
     onSuccess: () => {
      toast.success(`Game "${gameToDelete?.title}" deleted.`);
      setIsConfirmOpen(false);
      setGameToDelete(null);
      refetch();
    },
    onError: (e: Error) => toast.error(`Error deleting game: ${e.message}`),
  });


  const columns: ColumnDef<Game>[] = [
    { accessorKey: "id", header: "ID", cell: ({row}) => <div className="truncate w-20">{row.original.id}</div> },
    { accessorKey: "title", header: "Title" },
    { accessorKey: "provider_id", header: "Provider" /* map to provider name */ },
    { accessorKey: "category_id", header: "Category" /* map to category name */ },
    { accessorKey: "status", header: "Status", cell: ({row}) => <Badge variant={row.original.status === 'active' ? 'default' : 'secondary'}>{row.original.status}</Badge>},
    {
      id: "actions",
      cell: ({ row }) => {
        const game = row.original;
        return (
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => { setSelectedGame(game); setIsFormOpen(true); }}>
              <Edit3 className="mr-1 h-4 w-4" /> Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={() => { setGameToDelete(game); setIsConfirmOpen(true); }}>
              <Trash2 className="mr-1 h-4 w-4" /> Delete
            </Button>
          </div>
        );
      },
    },
  ];
  const pageCount = Math.ceil(totalCount / pagination.pageSize);

  const table = useReactTable({
    data: games,
    columns,
    pageCount,
    state: { pagination, sorting },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    manualSorting: true,
  });


  const handleFormSubmit = (values: Partial<Game>) => {
    const gameData = selectedGame ? { ...values, id: selectedGame.id } : values;
    gameMutation.mutate(gameData, {
      onSuccess: () => {
        toast.success(`Game ${selectedGame ? 'updated' : 'created'} successfully.`);
        setIsFormOpen(false);
        setSelectedGame(null);
        refetch();
      },
      onError: (e: Error) => toast.error(`Error: ${e.message}`),
    });
  };

  const handleDeleteConfirm = () => {
    if (gameToDelete) {
      deleteMutation.mutate(String(gameToDelete.id), {
         onSuccess: () => {
          toast.success(`Game "${gameToDelete.title}" deleted.`);
          setIsConfirmOpen(false);
          setGameToDelete(null);
          refetch();
        },
        onError: (e: Error) => toast.error(`Error deleting game: ${e.message}`),
      });
    }
  };


  if (error) return <AdminPageLayout title="Game Management"><div className="text-red-500 p-4">Error loading games: {error.message}</div></AdminPageLayout>;

  return (
    <AdminPageLayout title="Game Management" headerActions={
      <div className="flex gap-2">
        <Button onClick={() => { setSelectedGame(null); setIsFormOpen(true); }}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Game
        </Button>
         <Button onClick={() => refetch()} variant="outline" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Refresh
        </Button>
      </div>
    }>
    <div className="p-4 bg-card rounded-lg shadow mb-4 flex gap-2 items-center">
        <Input placeholder="Search games..." value={filters.searchTerm} onChange={e => setFilters(prev => ({...prev, searchTerm: e.target.value}))} className="max-w-sm" />
        <Button onClick={() => refetch()}>Filter</Button>
    </div>

    {isLoading && games.length === 0 ? (
        <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
    ) : (
        <DataTable table={table} columns={columns} isLoading={isLoading} />
    )}
    
    <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Previous</Button>
        <span>Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}</span>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</Button>
    </div>

    <GameForm
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setSelectedGame(null); }}
        onSubmit={handleFormSubmit}
        initialData={selectedGame}
    />

    <ConfirmationDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title={`Delete Game: ${gameToDelete?.title || ''}`}
        description="Are you sure you want to delete this game? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        confirmText="Delete"
        isDestructive
        isLoading={deleteMutation.isPending}
    />

    </AdminPageLayout>
  );
};

const GameFormSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  description: z.string().optional(),
  status: z.enum(["active", "inactive"]),
  provider_id: z.string(),
  category_id: z.string(),
  image_url: z.string().url().optional(),
  rtp: z.number().min(0).max(100).optional(),
  volatility: z.string().optional(),
  launch_url_patterns: z.record(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  is_mobile_compatible: z.boolean().optional(),
});

interface GameFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: z.infer<typeof GameFormSchema>) => void;
  initialData?: Partial<Game>;
}

const GameForm: React.FC<GameFormProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof GameFormSchema>>({
    resolver: zodResolver(GameFormSchema),
    defaultValues: initialData || {
      title: "",
      description: "",
      status: "inactive",
      provider_id: "",
      category_id: "",
    },
    mode: "onChange",
  });

  const handleSubmit = (values: z.infer<typeof GameFormSchema>) => {
    onSubmit(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Game" : "Create Game"}</DialogTitle>
          <DialogDescription>
            {initialData ? "Edit game details." : "Enter details for the new game."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Game Title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Game Description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="provider_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Provider ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Provider ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Category ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="Image URL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Submit</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default GamesManagementPage;
