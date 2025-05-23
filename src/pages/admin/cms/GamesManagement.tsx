import React, { useState, useEffect, useCallback } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useForm } from 'react-hook-form';
import { Game, DbGame, GameProvider, GameCategory } from '@/types';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import GameForm from '@/components/admin/GameForm';

const GamesManagement = () => {
  const [games, setGames] = useState<DbGame[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingGame, setEditingGame] = useState<DbGame | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock data for providers and categories
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

  const providers = mockProviders;
  const categories = mockCategories;

  // Mock function to simulate fetching games
  const fetchGames = useCallback(() => {
    // Replace this with your actual data fetching logic
    const mockGames: DbGame[] = [
      {
        id: '1',
        game_name: 'Mock Game 1',
        game_code: 'mock1',
        provider_id: '1',
        status: 'active',
        rtp: 96,
        is_featured: false,
        is_popular: true,
        show_home: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        game_name: 'Mock Game 2',
        game_code: 'mock2',
        provider_id: '2',
        status: 'inactive',
        rtp: 95,
        is_featured: true,
        is_popular: false,
        show_home: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
    ];
    setGames(mockGames);
  }, []);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const handleEdit = (game: DbGame) => {
    setEditingGame(game);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    // Implement your delete logic here
    toast.success(`Game with ID ${id} deleted successfully!`);
  };

  // Fix the onSubmit prop to use onSave instead
  const handleFormSubmit = async (values: Partial<DbGame>) => {
    try {
      setIsSubmitting(true);
      // Simulate saving the game
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (editingGame) {
        // Update existing game
        setGames(games.map(game => game.id === editingGame.id ? { ...game, ...values } : game));
        toast.success(`Game "${values.game_name}" updated successfully!`);
      } else {
        // Add new game
        const newGame = { ...values, id: Date.now().toString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as DbGame;
        setGames([...games, newGame]);
        toast.success(`Game "${values.game_name}" created successfully!`);
      }

      setShowForm(false);
      setEditingGame(null);
    } catch (error) {
      toast.error(`Failed to save game: ${error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredGames = games.filter(game =>
    game.game_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    game.game_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Games Management</h1>
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Search games..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Game
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Game</DialogTitle>
                <DialogDescription>
                  Create a new game in the system.
                </DialogDescription>
              </DialogHeader>
              <GameForm
                initialData={editingGame}
                onCancel={() => setShowForm(false)}
                onSave={handleFormSubmit}
                providers={providers}
                categories={categories}
                isLoading={isSubmitting}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Table>
        <TableCaption>A list of your games.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Game Code</TableHead>
            <TableHead>Game Name</TableHead>
            <TableHead>Provider</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredGames.map((game) => (
            <TableRow key={game.id}>
              <TableCell className="font-medium">{game.game_code}</TableCell>
              <TableCell>{game.game_name}</TableCell>
              <TableCell>{providers.find(p => p.id === game.provider_id)?.name || 'Unknown'}</TableCell>
              <TableCell>{game.status}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" onClick={() => handleEdit(game)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(game.id)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Form Dialog */}
      {/*<Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingGame ? 'Edit Game' : 'Add Game'}</DialogTitle>
            <DialogDescription>
              {editingGame ? 'Edit an existing game.' : 'Create a new game.'}
            </DialogDescription>
          </DialogHeader>
          <GameForm
            initialData={editingGame}
            onCancel={() => setShowForm(false)}
            onSubmit={handleFormSubmit}
            providers={providers}
            categories={categories}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>*/}
    </div>
  );
};

export default GamesManagement;
