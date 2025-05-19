import React, { useState, useEffect, useMemo } from "react";
import { 
  Search, Plus, Filter, Edit, Trash2, ChevronLeft, ChevronRight, Eye, Gamepad2, BarChart2, Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Game, DbGame } from "@/types";
import { useNavigate } from "react-router-dom";
import GameForm from "@/components/admin/GameForm";
import { useGames } from "@/hooks/useGames";
import { gameService } from "@/services/gameService";
import { toast } from "sonner";

const AdminGames = () => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedGameForEdit, setSelectedGameForEdit] = useState<Partial<Game> | null>(null);
  const gamesPerPage = 10;
  const navigate = useNavigate();
  
  const { 
    games: allGames,
    isLoading: loading, 
    providers,
    categories,
    fetchGames
  } = useGames();
  
  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const localFilteredGames = useMemo(() => {
    if (!searchQuery) return allGames;
    const lowerSearchQuery = searchQuery.toLowerCase();
    return allGames.filter(game =>
        game.title.toLowerCase().includes(lowerSearchQuery) ||
        (game.provider_slug && game.provider_slug.toLowerCase().includes(lowerSearchQuery)) ||
        (game.providerName && game.providerName.toLowerCase().includes(lowerSearchQuery)) ||
        game.id.toLowerCase().includes(lowerSearchQuery)
    );
  }, [allGames, searchQuery]);
  
  const getProviderName = (providerSlug: string | undefined): string => {
    if (!providerSlug) return 'Unknown';
    const providerDetail = providers.find(p => typeof p === 'object' ? (p as any).slug === providerSlug : p === providerSlug);
    return typeof providerDetail === 'object' ? (providerDetail as any).name : providerDetail || providerSlug;
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); 
  };
  
  const handleSelectRow = (gameId: string) => {
    setSelectedRows(prevSelectedRows =>
      prevSelectedRows.includes(gameId)
        ? prevSelectedRows.filter(id => id !== gameId)
        : [...prevSelectedRows, gameId]
    );
  };
  
  const handleSelectAll = () => {
    if (currentGames.length > 0 && selectedRows.length === currentGames.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(currentGames.map(game => game.id));
    }
  };
  
  const handleViewGame = (gameSlugOrId: string) => {
    navigate(`/casino/game/${gameSlugOrId}`);
  };

  const handleEditGame = (game: Game) => { 
    setSelectedGameForEdit(game);
    setIsEditDialogOpen(true);
  };
  
  const handleDeleteGame = async (gameId: string) => {
    if (window.confirm("Are you sure you want to delete this game?")) {
      try {
        await gameService.deleteGame(gameId);
        toast.success('Game deleted successfully!');
        fetchGames();
        setSelectedRows(prev => prev.filter(id => id !== gameId));
      } catch (error: any) {
        toast.error(`Failed to delete game: ${error.message}`);
      }
    }
  };
  
  const handleFormSubmit = async (values: Partial<Game>, id?: string) => {
    try {
      const gameDataPayload: Game = {
        ...values,
        id: values.id || (id || ''),
        title: values.title || '',
      } as Game;


      if (isAddDialogOpen) {
        await gameService.createGame(gameDataPayload);
        toast.success('Game created successfully!');
        setIsAddDialogOpen(false);
      } else if (isEditDialogOpen && (id || selectedGameForEdit?.id)) {
        await gameService.updateGame(id || String(selectedGameForEdit!.id), gameDataPayload);
        toast.success('Game updated successfully!');
        setIsEditDialogOpen(false);
      }
      fetchGames(); 
      setSelectedGameForEdit(null); 
    } catch (error: any) {
      toast.error(`Failed to save game: ${error.message}`);
    }
  };

  const indexOfLastGame = currentPage * gamesPerPage;
  const indexOfFirstGame = indexOfLastGame - gamesPerPage;
  const currentGames = localFilteredGames.slice(indexOfFirstGame, indexOfLastGame);
  const totalPages = Math.ceil(localFilteredGames.length / gamesPerPage);

  const ensureNumber = (value: string | number | undefined): number | undefined => {
    if (value === undefined) return undefined;
    const num = Number(value);
    return isNaN(num) ? undefined : num;
  };

  const prepareGameForForm = (game: Game | Partial<Game> | null): Partial<DbGame> | null => {
    if (!game) return null;
    return {
        id: game.id,
        title: game.title,
        slug: game.slug,
        provider_slug: game.provider_slug || game.provider,
        category_slugs: Array.isArray(game.category_slugs) ? game.category_slugs : (typeof game.category_slugs === 'string' ? [game.category_slugs] : undefined),
        rtp: ensureNumber(game.rtp),
        status: game.status as DbGame['status'] || 'active',
        description: game.description,
        cover: game.image,
        banner: game.banner,
        is_popular: game.isPopular,
        is_new: game.isNew,
        is_featured: game.is_featured,
        show_home: game.show_home,
        tags: game.tags,
        features: game.features,
        themes: game.themes,
        volatility: game.volatility,
        lines: typeof game.lines === 'string' ? parseInt(game.lines) : game.lines,
        min_bet: ensureNumber(game.minBet),
        max_bet: ensureNumber(game.maxBet),
        release_date: game.release_date,
        game_id: game.game_id,
        game_code: game.game_code,
    };
  };
  
  const gameFormInitialData = selectedGameForEdit ? prepareGameForForm(selectedGameForEdit) : null;


  return (
    <div className="py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Game Management Overview</h1>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={(isOpen) => {
            setIsAddDialogOpen(isOpen);
            if (!isOpen) setSelectedGameForEdit(null); 
          }}>
            <DialogTrigger asChild>
              <Button className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black" onClick={() => { setSelectedGameForEdit(null); setIsAddDialogOpen(true); }}>
                <Plus className="mr-2 h-4 w-4" />
                Add Game
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Game</DialogTitle>
              </DialogHeader>
              <GameForm 
                onSubmit={handleFormSubmit} 
                game={null}
                onCancel={() => setIsAddDialogOpen(false)}
                isEditing={false}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="thunder-card p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-white/60 text-sm">Total Games</p>
              <h3 className="text-2xl font-bold">{allGames.length}</h3>
            </div>
            <div className="bg-white/10 p-3 rounded-full">
              <Gamepad2 className="h-6 w-6 text-casino-thunder-green" />
            </div>
          </div>
        </div>
        <div className="thunder-card p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-white/60 text-sm">Popular Games</p>
              <h3 className="text-2xl font-bold">{allGames.filter(game => game.isPopular).length}</h3>
            </div>
            <div className="bg-white/10 p-3 rounded-full">
              <BarChart2 className="h-6 w-6 text-yellow-500" />
            </div>
          </div>
        </div>
        
        <div className="thunder-card p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-white/60 text-sm">New Games</p>
              <h3 className="text-2xl font-bold">{allGames.filter(game => game.isNew).length}</h3>
            </div>
            <div className="bg-white/10 p-3 rounded-full">
              <Plus className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="search"
            className="thunder-input w-full pl-10"
            placeholder="Search games by title, provider, or ID..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>
      
      <div className="thunder-card overflow-hidden">
        {loading && currentGames.length === 0 ? ( 
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-casino-thunder-green" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-casino-thunder-green rounded"
                        checked={currentGames.length > 0 && selectedRows.length === currentGames.length}
                        onChange={handleSelectAll}
                        disabled={currentGames.length === 0}
                      />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Game
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Provider
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Categories
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    RTP
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {currentGames.map((game) => (
                  <tr key={game.id} className="hover:bg-white/5">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-casino-thunder-green rounded"
                        checked={selectedRows.includes(game.id)}
                        onChange={() => handleSelectRow(game.id)}
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img src={game.image || '/placeholder.svg'} alt={game.title} className="h-10 w-10 rounded-md object-cover mr-3" />
                        <div>
                          <div className="text-sm font-medium text-white">{game.title}</div>
                          <div className="text-xs text-white/60">ID: {game.id.substring(0,8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-white/80">{game.providerName || getProviderName(game.provider_slug || game.provider)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-white/80">
                      {game.categoryName || (Array.isArray(game.category_slugs) ? game.category_slugs.join(', ') : game.category)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-white/80">{game.rtp ? `${typeof game.rtp === 'number' ? game.rtp.toFixed(2) : game.rtp}%` : "N/A"}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        game.status === 'active' ? 'bg-green-500/20 text-green-300' : 
                        game.status === 'inactive' ? 'bg-red-500/20 text-red-300' :
                        game.status === 'maintenance' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-gray-500/20 text-gray-300'
                      }`}>
                        {game.status || 'unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <Button variant="ghost" size="icon" onClick={() => handleViewGame(game.slug || game.id)} className="hover:text-casino-thunder-green">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Dialog 
                        open={isEditDialogOpen && selectedGameForEdit?.id === game.id} 
                        onOpenChange={(isOpen) => {
                            setIsEditDialogOpen(isOpen);
                            if(!isOpen) setSelectedGameForEdit(null);
                        }}
                      >
                        <DialogTrigger asChild>
                           <Button variant="ghost" size="icon" onClick={() => handleEditGame(game)} className="hover:text-blue-400">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Edit Game: {selectedGameForEdit?.title}</DialogTitle>
                          </DialogHeader>
                           <GameForm 
                            onSubmit={handleFormSubmit} 
                            game={gameFormInitialData}
                            onCancel={() => {
                              setIsEditDialogOpen(false);
                              setSelectedGameForEdit(null);
                            }}
                            isEditing={true}
                          />
                        </DialogContent>
                      </Dialog>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteGame(game.id)} className="hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {totalPages > 1 && (
        <div className="mt-6 flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-white/60">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdminGames;
