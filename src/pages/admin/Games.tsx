import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Game, GameProvider, GameCategory as GameCategoryType } from '@/types'; // Ensure GameCategory is imported if used as GameCategoryType
import AdminPageLayout from '@/components/layout/AdminPageLayout';
import GameForm from '@/components/admin/GameForm'; // Assuming this component exists for add/edit
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, PlusCircle, Edit, Trash2, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

const AdminGamesPage = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [providers, setProviders] = useState<GameProvider[]>([]);
  const [categories, setCategories] = useState<GameCategoryType[]>([]); // Use GameCategoryType
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [providerFilter, setProviderFilter] = useState<string>(''); // provider ID or slug
  const [categoryFilter, setCategoryFilter] = useState<string>(''); // category ID or slug

  const fetchGames = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase.from('games').select(`
        *,
        provider:providers!inner(name),
        game_categories:game_categories!inner(name, slug) 
      `); // Fetch related provider name and categories

      if (searchTerm) {
        query = query.ilike('game_name', `%${searchTerm}%`); // Using game_name as per schema
      }
      // Filtering by provider/category ID would be more robust if available on 'games' table
      // Or adjust based on how provider/category are linked (e.g., provider_id column)
      if (providerFilter && providers.find(p=>p.id === providerFilter)) { // Check if providerFilter is an ID
         query = query.eq('provider_id', providerFilter);
      }
       // Category filtering might require a join or a different approach if games have multiple categories
      if (categoryFilter && categories.find(c=>c.id === categoryFilter)) {
        // This is tricky if a game can belong to multiple categories via a join table
        // For simplicity, if 'games' has a single 'category_id', use: .eq('category_id', categoryFilter)
        // If multiple, might need an RPC or to filter client-side after fetching more data
        // For now, this example might not filter categories perfectly without schema adjustment
      }


      const { data, error } = await query;
      if (error) throw error;

      // Map data to Game type
      const mappedGames: Game[] = data.map((g: any) => ({
        id: g.id,
        title: g.game_name, // Map game_name to title
        slug: g.game_code, // Map game_code to slug (or generate one)
        providerName: g.provider?.name, // provider is nested object
        provider_id: g.provider_id,
        categoryName: g.game_categories?.name, // Assuming one category for simplicity
        category_slugs: g.game_categories ? [g.game_categories.slug] : [], // Assuming one category
        rtp: g.rtp,
        cover: g.cover,
        image: g.cover, // Or specific image field
        description: g.description,
        status: g.status,
        views: g.views,
        is_featured: g.is_featured,
        // ... map other Game properties from g
        game_id: g.game_id,
        releaseDate: g.created_at, // Or specific release_date field
        tags: g.tags || [], // Assuming tags is an array field
        volatility: g.volatility, // Assuming volatility field
      }));
      setGames(mappedGames);

    } catch (error: any) {
      toast.error("Failed to fetch games: " + error.message);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, providerFilter, categoryFilter, providers, categories]); // Add dependencies

  const fetchMeta = useCallback(async () => {
    try {
        const { data: provData, error: provError } = await supabase.from('providers').select('*');
        if (provError) throw provError;
        setProviders(provData as GameProvider[]);

        const {data: catData, error: catError } = await supabase.from('game_categories').select('*');
        if (catError) throw catError;
        setCategories(catData as GameCategoryType[]); // Use GameCategoryType
    } catch (error: any) {
        toast.error("Failed to fetch providers/categories: " + error.message);
    }
  }, []);


  useEffect(() => {
    fetchMeta();
  }, [fetchMeta]);
  
  useEffect(() => {
    fetchGames();
  }, [fetchGames]); // fetchGames is memoized with its own dependencies

  const handleFormSubmit = async (gameData: Partial<Game>) => {
    setIsLoading(true);
    try {
      if (editingGame) {
        // Map Game type fields back to Supabase 'games' table columns
        const { error } = await supabase.from('games').update({
            game_name: gameData.title,
            game_code: gameData.slug,
            // provider_id: gameData.provider_id, // Needs careful handling if providerName is used in form
            // category_id: gameData.category_id, // Needs careful handling for categories
            rtp: gameData.rtp,
            cover: gameData.cover,
            description: gameData.description,
            status: gameData.status,
            is_featured: gameData.is_featured,
            // ... other fields
        }).eq('id', editingGame.id);
        if (error) throw error;
        toast.success("Game updated successfully.");
      } else {
        // Map Game type fields to Supabase 'games' table columns
         const { error } = await supabase.from('games').insert([{
            game_name: gameData.title,
            game_code: gameData.slug,
            // provider_id: gameData.provider_id,
            // category_id: gameData.category_id,
            rtp: gameData.rtp || 0, // Ensure defaults for non-nullable
            cover: gameData.cover,
            description: gameData.description,
            status: gameData.status || 'active',
            is_featured: gameData.is_featured || false,
            game_id: gameData.game_id || `ext-${Date.now()}`, // Ensure game_id (external) is present
            // ... other fields, ensure non-nullable fields have values
        }]);
        if (error) throw error;
        toast.success("Game added successfully.");
      }
      fetchGames();
      setIsModalOpen(false);
      setEditingGame(null);
    } catch (error: any) {
      toast.error("Operation failed: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const openModal = (game: Game | null = null) => {
    setEditingGame(game);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this game?")) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.from('games').delete().eq('id', id);
      if (error) throw error;
      toast.success("Game deleted successfully.");
      fetchGames();
    } catch (error: any) {
      toast.error("Failed to delete game: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <AdminPageLayout title="Games Management">
      <div className="mb-4 flex flex-col sm:flex-row gap-2 items-center justify-between">
        <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-grow sm:flex-grow-0">
                <Input
                    type="text"
                    placeholder="Search games..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64 bg-background"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </div>
            <Select value={providerFilter} onValueChange={setProviderFilter}>
                <SelectTrigger className="w-full sm:w-[180px] bg-background">
                    <SelectValue placeholder="All Providers" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="">All Providers</SelectItem>
                    {providers.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[180px] bg-background">
                    <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>
        <Button onClick={() => openModal()} className="w-full sm:w-auto mt-2 sm:mt-0">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Game
        </Button>
      </div>

      {isLoading && games.length === 0 ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>RTP (%)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {games.map((game) => (
                <TableRow key={game.id}>
                  <TableCell className="font-medium">{game.title}</TableCell>
                  <TableCell>{game.providerName || 'N/A'}</TableCell>
                  <TableCell>{game.categoryName || (Array.isArray(game.category_slugs) && game.category_slugs.join(', ')) || 'N/A'}</TableCell>
                  <TableCell>{game.rtp}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      game.status === 'active' ? 'bg-green-500/20 text-green-400' : 
                      game.status === 'maintenance' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-red-500/20 text-red-400' // inactive or other
                    }`}>
                      {game.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openModal(game)} className="mr-2">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(game.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      {!isLoading && games.length === 0 && (searchTerm || providerFilter || categoryFilter) && (
        <p className="text-center py-10 text-muted-foreground">No games match your current filters.</p>
      )}
       {!isLoading && games.length === 0 && !searchTerm && !providerFilter && !categoryFilter && (
        <p className="text-center py-10 text-muted-foreground">No games found. Try adding some!</p>
      )}


      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[625px] bg-card">
          <DialogHeader>
            <DialogTitle>{editingGame ? 'Edit Game' : 'Add New Game'}</DialogTitle>
          </DialogHeader>
          <GameForm 
            game={editingGame} 
            onSubmit={handleFormSubmit} 
            onCancel={() => setIsModalOpen(false)}
            providers={providers}
            categories={categories}
          />
        </DialogContent>
      </Dialog>
    </AdminPageLayout>
  );
};

export default AdminGamesPage;
