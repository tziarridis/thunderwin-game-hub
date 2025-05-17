import React, { useState, useEffect, useCallback } from 'react';
import { Game, GameProvider, GameCategory, DbGame } from '@/types'; // Ensure DbGame is imported
import { useGames } from '@/hooks/useGames';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Edit, Trash2, Search, Filter, ArrowUpDown } from 'lucide-react';
import { toast } from 'sonner';
import GameForm from '@/components/admin/GameForm'; // Assuming GameForm is for DbGame or compatible
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
// import { gamesDatabaseService } from '@/services/gamesDatabaseService'; // Direct service calls not needed if useGames covers it

type SortableGameKeys = keyof Pick<Game, 'title' | 'providerName' | 'categoryName' | 'rtp' | 'status' | 'views' | 'release_date'>;


const GamesManagement = () => {
  const { 
    games: allGames, 
    providers, 
    categories, 
    isLoading: gamesLoading, 
    error: gamesError, 
    addGame, 
    updateGame, 
    deleteGame,
    fetchGamesAndProviders // To refresh list after CUD operations
  } = useGames();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<DbGame | null>(null); // GameForm might expect DbGame
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProvider, setFilterProvider] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  
  const [sortConfig, setSortConfig] = useState<{ key: SortableGameKeys | null; direction: 'ascending' | 'descending' }>({ key: 'title', direction: 'ascending' });

  // Map Game to DbGame for the form if GameForm expects DbGame
  // This is a simplified mapping, ensure it matches GameForm's needs
  const mapGameToDbGameForForm = (game: Game): DbGame => {
    return {
      id: game.id,
      title: game.title,
      provider_slug: game.provider, // Assuming game.provider is slug
      category_slugs: game.category_slugs || (game.category ? [game.category] : []),
      description: game.description,
      rtp: game.rtp,
      cover: game.image, // Assuming game.image is cover
      status: game.status as DbGame['status'] || 'active',
      is_popular: game.isPopular,
      is_new: game.isNew,
      is_featured: game.is_featured,
      show_home: game.show_home,
      slug: game.slug,
      // Add other fields as necessary for DbGame / GameForm
    };
  };
  
  const mapDbGameDataToGameForDisplay = (dbGame: DbGame): Game => {
    const providerDetails = providers.find(p => p.slug === dbGame.provider_slug);
    
    // Handle category_slugs which might be a string or string[]
    let categorySlugsArray: string[] = [];
    if (typeof dbGame.category_slugs === 'string') {
        categorySlugsArray = dbGame.category_slugs.split(',').map(s => s.trim()).filter(Boolean);
    } else if (Array.isArray(dbGame.category_slugs)) {
        categorySlugsArray = dbGame.category_slugs.filter(s => typeof s === 'string');
    }
    const mainCategorySlug = categorySlugsArray[0];
    const categoryDetails = categories.find(c => c.slug === mainCategorySlug);

    return {
        id: dbGame.id,
        title: dbGame.title,
        provider: dbGame.provider_slug || 'N/A',
        providerName: providerDetails?.name || dbGame.provider_slug || 'N/A',
        category: mainCategorySlug || 'N/A',
        categoryName: categoryDetails?.name || mainCategorySlug || 'N/A',
        category_slugs: categorySlugsArray,
        image: dbGame.cover || dbGame.image_url || '/placeholder.svg',
        description: dbGame.description,
        rtp: dbGame.rtp,
        volatility: dbGame.volatility,
        minBet: dbGame.min_bet,
        maxBet: dbGame.max_bet,
        isFavorite: false, // This would typically come from user-specific data
        isNew: !!dbGame.is_new,
        isPopular: !!dbGame.is_popular,
        is_featured: !!dbGame.is_featured,
        show_home: !!dbGame.show_home,
        status: dbGame.status || 'active',
        slug: dbGame.slug,
        views: dbGame.views,
        release_date: dbGame.release_date,
        created_at: dbGame.created_at,
        updated_at: dbGame.updated_at,
    };
  }


  const handleAddNewGame = () => {
    setEditingGame(null); // For creating a new game
    setIsFormOpen(true);
  };

  const handleEditGame = (game: Game) => {
    // Assuming GameForm expects DbGame structure or a subset of it
    // You might need a more sophisticated mapping if GameForm expects full DbGame
    const dbGameForForm = mapGameToDbGameForForm(game);
    setEditingGame(dbGameForForm);
    setIsFormOpen(true);
  };

  const handleDeleteGame = async (gameId: string) => {
    if (!window.confirm('Are you sure you want to delete this game?')) return;
    const success = await deleteGame(gameId);
    if (success) {
      toast.success('Game deleted successfully');
      // The useGames hook should refresh the list, or call fetchGamesAndProviders()
    } else {
      toast.error('Failed to delete game');
    }
  };

  const handleSubmitGameForm = async (gameData: Partial<DbGame>) => { // GameForm will submit DbGame data
    try {
      let success = false;
      if (editingGame && editingGame.id) {
        const result = await updateGame(editingGame.id, gameData);
        if (result) success = true;
      } else {
        const result = await addGame(gameData);
        if (result) success = true;
      }

      if (success) {
        toast.success(`Game ${editingGame ? 'updated' : 'added'} successfully`);
        setIsFormOpen(false);
        setEditingGame(null);
        // The useGames hook should refresh the list, or call fetchGamesAndProviders()
      } else {
        toast.error(`Failed to ${editingGame ? 'update' : 'add'} game`);
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message || 'Operation failed'}`);
    }
  };
  
  const requestSort = (key: SortableGameKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedAndFilteredGames = React.useMemo(() => {
    let filtered = [...allGames]; // allGames from useGames hook are already of type Game

    if (searchTerm) {
      filtered = filtered.filter(game =>
        game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (game.providerName && game.providerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (game.slug && game.slug.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    if (filterProvider) {
      filtered = filtered.filter(game => game.provider === filterProvider);
    }
    if (filterCategory) {
      filtered = filtered.filter(game => game.category_slugs?.includes(filterCategory) || game.category === filterCategory);
    }
    
    if (sortConfig.key) {
        filtered.sort((a, b) => {
            const valA = a[sortConfig.key!];
            const valB = b[sortConfig.key!];

            if (valA === undefined || valA === null) return sortConfig.direction === 'ascending' ? 1 : -1;
            if (valB === undefined || valB === null) return sortConfig.direction === 'ascending' ? -1 : 1;

            if (typeof valA === 'string' && typeof valB === 'string') {
                return sortConfig.direction === 'ascending' ? valA.localeCompare(valB) : valB.localeCompare(valA);
            }
            if (typeof valA === 'number' && typeof valB === 'number') {
                return sortConfig.direction === 'ascending' ? valA - valB : valB - valA;
            }
            // Fallback for boolean or other types (treat as string)
            const strA = String(valA).toLowerCase();
            const strB = String(valB).toLowerCase();
            return sortConfig.direction === 'ascending' ? strA.localeCompare(strB) : strB.localeCompare(strA);
        });
    }

    return filtered;
  }, [allGames, searchTerm, filterProvider, filterCategory, sortConfig, providers, categories]);


  if (gamesLoading && !allGames.length) {
    return <div className="p-6">Loading games data...</div>;
  }

  if (gamesError) {
    return <div className="p-6 text-red-500">Error loading games: {gamesError}</div>;
  }

  const getSortIndicator = (key: SortableGameKeys) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
    }
    return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50 group-hover:opacity-100 inline-block" />;
  };


  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
        <h1 className="text-2xl md:text-3xl font-bold">Games Management</h1>
        <Button onClick={handleAddNewGame} className="flex items-center whitespace-nowrap">
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Game
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-card rounded-lg border">
        <Input
          placeholder="Search games (title, provider, slug)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="md:col-span-1"
        />
        <Select value={filterProvider} onValueChange={setFilterProvider}>
          <SelectTrigger><SelectValue placeholder="Filter by provider" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Providers</SelectItem>
            {providers.map(p => <SelectItem key={p.id} value={p.slug}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger><SelectValue placeholder="Filter by category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            {categories.map(c => <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Games Table */}
      <div className="rounded-md border overflow-x-auto bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer group" onClick={() => requestSort('title')}>Title {getSortIndicator('title')}</TableHead>
              <TableHead className="cursor-pointer group" onClick={() => requestSort('providerName')}>Provider {getSortIndicator('providerName')}</TableHead>
              <TableHead className="cursor-pointer group" onClick={() => requestSort('categoryName')}>Category {getSortIndicator('categoryName')}</TableHead>
              <TableHead className="cursor-pointer group" onClick={() => requestSort('status')}>Status {getSortIndicator('status')}</TableHead>
              <TableHead className="cursor-pointer group text-right" onClick={() => requestSort('rtp')}>RTP (%) {getSortIndicator('rtp')}</TableHead>
              <TableHead className="cursor-pointer group text-right" onClick={() => requestSort('views')}>Views {getSortIndicator('views')}</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {gamesLoading && sortedAndFilteredGames.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center h-24">Loading games...</TableCell></TableRow>
            )}
            {!gamesLoading && sortedAndFilteredGames.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center h-24">No games found matching your criteria.</TableCell></TableRow>
            )}
            {sortedAndFilteredGames.map((game) => (
              <TableRow key={game.id}>
                <TableCell className="font-medium max-w-xs truncate" title={game.title}>
                  <img src={game.image || '/placeholder.svg'} alt={game.title} className="w-10 h-10 object-cover rounded-sm inline-block mr-2"/>
                  {game.title}
                </TableCell>
                <TableCell>{game.providerName || game.provider}</TableCell>
                <TableCell>{game.categoryName || game.category}</TableCell>
                <TableCell>
                   <span className={`px-2 py-0.5 text-xs rounded-full capitalize ${
                      game.status === 'active' ? 'bg-green-500/20 text-green-300' : 
                      game.status === 'inactive' ? 'bg-red-500/20 text-red-300' :
                      game.status === 'maintenance' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-gray-500/20 text-gray-300'
                    }`}>
                      {game.status || 'unknown'}
                    </span>
                </TableCell>
                <TableCell className="text-right">{game.rtp !== undefined ? `${game.rtp}%` : 'N/A'}</TableCell>
                <TableCell className="text-right">{game.views ?? 'N/A'}</TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  <Button variant="ghost" size="icon" onClick={() => handleEditGame(game)} className="mr-2 hover:text-blue-500">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteGame(game.id)} className="hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Game Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
        setIsFormOpen(isOpen);
        if (!isOpen) setEditingGame(null);
      }}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col bg-card">
          <DialogHeader>
            <DialogTitle>{editingGame ? 'Edit Game' : 'Add New Game'}</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto pr-2">
            <GameForm
              onSubmit={handleSubmitGameForm}
              initialGameData={editingGame} // Pass initialGameData (DbGame or null)
              providers={providers}
              categories={categories}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingGame(null);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GamesManagement;
