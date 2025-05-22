import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Game, GameProvider, GameCategory, GameStatus, GameVolatility, DbGame } from '@/types/game'; // Ensure GameProvider and GameCategory are imported
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { PlusCircle, Edit, Trash2, Search, Filter, Upload, Settings2, Eye, EyeOff } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import Papa from 'papaparse'; // For CSV import
import GameForm from '@/components/admin/GameForm'; // Assuming GameForm is preferred

const GAMES_ADMIN_QUERY_KEY = 'admin_games_v2'; // Changed query key to avoid conflicts if old page exists
const PROVIDERS_ADMIN_QUERY_KEY = 'admin_game_providers_v2';
const CATEGORIES_ADMIN_QUERY_KEY = 'admin_game_categories_v2';

const GamesAdminPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false); // For GameForm Dialog
  const [editingGame, setEditingGame] = useState<DbGame | null>(null); // Use DbGame for form
  
  const [filterProvider, setFilterProvider] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<GameStatus | 'all'>('all');

  // Fetch games
  const { data: games = [], isLoading: isLoadingGames, refetch } = useQuery<DbGame[], Error>({
    queryKey: [GAMES_ADMIN_QUERY_KEY, searchTerm, filterProvider, filterCategory, filterStatus],
    queryFn: async () => {
      let query = supabase.from('games').select<string, DbGame>('*'); // Specify DbGame type
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,game_id.ilike.%${searchTerm}%,provider_slug.ilike.%${searchTerm}%`);
      }
      if (filterProvider !== 'all') {
        query = query.eq('provider_slug', filterProvider);
      }
      if (filterCategory !== 'all') {
        // Corrected syntax for array column query
        query = query.filter('category_slugs', 'cs', `{${filterCategory}}`);
      }
      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }
      
      const { data, error } = await query.order('title', { ascending: true });
      if (error) throw error;
      return data as DbGame[];
    },
  });

  const { data: providersForForm = [] } = useQuery<{ slug: string; name: string }[], Error>({
    queryKey: ['formProvidersAdminGames'], // Unique key
    queryFn: async () => {
        const { data, error } = await supabase.from('game_providers').select('slug, name').eq('is_active', true);
        if (error) throw error;
        return data || [];
    },
    staleTime: Infinity,
  });

  const { data: categoriesForForm = [] } = useQuery<{ slug: string; name: string }[], Error>({
    queryKey: ['formCategoriesAdminGames'], // Unique key
    queryFn: async () => {
        const { data, error } = await supabase.from('game_categories').select('slug, name');
        if (error) throw error;
        return data || [];
    },
    staleTime: Infinity,
  });
  
  const gameMutation = useMutation<DbGame, Error, Partial<DbGame>>({
    mutationFn: async (gameData) => {
      const { data, error } = await supabase
        .from('games')
        .upsert(gameData as any)
        .select()
        .single();
      if (error) throw error;
      return data as DbGame;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GAMES_ADMIN_QUERY_KEY] });
      setIsFormOpen(false);
      setEditingGame(null);
      toast.success(`Game ${editingGame?.id ? 'updated' : 'created'} successfully.`);
    },
    onError: (error) => {
      toast.error(`Error saving game: ${error.message}`);
    },
  });


  const handleEdit = (game: DbGame) => {
    setEditingGame(game);
    setIsFormOpen(true);
  };
  
  const handleAddNew = () => {
    setEditingGame(null); // GameForm will handle defaults for a new game
    setIsFormOpen(true);
  };

  const deleteGameMutation = useMutation({
    mutationFn: async (gameId: string) => { // Assuming game id is string (UUID)
      const { error } = await supabase.from('games').delete().eq('id', gameId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Game deleted successfully');
      queryClient.invalidateQueries({ queryKey: [GAMES_ADMIN_QUERY_KEY] });
    },
    onError: (error) => {
      toast.error(`Failed to delete game: ${error.message}`);
    },
  });


  const handleDelete = async (game: DbGame) => {
    if (!window.confirm(`Are you sure you want to delete "${game.title || game.game_name}"?`)) return;
    deleteGameMutation.mutate(game.id);
  };
  
  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingGame(null);
    refetch();
  };
  
  const gameStatuses: GameStatus[] = ["active", "inactive", "pending", "blocked"];
  

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Games Management (Detailed)</h1>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={handleAddNew}><PlusCircle className="mr-2 h-4 w-4" /> Add New Game</Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 p-4 bg-card rounded-lg shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="relative">
          <Input
            type="search"
            placeholder="Search games..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        <Select value={filterProvider} onValueChange={setFilterProvider}>
            <SelectTrigger><SelectValue placeholder="Filter by Provider" /></SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Providers</SelectItem>
                {providersForForm.map(p => <SelectItem key={p.slug} value={p.slug}>{p.name}</SelectItem>)}
            </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger><SelectValue placeholder="Filter by Category" /></SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categoriesForForm.map(c => <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>)}
            </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as GameStatus | 'all')}>
            <SelectTrigger><SelectValue placeholder="Filter by Status" /></SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {gameStatuses.map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
            </SelectContent>
        </Select>
      </div>

      {isLoadingGames ? (
        <p>Loading games...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Categories</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>RTP (%)</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {games.map((game) => (
              <TableRow key={game.id}>
                <TableCell className="font-medium flex items-center gap-2">
                    <img src={game.cover || game.image_url || '/placeholder-game.png'} alt={game.title || game.game_name} className="h-10 w-10 rounded-sm object-cover"/>
                    {game.title || game.game_name}
                </TableCell>
                <TableCell>{providersForForm.find(p => p.slug === game.provider_slug)?.name || game.provider_slug}</TableCell>
                <TableCell>{(game.category_slugs || []).join(', ')}</TableCell>
                <TableCell><span className={`px-2 py-1 text-xs rounded-full ${game.status === 'active' ? 'bg-green-500/20 text-green-700' : 'bg-slate-500/20 text-slate-500'}`}>{game.status}</span></TableCell>
                <TableCell>{game.rtp || 'N/A'}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="icon" onClick={() => handleEdit(game)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDelete(game)}><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {games.length === 0 && !isLoadingGames && <p className="text-center py-4">No games found matching filters.</p>}
      
      <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
          setIsFormOpen(isOpen);
          if (!isOpen) setEditingGame(null);
      }}>
        <DialogContent className="sm:max-w-[800px] md:max-w-[1000px] lg:max-w-[1200px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingGame ? 'Edit Game' : 'Add New Game'}</DialogTitle>
          </DialogHeader>
           <GameForm
                game={editingGame}
                onSubmitSuccess={handleFormSuccess}
                onCancel={() => {setIsFormOpen(false); setEditingGame(null);}}
                providers={providersForForm}
                categories={categoriesForForm}
            />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GamesAdminPage;
