import React, { useState, useEffect, useCallback } from 'react';
import { Game, GameCategory, GameProvider } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { PlusCircle, Edit, Trash2, Search, Loader2, Eye, EyeOff, ExternalLink } from 'lucide-react';
import CMSPageHeader from '@/components/admin/cms/CMSPageHeader';
import ConfirmationDialog from '@/components/admin/shared/ConfirmationDialog';
import { gameService } from '@/services/gameService';

const ITEMS_PER_PAGE = 10;

const AdminGamesOverview: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [categories, setCategories] = useState<GameCategory[]>([]);
  const [providers, setProviders] = useState<GameProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProvider, setFilterProvider] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [showConfirmDeleteDialog, setShowConfirmDeleteDialog] = useState(false);
  const [gameToDelete, setGameToDelete] = useState<Game | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalGames, setTotalGames] = useState(0);

  const fetchGamesAndMeta = useCallback(async (page: number, search: string, providerSlug?: string, categorySlug?: string) => {
    setIsLoading(true);
    try {
      const [gamesResult, cats, provs] = await Promise.all([
        gameService.getAllGames({ 
          limit: ITEMS_PER_PAGE, 
          offset: (page - 1) * ITEMS_PER_PAGE, 
          search: search || undefined,
          provider: providerSlug || undefined,
          category: categorySlug || undefined,
        }),
        gameService.getGameCategories(),
        gameService.getGameProviders()
      ]);
      
      setGames(gamesResult.games);
      setTotalGames(gamesResult.count || 0);
      setCategories(cats);
      setProviders(provs);

    } catch (error: any) {
      toast.error(`Failed to load data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);


  useEffect(() => {
    fetchGamesAndMeta(currentPage, searchTerm, filterProvider, filterCategory);
  }, [fetchGamesAndMeta, currentPage, searchTerm, filterProvider, filterCategory]);


  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    // The Game type from src/types/game.ts (not provided, but inferred from DB schema games table)
    // uses `status: character varying` not `is_active: boolean`.
    // It also expects `game_name` not `title`.
    const gameData: Partial<Game> = {
      game_name: formData.get('title') as string, // Map form 'title' to 'game_name'
      description: formData.get('description') as string,
      provider_slug: formData.get('provider_slug') as string,
      category_slugs: formData.getAll('category_slugs') as string[],
      tags: (formData.get('tags') as string)?.split(',').map(tag => tag.trim()).filter(Boolean),
      rtp: parseFloat(formData.get('rtp') as string) || undefined, // rtp is numeric in DB
      volatility: formData.get('volatility') as 'low' | 'medium' | 'high' | undefined,
      image_url: formData.get('image_url') as string || undefined,
      cover: formData.get('cover') as string || undefined, // cover is in DB
      status: formData.get('is_active') === 'on' ? 'active' : 'inactive', // Map 'is_active' to 'status'
      is_featured: formData.get('is_featured') === 'on', // is_featured is in DB
      isPopular: formData.get('isPopular') === 'on', // Not in DB schema, might be on type Game
      isNew: formData.get('isNew') === 'on', // Not in DB schema, might be on type Game
      game_id: formData.get('game_id') as string || undefined, // game_id is in DB
      slug: formData.get('slug') as string || formData.get('title')?.toString().toLowerCase().replace(/\s+/g, '-') || undefined, // slug might not be in DB schema
      // Fields from DB schema:
      // provider_id, has_lobby, is_mobile, has_freespins, has_tables, only_demo, views, show_home,
      // game_type, technology, distribution, game_server_url, game_code
      // These need to be added to form if they are to be managed.
    };
    
    const selectedProvider = providers.find(p => p.slug === gameData.provider_slug);
    if (selectedProvider && selectedProvider.id) {
      gameData.provider_id = String(selectedProvider.id); // Ensure provider_id is string
      gameData.providerName = selectedProvider.name; // providerName is for display, not DB usually
    }
    // gameData.game_code might be needed if it's a required field in DB (it is in the schema)
    if (!gameData.game_code && gameData.game_id) { // Infer game_code from game_id if not provided
        gameData.game_code = gameData.game_id;
    }


    setIsLoading(true);
    try {
      if (editingGame && editingGame.id) {
        await gameService.updateGame(editingGame.id, gameData);
        toast.success('Game updated successfully!');
      } else {
        // Ensure all required fields for Game creation are present
        // e.g. game_code, game_name, rtp, distribution, status are NOT NULL in DB
        if (!gameData.game_name || !gameData.rtp || !gameData.game_code) {
            toast.error("Game Name, RTP, and Game Code are required.");
            setIsLoading(false);
            return;
        }
        gameData.distribution = gameData.distribution || 'online'; // Default if not in form
        
        await gameService.createGame(gameData as Omit<Game, 'id' | 'created_at' | 'updated_at'>); // Cast to creation type
        toast.success('Game created successfully!');
      }
      setShowFormDialog(false);
      setEditingGame(null);
      fetchGamesAndMeta(currentPage, searchTerm, filterProvider, filterCategory);
    } catch (error: any) {
      toast.error(`Operation failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const openDeleteDialog = (game: Game) => {
    setGameToDelete(game);
    setShowConfirmDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!gameToDelete || !gameToDelete.id) return;
    setIsLoading(true);
    try {
      await gameService.deleteGame(gameToDelete.id);
      toast.success('Game deleted successfully!');
      setShowConfirmDeleteDialog(false);
      setGameToDelete(null);
      fetchGamesAndMeta(currentPage, searchTerm, filterProvider, filterCategory);
    } catch (error: any) {
      toast.error(`Failed to delete game: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = Math.ceil(totalGames / ITEMS_PER_PAGE);

  return (
    <div className="container mx-auto p-4">
      <CMSPageHeader
        title="Games Overview"
        description="View and manage all casino games."
        actions={
          <Button onClick={() => { setEditingGame(null); setShowFormDialog(true); }}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Game
          </Button>
        }
      />

      <div className="mb-6 p-4 border rounded-lg bg-card shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            placeholder="Search by title, ID, slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="lg:col-span-2"
          />
          <Select value={filterProvider} onValueChange={setFilterProvider}>
            <SelectTrigger><SelectValue placeholder="Filter by Provider" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Providers</SelectItem>
              {providers.map(p => <SelectItem key={p.id} value={p.slug}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger><SelectValue placeholder="Filter by Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categories.map(c => <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
         <Button onClick={() => { setCurrentPage(1); fetchGamesAndMeta(1, searchTerm, filterProvider, filterCategory); }} className="mt-4 w-full md:w-auto">
            <Search className="mr-2 h-4 w-4" /> Apply Filters
          </Button>
      </div>
      
      {isLoading && games.length === 0 && <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>}

      {games.length > 0 && (
        <div className="overflow-x-auto rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title (Game Name)</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {games.map((game) => {
                const isActive = game.status === 'active';
                return (
                <TableRow key={game.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    {game.image_url || game.image || game.cover ? (
                        <img src={game.image_url || game.image || game.cover} alt={game.game_name || game.title} className="h-10 w-10 object-cover rounded-sm" onError={(e) => e.currentTarget.style.display = 'none'}/>
                    ) : (
                        <div className="h-10 w-10 bg-muted rounded-sm flex items-center justify-center text-muted-foreground text-xs">NoImg</div>
                    )}
                     <div className="max-w-[200px] truncate" title={game.game_name || game.title}>
                        {game.game_name || game.title} {/* Display game_name which maps to DB */}
                     </div>
                    {game.slug && <a href={`/casino/game/${game.slug}`} target="_blank" rel="noopener noreferrer" title="View Game Page"><ExternalLink className="h-3 w-3 text-blue-500 hover:text-blue-700"/></a>}
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate" title={game.providerName || game.provider_slug}>{game.providerName || game.provider_slug}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {/* Ensure category_slugs is an array before join */}
                    {Array.isArray(game.category_slugs) ? game.category_slugs.join(', ') : game.categoryName || game.category || 'N/A'}
                  </TableCell>
                   <TableCell>
                    {isActive ? (
                      <span className="text-green-600 flex items-center"><Eye className="mr-1 h-4 w-4" /> Active</span>
                    ) : (
                      <span className="text-red-600 flex items-center"><EyeOff className="mr-1 h-4 w-4" /> {game.status ? game.status.charAt(0).toUpperCase() + game.status.slice(1) : 'Inactive'}</span>
                    )}
                  </TableCell>
                  <TableCell>{game.is_featured ? 'Yes' : 'No'}</TableCell>
                  <TableCell className="space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => { setEditingGame(game); setShowFormDialog(true); }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(game)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              )})}
            </TableBody>
          </Table>
        </div>
      )}

    {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
            <Button 
                onClick={() => setCurrentPage(p => Math.max(1, p-1))} 
                disabled={currentPage === 1 || isLoading}
                variant="outline"
            >
                Previous
            </Button>
            <span>Page {currentPage} of {totalPages}</span>
            <Button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} 
                disabled={currentPage === totalPages || isLoading}
                variant="outline"
            >
                Next
            </Button>
        </div>
      )}
      
      {!isLoading && games.length === 0 && (
        <p className="text-center text-muted-foreground py-6">
          No games found matching your criteria. Try adjusting filters or adding new games.
        </p>
      )}

      <Dialog open={showFormDialog} onOpenChange={setShowFormDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingGame ? 'Edit Game' : 'Add New Game'}</DialogTitle>
            <DialogDescription>
              {editingGame ? 'Update the details for this game.' : 'Fill in the form to add a new game.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4 py-4">
            <div>
              <Label htmlFor="title">Title (Game Name)</Label> {/* Clarified label */}
              <Input id="title" name="title" defaultValue={editingGame?.game_name || editingGame?.title || ''} required className="mt-1" />
            </div>
             <div>
              <Label htmlFor="slug">Slug (URL friendly identifier)</Label>
              <Input id="slug" name="slug" defaultValue={editingGame?.slug || ''} placeholder="e.g. my-awesome-game" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" defaultValue={editingGame?.description || ''} className="mt-1" />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="game_id">External Game ID (from provider)</Label>
                    <Input id="game_id" name="game_id" defaultValue={editingGame?.game_id || ''} className="mt-1" />
                </div>
                <div>
                    <Label htmlFor="provider_slug">Provider</Label>
                    <Select name="provider_slug" defaultValue={editingGame?.provider_slug || providers[0]?.slug || ''}>
                        <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                        <SelectContent>
                        {providers.map(p => <SelectItem key={p.id} value={p.slug}>{p.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div>
                <Label>Categories</Label>
                <div className="mt-1 grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border p-2 rounded-md">
                    {categories.map(cat => (
                    <div key={cat.id} className="flex items-center space-x-2">
                        <Checkbox 
                        id={`category-form-${cat.slug}`} 
                        name="category_slugs" 
                        value={cat.slug}
                        defaultChecked={Array.isArray(editingGame?.category_slugs) && editingGame?.category_slugs?.includes(cat.slug) || false}
                        />
                        <Label htmlFor={`category-form-${cat.slug}`} className="font-normal">{cat.name}</Label>
                    </div>
                    ))}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <Label htmlFor="game_code">Game Code (Required, often same as Game ID)</Label>
                    <Input id="game_code" name="game_code" defaultValue={editingGame?.game_code || editingGame?.game_id ||''} className="mt-1" required/>
                </div>
                <div>
                    <Label htmlFor="rtp">RTP (%) (Required)</Label>
                    <Input id="rtp" name="rtp" type="number" step="0.01" defaultValue={editingGame?.rtp?.toString() || ''} className="mt-1" required />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input id="tags" name="tags" defaultValue={editingGame?.tags?.join(', ') || ''} className="mt-1" />
                </div>
                <div>
                    <Label htmlFor="volatility">Volatility</Label>
                    <Select name="volatility" defaultValue={editingGame?.volatility || ''}>
                        <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select volatility" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
             <div>
                <Label htmlFor="image_url">Thumbnail Image URL</Label>
                <Input id="image_url" name="image_url" defaultValue={editingGame?.image_url || editingGame?.image || ''} className="mt-1" />
            </div>
            <div>
                <Label htmlFor="cover">Cover Image URL (Large)</Label>
                <Input id="cover" name="cover" defaultValue={editingGame?.cover || ''} className="mt-1" />
            </div>
            <div className="space-y-2 pt-2">
                <div className="flex items-center space-x-2">
                    <Checkbox id="is_active-form" name="is_active" defaultChecked={editingGame?.status === undefined ? true : editingGame.status === 'active'} />
                    <Label htmlFor="is_active-form" className="font-normal">Active (Visible to players)</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox id="is_featured-form" name="is_featured" defaultChecked={editingGame?.is_featured || false} />
                    <Label htmlFor="is_featured-form" className="font-normal">Featured Game</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox id="isPopular-form" name="isPopular" defaultChecked={editingGame?.isPopular || false} />
                    <Label htmlFor="isPopular-form" className="font-normal">Popular Game (Display flag)</Label>
                </div>
                 <div className="flex items-center space-x-2">
                    <Checkbox id="isNew-form" name="isNew" defaultChecked={editingGame?.isNew || false} />
                    <Label htmlFor="isNew-form" className="font-normal">New Game (Display flag)</Label>
                </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setShowFormDialog(false)}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingGame ? 'Save Changes' : 'Create Game'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        isOpen={showConfirmDeleteDialog}
        onClose={() => setShowConfirmDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Game"
        description={`Are you sure you want to delete the game "${gameToDelete?.game_name || gameToDelete?.title}"? This action cannot be undone.`}
        confirmButtonText="Delete"
        isLoading={isLoading}
      />
    </div>
  );
};

export default AdminGamesOverview;
