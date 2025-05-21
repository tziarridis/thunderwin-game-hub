import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import { PlusCircle, Edit, Trash2, Search, Filter, Loader2, AlertCircle, ExternalLink, Eye, EyeOff } from 'lucide-react';
import AdminPageLayout from '@/components/layout/AdminPageLayout';
import { Game, GameCategory as CategoryType, GameProvider as ProviderType } from '@/types'; // Using existing types

const AdminGames = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [providers, setProviders] = useState<ProviderType[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGame, setEditingGame] = useState<Partial<Game> | null>(null); // Use Partial<Game> for edit form
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProvider, setFilterProvider] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const fetchGamesAndRelatedData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const gamesPromise = supabase.from('games').select(`
        *,
        provider:provider_id (id, name),
        game_categories:game_categories!game_category_games(id, name, slug) 
      `).order('created_at', { ascending: false });
      // For game_categories, if it's a many-to-many through 'game_category_games' table:
      // select: `*, provider:provider_id (id, name), game_category_games(game_categories(id, name, slug))`

      const providersPromise = supabase.from('providers').select('*');
      const categoriesPromise = supabase.from('game_categories').select('*');

      const [gamesRes, providersRes, categoriesRes] = await Promise.all([
        gamesPromise,
        providersPromise,
        categoriesPromise,
      ]);

      if (gamesRes.error) throw gamesRes.error;
      if (providersRes.error) throw providersRes.error;
      if (categoriesRes.error) throw categoriesRes.error;
      
      // The Game type needs to be compatible with this structure.
      // Game type needs provider (object), and game_categories (array of objects)
      const formattedGames = gamesRes.data.map(g => ({
        ...g,
        providerName: g.provider?.name, // Flatten for display
        categoryNames: Array.isArray(g.game_categories) ? g.game_categories.map(gc => gc.name).join(', ') : '', // Flatten for display
        // category_slugs might need to be extracted from g.game_categories as well
        category_slugs: Array.isArray(g.game_categories) ? g.game_categories.map(gc => gc.slug) : [],
      })) as Game[];

      setGames(formattedGames);
      setProviders(providersRes.data as ProviderType[]);
      setCategories(categoriesRes.data as CategoryType[]);

    } catch (err: any) {
      console.error("Error fetching games data:", err);
      setError(`Failed to load data: ${err.message}`);
      toast.error(`Data loading error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGamesAndRelatedData();
  }, [fetchGamesAndRelatedData]);

  const handleCreateOrUpdateGame = async () => {
    if (!editingGame) return;
    setIsLoading(true);

    // Construct payload, ensuring all required fields are present or defaulted
    const payload: Omit<Game, 'id' | 'created_at' | 'updated_at' | 'provider' | 'game_categories' | 'providerName' | 'categoryNames'> & { id?: string; provider_id?: string | null; category_ids?: string[] } = {
      game_id: editingGame.game_id || '', // Ensure required string fields are not null/undefined
      game_name: editingGame.game_name || editingGame.title || '', // DB has game_name
      game_code: editingGame.game_code || editingGame.slug || '', // DB has game_code
      title: editingGame.title || editingGame.game_name || '',
      slug: editingGame.slug || '',
      description: editingGame.description || null,
      rtp: editingGame.rtp ? Number(editingGame.rtp) : 0,
      volatility: editingGame.volatility || null,
      tags: editingGame.tags || [],
      status: editingGame.status || 'draft',
      provider_id: editingGame.provider_id || null, // This should be the UUID of the provider
      // category_ids: editingGame.category_slugs, // This needs to be category UUIDs for a join table
      cover: editingGame.cover || null,
      image: editingGame.image || null,
      // ... other fields from Game type
      isNew: editingGame.isNew || false,
      isPopular: editingGame.isPopular || false,
      is_featured: editingGame.is_featured || false,
      releaseDate: editingGame.releaseDate || new Date().toISOString(),
      // Ensure all other required fields from the 'games' table are present
      distribution: editingGame.distribution || 'digital', // Example default
      has_lobby: editingGame.has_lobby || false,
      is_mobile: editingGame.is_mobile || true,
      has_freespins: editingGame.has_freespins || false,
      has_tables: editingGame.has_tables || false,
      only_demo: editingGame.only_demo || false,
      views: editingGame.views || 0,
      show_home: editingGame.show_home || false,
      game_type: editingGame.game_type || null,
      technology: editingGame.technology || 'html5',
      game_server_url: editingGame.game_server_url || null,
    };
    
    // Remove category_slugs if it's not a direct column
    // delete (payload as any).category_slugs;


    try {
      let response;
      if (editingGame.id) { // Update
        // For updating many-to-many (categories), it's more complex.
        // You might need to delete existing relations and insert new ones.
        // This part is simplified.
        response = await supabase.from('games').update(payload as any).eq('id', editingGame.id).select().single();
      } else { // Create
        response = await supabase.from('games').insert(payload as any).select().single();
        // After creating the game, if response.data.id exists and payload.category_ids exists,
        // you'd insert into the join table (e.g., 'game_category_games')
      }

      if (response.error) throw response.error;
      toast.success(`Game ${editingGame.id ? 'updated' : 'created'} successfully!`);
      setShowCreateModal(false);
      setEditingGame(null);
      fetchGamesAndRelatedData(); // Refresh list
    } catch (err: any) {
      console.error("Error saving game:", err);
      toast.error(`Error saving game: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteGame = async (gameId: string) => {
    if (!window.confirm(`Are you sure you want to delete this game? This action cannot be undone.`)) return;
    setIsLoading(true);
    try {
      // Also handle deleting from join tables if necessary (e.g., game_category_games)
      const { error } = await supabase.from('games').delete().eq('id', gameId);
      if (error) throw error;
      toast.success('Game deleted successfully.');
      fetchGamesAndRelatedData();
    } catch (err: any) {
      toast.error(`Error deleting game: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEditGame = (game: Game) => {
    setEditingGame({...game}); // Spread to make a mutable copy
    setShowCreateModal(true);
  };

  const handleCreateNewGame = () => {
    setEditingGame({ status: 'draft', rtp: 96 }); // Default new game values
    setShowCreateModal(true);
  };

  const filteredGames = games.filter(game => {
    const s = searchTerm.toLowerCase();
    const titleMatch = game.title?.toLowerCase().includes(s);
    const providerMatch = filterProvider === 'all' || game.provider_id === filterProvider;
    // Category filtering needs to check against game.category_slugs or similar
    const categoryMatch = filterCategory === 'all' || (game.category_slugs && game.category_slugs.includes(filterCategory));
    const statusMatch = filterStatus === 'all' || game.status === filterStatus;
    return titleMatch && providerMatch && categoryMatch && statusMatch;
  });


  if (isLoading && games.length === 0) {
    return <AdminPageLayout title="Games Management"><div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div></AdminPageLayout>;
  }

  if (error && games.length === 0) {
    return <AdminPageLayout title="Games Management">
      <div className="text-center py-10 text-red-500 bg-red-50 p-4 rounded-md">
        <AlertCircle className="mx-auto h-12 w-12 mb-4" />
        <h3 className="text-xl font-semibold mb-2">Failed to load games data</h3>
        <p>{error}</p>
        <Button onClick={fetchGamesAndRelatedData} className="mt-4">Try Again</Button>
      </div>
    </AdminPageLayout>;
  }


  return (
    <AdminPageLayout title="Games Management">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold">Games</h1>
        <Button onClick={handleCreateNewGame}><PlusCircle className="mr-2 h-4 w-4" /> Add New Game</Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter Games</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Input 
            placeholder="Search by title..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="md:col-span-2"
            prefix={<Search className="h-4 w-4 text-muted-foreground" />}
          />
          <Select value={filterProvider} onValueChange={setFilterProvider}>
            <SelectTrigger><SelectValue placeholder="Filter by provider..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Providers</SelectItem>
              {providers.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger><SelectValue placeholder="Filter by category..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(c => <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
           <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger><SelectValue placeholder="Filter by status..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      
      {/* Games Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableCaption>{filteredGames.length === 0 ? "No games match your filters." : "A list of casino games."}</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Title (DB: game_name)</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead>RTP</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGames.map((game) => (
                <TableRow key={game.id}>
                  <TableCell>
                    <img src={game.image || game.cover || '/placeholder-game.png'} alt={game.title || 'Game image'} className="h-12 w-12 object-cover rounded-md"/>
                  </TableCell>
                  <TableCell className="font-medium">{game.title} ({game.game_name})</TableCell>
                  <TableCell>{game.providerName || 'N/A'}</TableCell>
                  <TableCell>{game.categoryNames || 'N/A'}</TableCell>
                  <TableCell>{game.rtp ? `${game.rtp}%` : 'N/A'}</TableCell>
                  <TableCell>
                     <span className={`px-2 py-0.5 text-xs rounded-full ${
                        game.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                        game.status === 'draft' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                        game.status === 'archived' ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' :
                        'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' // e.g. maintenance
                      }`}>{game.status}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEditGame(game)} title="Edit Game">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteGame(game.id)} title="Delete Game" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    {/* Add link to view game on frontend if applicable */}
                    {game.slug && (
                      <Button variant="ghost" size="icon" onClick={() => window.open(`/casino/game/${game.slug}`, '_blank')} title="View Game">
                         <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Dialog open={showCreateModal} onOpenChange={(isOpen) => {
        setShowCreateModal(isOpen);
        if (!isOpen) setEditingGame(null); // Reset form on close
      }}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingGame?.id ? 'Edit Game' : 'Add New Game'}</DialogTitle>
            <DialogDescription>
              {editingGame?.id ? 'Update the details of this game.' : 'Fill in the details for the new game.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Basic Info */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">Title</Label>
              <Input id="title" value={editingGame?.title || ''} onChange={(e) => setEditingGame(g => g ? {...g, title: e.target.value} : null)} className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="game_name" className="text-right">DB Game Name</Label>
              <Input id="game_name" value={editingGame?.game_name || ''} onChange={(e) => setEditingGame(g => g ? {...g, game_name: e.target.value} : null)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="slug" className="text-right">Slug</Label>
              <Input id="slug" value={editingGame?.slug || ''} onChange={(e) => setEditingGame(g => g ? {...g, slug: e.target.value} : null)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Description</Label>
              <Input id="description" value={editingGame?.description || ''} onChange={(e) => setEditingGame(g => g ? {...g, description: e.target.value} : null)} className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="game_id_external" className="text-right">External Game ID</Label>
              <Input id="game_id_external" value={editingGame?.game_id || ''} onChange={(e) => setEditingGame(g => g ? {...g, game_id: e.target.value} : null)} className="col-span-3" placeholder="Provider's unique game ID" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="game_code_internal" className="text-right">Internal Game Code</Label>
              <Input id="game_code_internal" value={editingGame?.game_code || ''} onChange={(e) => setEditingGame(g => g ? {...g, game_code: e.target.value} : null)} className="col-span-3" placeholder="Your system's game code/slug" />
            </div>

            {/* Provider & Category */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="provider_id" className="text-right">Provider</Label>
              <Select value={editingGame?.provider_id || ''} onValueChange={(value) => setEditingGame(g => g ? {...g, provider_id: value} : null)}>
                <SelectTrigger className="col-span-3"><SelectValue placeholder="Select provider" /></SelectTrigger>
                <SelectContent>
                  {providers.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {/* Category selection (multi-select would be ideal here, simplified for now) */}
            <div className="grid grid-cols-4 items-center gap-4">
               <Label htmlFor="category_slugs" className="text-right">Categories (Slugs)</Label>
               <Input 
                    id="category_slugs" 
                    value={Array.isArray(editingGame?.category_slugs) ? editingGame.category_slugs.join(',') : ''} 
                    onChange={(e) => setEditingGame(g => g ? {...g, category_slugs: e.target.value.split(',').map(s => s.trim()).filter(Boolean)} : null)} 
                    className="col-span-3" 
                    placeholder="Comma-separated category slugs"
                />
                <p className="col-span-4 text-xs text-muted-foreground text-right">Note: Category assignment needs proper many-to-many handling via join table, this is a placeholder.</p>
            </div>

            {/* Technical Details */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rtp" className="text-right">RTP (%)</Label>
              <Input id="rtp" type="number" value={editingGame?.rtp || ''} onChange={(e) => setEditingGame(g => g ? {...g, rtp: parseFloat(e.target.value)} : null)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="volatility" className="text-right">Volatility</Label>
              <Input id="volatility" value={editingGame?.volatility || ''} onChange={(e) => setEditingGame(g => g ? {...g, volatility: e.target.value} : null)} className="col-span-3" placeholder="e.g., Low, Medium, High" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tags" className="text-right">Tags</Label>
              <Input 
                id="tags" 
                value={Array.isArray(editingGame?.tags) ? editingGame.tags.join(',') : ''} 
                onChange={(e) => setEditingGame(g => g ? {...g, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean)} : null)} 
                className="col-span-3" 
                placeholder="Comma-separated tags (e.g., popular, new)"
              />
            </div>

            {/* Status & Images */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">Status</Label>
               <Select value={editingGame?.status || 'draft'} onValueChange={(value) => setEditingGame(g => g ? {...g, status: value as Game['status']} : null)}>
                <SelectTrigger className="col-span-3"><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cover" className="text-right">Cover Image URL</Label>
              <Input id="cover" value={editingGame?.cover || ''} onChange={(e) => setEditingGame(g => g ? {...g, cover: e.target.value} : null)} className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="image" className="text-right">Thumbnail URL</Label>
              <Input id="image" value={editingGame?.image || ''} onChange={(e) => setEditingGame(g => g ? {...g, image: e.target.value} : null)} className="col-span-3" />
            </div>
            {/* Add more fields as necessary from Game type */}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreateModal(false); setEditingGame(null); }}>Cancel</Button>
            <Button onClick={handleCreateOrUpdateGame} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingGame?.id ? 'Save Changes' : 'Create Game'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </AdminPageLayout>
  );
};

export default AdminGames;
