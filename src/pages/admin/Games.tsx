import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Game, DbGame, GameProvider, GameCategory, GameStatusEnum } from '@/types/game'; // Assuming GameStatusEnum is here
import GameForm from '@/components/admin/GameForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ConfirmationDialog from '@/components/admin/shared/ConfirmationDialog';
// Removed ConfirmationDialogProps import as it's not exported and likely not needed if using the component directly
import { toast } from 'sonner';
import { PlusCircle, Edit, Trash2, Search, Loader2, Eye, EyeOff, RefreshCw } from 'lucide-react';
import CMSPageHeader from '@/components/admin/cms/CMSPageHeader';
import { convertDbGameToGame, convertGameToDbGame } from '@/utils/gameTypeAdapter';
import { useGames } from '@/hooks/useGames'; // Using the context hook

const ITEMS_PER_PAGE = 15;

const AdminGamesPage: React.FC = () => {
  const queryClient = useQueryClient();
  // Using methods from useGames context instead of direct Supabase calls here for consistency
  const { fetchProviders: fetchContextProviders, fetchCategories: fetchContextCategories } = useGames();

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingGame, setEditingGame] = useState<DbGame | null>(null);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [gameToDelete, setGameToDelete] = useState<DbGame | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProvider, setFilterProvider] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch providers and categories for filters and form
  const { data: providersData, isLoading: isLoadingProviders } = useQuery<GameProvider[], Error>({
    queryKey: ['adminGameProviders'],
    queryFn: async () => {
      const { data, error } = await supabase.from('providers').select('*').order('name');
      if (error) throw error;
      return data || [];
    }
  });
  const providers = providersData || [];

  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery<GameCategory[], Error>({
    queryKey: ['adminGameCategories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (error) throw error;
      return data || [];
    }
  });
  const categories = categoriesData || [];

  // Fetch games
  const fetchPaginatedGames = async (page: number, search: string, provider: string, category: string) => {
    let query = supabase
      .from('games')
      .select('*, game_providers:providers!left(*), game_categories:categories!left(*)', { count: 'exact' });
      // Note: Using !left(*) for providers and categories to ensure games are returned even if provider/category link is broken or null.
      // Adjust to !inner(*) if games MUST have a provider/category.

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }
    if (provider !== 'all') {
      query = query.eq('provider_slug', provider);
    }
    if (category !== 'all' && categories.find(c => c.slug === category)) {
      // This requires games.category_slugs to be an array and check for containment
      // For simplicity, if your DB stores a single category_slug string on games table:
      // query = query.eq('category_slug', category); 
      // If games.category_slugs is array:
       query = query.cs('category_slugs', [category]);
    }

    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;
    query = query.range(from, to).order('title', { ascending: true });
    
    const { data, error, count } = await query;
    if (error) throw error;
    
    // The data from Supabase will have 'game_providers' and 'game_categories' as potentially null or objects/arrays.
    // DbGame type needs to be compatible with this structure.
    return { games: (data || []) as DbGame[], totalCount: count || 0 };
  };

  const { data: gamesData, isLoading: isLoadingGames, error: gamesError, refetch: refetchGames } = useQuery<{ games: DbGame[], totalCount: number }, Error>({
    queryKey: ['adminGames', currentPage, searchTerm, filterProvider, filterCategory],
    queryFn: () => fetchPaginatedGames(currentPage, searchTerm, filterProvider, filterCategory),
    // For TanStack Query v5, keepPreviousData is replaced by placeholderData
    placeholderData: (previousData) => previousData ?? undefined, 
  });

  const gamesList = gamesData?.games.map(g => convertDbGameToGame(g)) || [];
  const totalGames = gamesData?.totalCount || 0;
  const totalPages = Math.ceil(totalGames / ITEMS_PER_PAGE);

  const handleAddGame = () => {
    setEditingGame(null);
    setShowFormModal(true);
  };

  const handleEditGame = (game: DbGame) => {
    setEditingGame(game);
    setShowFormModal(true);
  };

  const handleDeleteGame = (game: DbGame) => {
    setGameToDelete(game);
    setShowConfirmDeleteModal(true);
  };

  const confirmDeleteGame = async () => {
    if (!gameToDelete) return;
    try {
      const { error } = await supabase.from('games').delete().eq('id', gameToDelete.id);
      if (error) throw error;
      toast.success(`Game "${gameToDelete.title}" deleted successfully.`);
      queryClient.invalidateQueries({ queryKey: ['adminGames'] });
      setShowConfirmDeleteModal(false);
      setGameToDelete(null);
    } catch (error: any) {
      toast.error(`Failed to delete game: ${error.message}`);
    }
  };
  
  const toggleGameStatus = async (game: Game) => {
    try {
      const newStatus = game.status === GameStatusEnum.ACTIVE ? GameStatusEnum.INACTIVE : GameStatusEnum.ACTIVE;
      const { error } = await supabase
        .from('games')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', game.id);
      if (error) throw error;
      toast.success(`Game "${game.title}" status updated to ${newStatus}.`);
      queryClient.invalidateQueries({ queryKey: ['adminGames'] });
    } catch (error: any) {
      toast.error(`Failed to update game status: ${error.message}`);
    }
  };


  const handleFormSubmitSuccess = () => {
    setShowFormModal(false);
    queryClient.invalidateQueries({ queryKey: ['adminGames'] });
     // Also refetch providers and categories from context if GameForm could have added new ones (though unlikely for this form)
    fetchContextProviders();
    fetchContextCategories();
  };
  
  useEffect(() => {
    // Fetch initial providers and categories for context if needed, or rely on a global provider
    fetchContextProviders();
    fetchContextCategories();
  }, [fetchContextProviders, fetchContextCategories]);

  if (gamesError) {
    return <div className="text-red-500 p-4">Error loading games: {gamesError.message}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <CMSPageHeader title="Game Management" description="Add, edit, and manage all casino games.">
        <Button onClick={handleAddGame} className="flex items-center gap-2">
          <PlusCircle className="h-5 w-5" /> Add New Game
        </Button>
      </CMSPageHeader>

      <div className="mb-6 p-4 border rounded-lg bg-card shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <Input
            placeholder="Search by title..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="lg:col-span-2"
          />
          <Select value={filterProvider} onValueChange={(value) => { setFilterProvider(value); setCurrentPage(1); }}>
            <SelectTrigger><SelectValue placeholder="Filter by Provider" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Providers</SelectItem>
              {providers.map(p => <SelectItem key={p.slug} value={p.slug}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterCategory} onValueChange={(value) => { setFilterCategory(value); setCurrentPage(1); }}>
            <SelectTrigger><SelectValue placeholder="Filter by Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(c => <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
           <Button onClick={() => refetchGames()} variant="outline" className="w-full md:w-auto flex items-center gap-2" title="Refresh Games List">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>

      {(isLoadingGames || isLoadingProviders || isLoadingCategories) && gamesList.length === 0 && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Categories</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>RTP</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {gamesList.map((game) => (
              <TableRow key={game.id}>
                <TableCell className="font-medium">{game.title}</TableCell>
                <TableCell>{providers.find(p => p.slug === game.provider_slug)?.name || game.provider_slug}</TableCell>
                <TableCell className="text-xs">
                  {game.category_slugs?.map(slug => categories.find(c=>c.slug === slug)?.name || slug).join(', ') || 'N/A'}
                </TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => toggleGameStatus(game)}
                    title={`Click to toggle status. Current: ${game.status}`}
                    className="flex items-center gap-1"
                  >
                    {game.status === GameStatusEnum.ACTIVE ? <Eye className="h-4 w-4 text-green-500"/> : <EyeOff className="h-4 w-4 text-red-500"/>}
                    <span className={`capitalize ${game.status === GameStatusEnum.ACTIVE ? 'text-green-600' : 'text-red-600'}`}>
                      {game.status}
                    </span>
                  </Button>
                </TableCell>
                <TableCell>{game.rtp ? `${game.rtp}%` : 'N/A'}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="icon" onClick={() => handleEditGame(gamesData?.games.find(g => g.id === game.id)!)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDeleteGame(gamesData?.games.find(g => g.id === game.id)!)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {!isLoadingGames && gamesList.length === 0 && (
         <p className="text-center text-muted-foreground py-6">No games found matching your criteria.</p>
       )}

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center items-center space-x-2">
          <Button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1 || isLoadingGames}
            variant="outline"
          >
            Previous
          </Button>
          <span>Page {currentPage} of {totalPages}</span>
          <Button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages || isLoadingGames}
            variant="outline"
          >
            Next
          </Button>
        </div>
      )}

      {showFormModal && (
        <Dialog open={showFormModal} onOpenChange={setShowFormModal}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{editingGame ? 'Edit Game' : 'Add New Game'}</DialogTitle>
            </DialogHeader>
            <GameForm
              game={editingGame}
              onSubmitSuccess={handleFormSubmitSuccess}
              onCancel={() => setShowFormModal(false)}
              providers={providers}
              categories={categories}
              isLoading={isLoadingGames} // Or a specific form submission loading state
            />
          </DialogContent>
        </Dialog>
      )}

      {showConfirmDeleteModal && gameToDelete && (
        <ConfirmationDialog
          isOpen={showConfirmDeleteModal}
          onClose={() => setShowConfirmDeleteModal(false)}
          onConfirm={confirmDeleteGame}
          title="Confirm Deletion"
          description={`Are you sure you want to delete the game "${gameToDelete.title}"? This action cannot be undone.`}
          confirmText="Delete"
          confirmVariant="destructive"
        />
      )}
    </div>
  );
};

export default AdminGamesPage;
