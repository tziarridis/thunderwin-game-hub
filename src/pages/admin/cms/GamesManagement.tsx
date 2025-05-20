import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Game, GameCategory as CategoryType, GameProvider as ProviderType } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { PlusCircle, Edit, Trash2, Search, Loader2, Eye, EyeOff, ExternalLink } from 'lucide-react';
import CMSPageHeader from '@/components/admin/cms/CMSPageHeader';
import ConfirmationDialog from '@/components/admin/shared/ConfirmationDialog';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { gameService } from '@/services/gameService'; // Using gameService

const ITEMS_PER_PAGE = 10;

const AdminGamesManagement: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [providers, setProviders] = useState<ProviderType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [showConfirmDeleteDialog, setShowConfirmDeleteDialog] = useState(false);
  const [gameToDelete, setGameToDelete] = useState<Game | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalGames, setTotalGames] = useState(0);

  const fetchGames = useCallback(async (page: number, search: string) => {
    setIsLoading(true);
    try {
      const result = await gameService.getAllGames({ 
        limit: ITEMS_PER_PAGE, 
        offset: (page - 1) * ITEMS_PER_PAGE, 
        search: search || undefined 
      });
      setGames(result.games);
      setTotalGames(result.count || 0);
    } catch (error: any) {
      toast.error(`Failed to fetch games: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMeta = async () => {
    try {
      const [cats, provs] = await Promise.all([
        gameService.getGameCategories(),
        gameService.getGameProviders()
      ]);
      setCategories(cats);
      setProviders(provs);
    } catch (error: any) {
      toast.error(`Failed to fetch categories/providers: ${error.message}`);
    }
  };

  useEffect(() => {
    fetchGames(currentPage, searchTerm);
  }, [fetchGames, currentPage, searchTerm]);

  useEffect(() => {
    fetchMeta();
  }, []);

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const gameData: Partial<Game> = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      provider_slug: formData.get('provider_slug') as string,
      category_slugs: formData.getAll('category_slugs') as string[],
      tags: (formData.get('tags') as string)?.split(',').map(tag => tag.trim()).filter(Boolean),
      rtp: parseFloat(formData.get('rtp') as string) || undefined,
      volatility: formData.get('volatility') as 'low' | 'medium' | 'high' | undefined,
      image_url: formData.get('image_url') as string || undefined, // Corrected property name
      cover: formData.get('cover') as string || undefined,
      is_active: formData.get('is_active') === 'on',
      is_featured: formData.get('is_featured') === 'on',
      isPopular: formData.get('isPopular') === 'on',
      isNew: formData.get('isNew') === 'on',
      // game_id: formData.get('game_id') as string, // External game ID if applicable
      slug: formData.get('slug') as string || formData.get('title')?.toString().toLowerCase().replace(/\s+/g, '-') || undefined,
      // provider_id: providers.find(p => p.slug === formData.get('provider_slug'))?.id,
      // providerName: providers.find(p => p.slug === formData.get('provider_slug'))?.name,
      // providerData: // This would be complex to handle in a simple form
      // game_props: // this too
    };
    
    // Find provider ID based on slug
    const selectedProvider = providers.find(p => p.slug === gameData.provider_slug);
    if (selectedProvider) {
      gameData.provider_id = selectedProvider.id;
      gameData.providerName = selectedProvider.name;
    }


    setIsLoading(true);
    try {
      if (editingGame) {
        await gameService.updateGame(editingGame.id!, gameData); // Assuming id is string UUID
        toast.success('Game updated successfully!');
      } else {
        await gameService.createGame(gameData as Game); // Cast as Game, ensure all required fields are present
        toast.success('Game created successfully!');
      }
      setShowFormDialog(false);
      setEditingGame(null);
      fetchGames(currentPage, searchTerm);
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
      fetchGames(currentPage, searchTerm);
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
        title="Games Content Management"
        description="Manage all casino games, categories, and providers."
        actions={
          <Button onClick={() => { setEditingGame(null); setShowFormDialog(true); }}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Game
          </Button>
        }
      />

      <div className="mb-4 flex items-center">
        <Input
          placeholder="Search games..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
         <Button onClick={() => fetchGames(1, searchTerm)} className="ml-2">
          <Search className="mr-2 h-4 w-4" /> Search
        </Button>
      </div>

      {isLoading && games.length === 0 && <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>}
      {games.length > 0 && (
        <div className="overflow-x-auto rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {games.map((game) => (
                <TableRow key={game.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    {game.image_url ? (
                        <img src={game.image_url || game.image || game.cover} alt={game.title} className="h-10 w-10 object-cover rounded-sm" onError={(e) => e.currentTarget.style.display = 'none'}/>
                    ) : (
                        <div className="h-10 w-10 bg-muted rounded-sm flex items-center justify-center text-muted-foreground text-xs">No Img</div>
                    )}
                    {game.title}
                    {game.slug && <a href={`/casino/game/${game.slug}`} target="_blank" rel="noopener noreferrer" title="View Game Page"><ExternalLink className="h-3 w-3 text-blue-500 hover:text-blue-700"/></a>}
                    </TableCell>
                  <TableCell>{game.providerName || game.provider_slug}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {game.category_slugs?.join(', ') || game.categoryName || game.category || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {game.is_active ? (
                      <span className="text-green-600 flex items-center"><Eye className="mr-1 h-4 w-4" /> Active</span>
                    ) : (
                      <span className="text-red-600 flex items-center"><EyeOff className="mr-1 h-4 w-4" /> Inactive</span>
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
              ))}
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
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" defaultValue={editingGame?.title || ''} required className="mt-1" />
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
                    <Select name="provider_slug" defaultValue={editingGame?.provider_slug || ''}>
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
                        id={`category-${cat.slug}`} 
                        name="category_slugs" 
                        value={cat.slug}
                        defaultChecked={editingGame?.category_slugs?.includes(cat.slug) || false}
                        />
                        <Label htmlFor={`category-${cat.slug}`} className="font-normal">{cat.name}</Label>
                    </div>
                    ))}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input id="tags" name="tags" defaultValue={editingGame?.tags?.join(', ') || ''} className="mt-1" />
                </div>
                <div>
                    <Label htmlFor="rtp">RTP (%)</Label>
                    <Input id="rtp" name="rtp" type="number" step="0.01" defaultValue={editingGame?.rtp || ''} className="mt-1" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                 <div>
                    <Label htmlFor="image_url">Image URL</Label>
                    <Input id="image_url" name="image_url" defaultValue={editingGame?.image_url || editingGame?.image || ''} className="mt-1" />
                </div>
            </div>
            <div>
                <Label htmlFor="cover">Cover Image URL (Large)</Label>
                <Input id="cover" name="cover" defaultValue={editingGame?.cover || ''} className="mt-1" />
            </div>
            <div className="space-y-2 pt-2">
                <div className="flex items-center space-x-2">
                    <Checkbox id="is_active" name="is_active" defaultChecked={editingGame?.is_active === undefined ? true : editingGame.is_active} />
                    <Label htmlFor="is_active" className="font-normal">Active (Visible to players)</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox id="is_featured" name="is_featured" defaultChecked={editingGame?.is_featured || false} />
                    <Label htmlFor="is_featured" className="font-normal">Featured Game</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox id="isPopular" name="isPopular" defaultChecked={editingGame?.isPopular || false} />
                    <Label htmlFor="isPopular" className="font-normal">Popular Game</Label>
                </div>
                 <div className="flex items-center space-x-2">
                    <Checkbox id="isNew" name="isNew" defaultChecked={editingGame?.isNew || false} />
                    <Label htmlFor="isNew" className="font-normal">New Game</Label>
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
        description={`Are you sure you want to delete the game "${gameToDelete?.title}"? This action cannot be undone.`}
        confirmButtonText="Delete"
        isLoading={isLoading}
      />
    </div>
  );
};

export default AdminGamesManagement;
