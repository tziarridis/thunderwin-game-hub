import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { MoreVertical, Edit, Trash } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Game, DbGame, GameProvider, GameCategory } from '@/types';
import GameForm from '@/components/admin/GameForm';

const mockProviders: GameProvider[] = [
  { id: "1", name: "Pragmatic Play", slug: "pragmatic" },
  { id: "2", name: "Evolution Gaming", slug: "evolution" },
  { id: "3", name: "NetEnt", slug: "netent" }
];

const mockCategories: GameCategory[] = [
  { id: "1", name: "Slots", slug: "slots" },
  { id: "2", name: "Table Games", slug: "table-games" },
  { id: "3", name: "Live Casino", slug: "live-casino" }
];

const GamesManagement = () => {
  const [games, setGames] = useState<DbGame[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingGame, setEditingGame] = useState<DbGame | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Mock data for demonstration
    const mockGames: DbGame[] = [
      {
        id: '1',
        game_name: 'Mega Fortune',
        game_code: 'mega-fortune',
        provider_id: '1',
        status: 'active',
        rtp: 96,
        is_featured: true,
        is_popular: true,
        show_home: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        game_name: 'Gonzo\'s Quest',
        game_code: 'gonzos-quest',
        provider_id: '2',
        status: 'inactive',
        rtp: 95,
        is_featured: false,
        is_popular: true,
        show_home: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
    ];
    setGames(mockGames);
  }, []);

  const handleEdit = (game: DbGame) => {
    setEditingGame(game);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    // Mock delete action
    setGames(games.filter(game => game.id !== id));
    toast({
      title: "Game deleted successfully.",
    })
  };

  const handleFormSubmit = async (values: Partial<DbGame>) => {
    try {
      setIsSubmitting(true);

      if (editingGame) {
        // Update existing game
        const updatedGames = games.map(game =>
          game.id === editingGame.id ? { ...game, ...values } : game
        );
        setGames(updatedGames);
        toast({
          title: "Game updated successfully.",
        })
      } else {
        // Create new game (mock ID generation)
        const newGame = { ...values, id: Math.random().toString(36).substring(7), created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as DbGame;
        setGames([...games, newGame]);
        toast({
          title: "Game created successfully.",
        })
      }

      setShowForm(false);
      setEditingGame(null);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error saving game.",
        description: "Please try again.",
      })
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Games Management</h1>
        <Button onClick={() => { setShowForm(true); setEditingGame(null); }}>Add Game</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Provider</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {games.map((game) => (
            <TableRow key={game.id}>
              <TableCell>{game.game_name}</TableCell>
              <TableCell>{game.game_code}</TableCell>
              <TableCell>{mockProviders.find(p => p.id === game.provider_id)?.name || 'Unknown'}</TableCell>
              <TableCell>{game.status}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(game)}>
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(game.id)}>
                      <Trash className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingGame ? 'Edit Game' : 'Create Game'}</DialogTitle>
            <DialogDescription>
              {editingGame ? 'Edit the game details.' : 'Create a new game.'}
            </DialogDescription>
          </DialogHeader>
          <GameForm
            initialData={editingGame}
            onCancel={() => setShowForm(false)}
            onSave={handleFormSubmit}
            providers={mockProviders}
            categories={mockCategories}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GamesManagement;
