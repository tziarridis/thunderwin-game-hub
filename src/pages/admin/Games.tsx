
import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Game, GameProvider, GameCategory, GameStatus } from '@/types'; // Ensure GameProvider and GameCategory are imported
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { PlusCircle, Edit, Trash2, Search, Filter, Upload, Settings2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import Papa from 'papaparse'; // For CSV import

const GAMES_ADMIN_QUERY_KEY = 'admin_games';
const PROVIDERS_ADMIN_QUERY_KEY = 'admin_game_providers';
const CATEGORIES_ADMIN_QUERY_KEY = 'admin_game_categories';

const GamesAdminPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Partial<Game> | null>(null);
  
  const [filterProvider, setFilterProvider] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<GameStatus | 'all'>('all');

  // Fetch games
  const { data: games = [], isLoading: isLoadingGames } = useQuery<Game[], Error>({
    queryKey: [GAMES_ADMIN_QUERY_KEY, searchTerm, filterProvider, filterCategory, filterStatus],
    queryFn: async () => {
      let query = supabase.from('games').select('*');
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,game_id.ilike.%${searchTerm}%,provider_slug.ilike.%${searchTerm}%`);
      }
      if (filterProvider !== 'all') {
        query = query.eq('provider_slug', filterProvider);
      }
      if (filterCategory !== 'all') {
        // This assumes category_slugs is an array that can be queried with cs (contains)
        // Adjust if your schema is different (e.g., a single category_slug field)
        query = query.cs('category_slugs', `{${filterCategory}}`);
      }
      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }
      
      const { data, error } = await query.order('title', { ascending: true });
      if (error) throw error;
      // Ensure provider_slug is part of the data from DB or mapped correctly
      return data.map(g => ({ ...g, provider_slug: g.provider_slug || '' })) as Game[];
    },
  });

  const { data: providers = [] } = useQuery<GameProvider[], Error>({
    queryKey: [PROVIDERS_ADMIN_QUERY_KEY],
    queryFn: async () => {
        const { data, error } = await supabase.from('providers').select('*');
        if (error) throw error;
        return data.map(p => ({...p, slug: p.slug || String(p.id)})) as GameProvider[]; // Ensure slug is present
    }
  });

  const { data: categories = [] } = useQuery<GameCategory[], Error>({
    queryKey: [CATEGORIES_ADMIN_QUERY_KEY],
    queryFn: async () => {
        const { data, error } = await supabase.from('game_categories').select('*');
        if (error) throw error;
        return data as GameCategory[];
    }
  });
  
  // Create or Update Game Mutation
  const gameMutation = useMutation<Game, Error, Partial<Game>>(
    async (gameData) => {
      // Ensure required fields for insert/update are present
      const payload = {
        ...gameData,
        // Supabase might automatically handle created_at/updated_at
        // Ensure rtp, lines, min_bet, max_bet are numbers or null
        rtp: gameData.rtp ? Number(gameData.rtp) : null,
        lines: gameData.lines ? Number(gameData.lines) : null,
        min_bet: gameData.min_bet ? Number(gameData.min_bet) : null,
        max_bet: gameData.max_bet ? Number(gameData.max_bet) : null,
        is_featured: !!gameData.is_featured,
        isNew: !!gameData.isNew,
        only_real: !!gameData.only_real,
        only_demo: !!gameData.only_demo,
        has_freespins: !!gameData.has_freespins,
      };

      // Remove id from payload if it's for a new game, to let DB auto-generate
      // Or use game_id as primary key if that's your schema
      if (!payload.id && payload.game_id) { // If using game_id as PK
          // No separate 'id' field, upsert on 'game_id'
      } else if (!payload.id) {
          // delete payload.id; // If 'id' is auto-incrementing and not part of form for new
      }


      const { data, error } = await supabase
        .from('games')
        .upsert(payload as any) // Cast to any if type conflicts persist due to partials
        .select()
        .single();

      if (error) throw error;
      return data as Game;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [GAMES_ADMIN_QUERY_KEY] });
        setIsModalOpen(false);
        setEditingGame(null);
        toast.success(`Game ${editingGame?.id || editingGame?.game_id ? 'updated' : 'created'} successfully.`);
      },
      onError: (error) => {
        toast.error(`Error saving game: ${error.message}`);
      },
    }
  );

  const handleEdit = (game: Game) => {
    setEditingGame(game);
    setIsModalOpen(true);
  };
  
  const handleAddNew = () => {
    setEditingGame({ status: 'pending', provider_slug: '', category_slugs: [], is_featured: false, isNew: false });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string | number) => {
    // Use game.id or game.game_id depending on your primary key
    const pkValue = typeof id === 'number' ? id : (editingGame?.game_id || id);
    const pkColumn = typeof id === 'number' ? 'id' : 'game_id';


    if (!window.confirm('Are you sure you want to delete this game?')) return;
    // @ts-ignore
    const { error } = await supabase.from('games').delete().match({ [pkColumn]: pkValue });
    if (error) {
      toast.error(`Failed to delete game: ${error.message}`);
    } else {
      toast.success('Game deleted successfully.');
      queryClient.invalidateQueries({ queryKey: [GAMES_ADMIN_QUERY_KEY] });
    }
  };
  
  const handleSaveGame = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editingGame) {
        // Ensure provider_slug is set if providerName is, for example
        if (editingGame.providerName && !editingGame.provider_slug) {
            const provider = providers.find(p => p.name === editingGame.providerName);
            if (provider) editingGame.provider_slug = provider.slug;
        }
        gameMutation.mutate(editingGame);
    }
  };

  // const handleCsvImport = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   // CSV import logic using Papa.parse
  //   // This is a placeholder
  //   toast.info("CSV Import functionality placeholder.");
  // };

  const gameStatuses: GameStatus[] = ["active", "inactive", "pending", "blocked"];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Games Management</h1>
        <div className="flex gap-2 flex-wrap">
          {/* <Button variant="outline"><Upload className="mr-2 h-4 w-4" /> Import CSV</Button> */}
          <Button onClick={handleAddNew}><PlusCircle className="mr-2 h-4 w-4" /> Add New Game</Button>
        </div>
      </div>

      <div className="mb-6 p-4 bg-card rounded-lg shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Input
          type="search"
          placeholder="Search games..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search className="h-4 w-4 text-muted-foreground" />}
        />
        <Select value={filterProvider} onValueChange={setFilterProvider}>
            <SelectTrigger><SelectValue placeholder="Filter by Provider" /></SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Providers</SelectItem>
                {providers.map(p => <SelectItem key={p.id} value={p.slug}>{p.name}</SelectItem>)}
            </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger><SelectValue placeholder="Filter by Category" /></SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(c => <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>)}
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
              <TableRow key={String(game.id) || game.game_id}>
                <TableCell className="font-medium flex items-center gap-2">
                    <img src={game.cover || game.image || '/placeholder-game.png'} alt={game.title} className="h-10 w-10 rounded-sm object-cover"/>
                    {game.title}
                </TableCell>
                <TableCell>{game.providerName || game.provider_slug}</TableCell>
                <TableCell>{(game.category_slugs || []).join(', ')}</TableCell>
                <TableCell><span className={`px-2 py-1 text-xs rounded-full ${game.status === 'active' ? 'bg-green-500/20 text-green-500' : 'bg-slate-500/20 text-slate-500'}`}>{game.status}</span></TableCell>
                <TableCell>{game.rtp || 'N/A'}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="icon" onClick={() => handleEdit(game)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDelete(game.id || game.game_id!)}><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {games.length === 0 && !isLoadingGames && <p className="text-center py-4">No games found matching filters.</p>}
      
      {/* Dialog for Add/Edit Game */}
      <Dialog open={isModalOpen} onOpenChange={(isOpen) => {
          setIsModalOpen(isOpen);
          if (!isOpen) setEditingGame(null);
      }}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingGame?.id || editingGame?.game_id ? 'Edit' : 'Add New'} Game</DialogTitle>
          </DialogHeader>
          {editingGame && (
            <form onSubmit={handleSaveGame} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="title">Title</Label><Input id="title" value={editingGame.title || ''} onChange={(e) => setEditingGame(prev => ({...prev, title: e.target.value}))} required /></div>
                <div><Label htmlFor="game_id">External Game ID</Label><Input id="game_id" value={editingGame.game_id || ''} onChange={(e) => setEditingGame(prev => ({...prev, game_id: e.target.value}))} required /></div>
                <div><Label htmlFor="slug">Slug</Label><Input id="slug" value={editingGame.slug || ''} onChange={(e) => setEditingGame(prev => ({...prev, slug: e.target.value}))} required /></div>
                
                <div>
                  <Label htmlFor="provider_slug">Provider</Label>
                  <Select value={editingGame.provider_slug || ''} onValueChange={(value) => setEditingGame(prev => ({...prev, provider_slug: value, providerName: providers.find(p=>p.slug===value)?.name }))}>
                    <SelectTrigger><SelectValue placeholder="Select provider" /></SelectTrigger>
                    <SelectContent>
                      {providers.map(p => <SelectItem key={p.id} value={p.slug}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="category_slugs">Categories (comma-separated slugs)</Label>
                  <Input 
                    id="category_slugs" 
                    value={(editingGame.category_slugs || []).join(',')} 
                    onChange={(e) => setEditingGame(prev => ({...prev, category_slugs: e.target.value.split(',').map(s => s.trim()).filter(Boolean)}))} 
                    placeholder="e.g., slots,new-games,jackpot"
                  />
                </div>
                 <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={editingGame.status || 'pending'} onValueChange={(value) => setEditingGame(prev => ({...prev, status: value as GameStatus}))}>
                    <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                    <SelectContent>
                        {gameStatuses.map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div><Label htmlFor="rtp">RTP (%)</Label><Input id="rtp" type="number" step="0.01" value={editingGame.rtp || ''} onChange={(e) => setEditingGame(prev => ({...prev, rtp: parseFloat(e.target.value) || undefined}))} /></div>
                <div><Label htmlFor="volatility">Volatility</Label>
                  <Select value={editingGame.volatility || ''} onValueChange={(v) => setEditingGame(prev => ({...prev, volatility: v as GameVolatility | undefined}))}>
                    <SelectTrigger><SelectValue placeholder="Select Volatility"/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">N/A</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="low-medium">Low-Medium</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="medium-high">Medium-High</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label htmlFor="lines">Lines</Label><Input id="lines" type="number" value={editingGame.lines || ''} onChange={(e) => setEditingGame(prev => ({...prev, lines: parseInt(e.target.value) || undefined}))} /></div>
                <div><Label htmlFor="releaseDate">Release Date</Label><Input id="releaseDate" type="date" value={editingGame.releaseDate ? editingGame.releaseDate.substring(0,10) : ''} onChange={(e) => setEditingGame(prev => ({...prev, releaseDate: e.target.value}))} /></div>
              </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="cover">Cover Image URL</Label><Input id="cover" value={editingGame.cover || ''} onChange={(e) => setEditingGame(prev => ({...prev, cover: e.target.value}))} /></div>
                <div><Label htmlFor="banner">Banner Image URL</Label><Input id="banner" value={editingGame.banner || ''} onChange={(e) => setEditingGame(prev => ({...prev, banner: e.target.value}))} /></div>
              </div>
              <div><Label htmlFor="description">Description</Label><textarea id="description" value={editingGame.description || ''} onChange={(e) => setEditingGame(prev => ({...prev, description: e.target.value}))} className="w-full p-2 border rounded bg-input min-h-[80px]" /></div>
              
              <div className="space-y-2 pt-2">
                <div className="flex items-center space-x-2"><Checkbox id="is_featured" checked={!!editingGame.is_featured} onCheckedChange={(checked) => setEditingGame(prev => ({...prev, is_featured: !!checked}))} /><Label htmlFor="is_featured">Featured Game</Label></div>
                <div className="flex items-center space-x-2"><Checkbox id="isNew" checked={!!editingGame.isNew} onCheckedChange={(checked) => setEditingGame(prev => ({...prev, isNew: !!checked}))} /><Label htmlFor="isNew">New Game</Label></div>
                <div className="flex items-center space-x-2"><Checkbox id="only_real" checked={!!editingGame.only_real} onCheckedChange={(checked) => setEditingGame(prev => ({...prev, only_real: !!checked}))} /><Label htmlFor="only_real">Real Play Only</Label></div>
                <div className="flex items-center space-x-2"><Checkbox id="only_demo" checked={!!editingGame.only_demo} onCheckedChange={(checked) => setEditingGame(prev => ({...prev, only_demo: !!checked}))} /><Label htmlFor="only_demo">Demo Play Only</Label></div>
                <div className="flex items-center space-x-2"><Checkbox id="has_freespins" checked={!!editingGame.has_freespins} onCheckedChange={(checked) => setEditingGame(prev => ({...prev, has_freespins: !!checked}))} /><Label htmlFor="has_freespins">Has Freespins</Label></div>
              </div>

              <DialogFooter className="pt-4">
                <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                <Button type="submit" disabled={gameMutation.isLoading}>{gameMutation.isLoading ? 'Saving...' : 'Save Game'}</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GamesAdminPage;
