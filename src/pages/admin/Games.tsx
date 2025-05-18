import React, { useState, useEffect } from "react";
import { 
  Search, 
  Plus, 
  Filter, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  Gamepad2,
  BarChart2,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Game, DbGame, GameProvider, GameCategory } from "@/types"; // Use DbGame for form interactions
// import { useToast } from "@/components/ui/use-toast"; // toast is provided by sonner via useGames
import { useNavigate } from "react-router-dom";
import GameForm from "@/components/admin/GameForm";
import { useGames } from "@/hooks/useGames";
// import { z } from "zod"; // For form data type if needed

const AdminGames = () => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedGameForEdit, setSelectedGameForEdit] = useState<Partial<DbGame> | undefined>(undefined);
  const gamesPerPage = 10;
  const navigate = useNavigate();
  
  const { 
    games, 
    filteredGames: contextFilteredGames, 
    loading, // This is isLoading from context
    providers,
    categories,
    addGame, 
    updateGame, 
    deleteGame,
    filterGames: contextFilterGames 
  } = useGames();
  
  useEffect(() => {
    contextFilterGames(searchQuery);
  }, [searchQuery, contextFilterGames]);

  const localFilteredGames = contextFilteredGames;

  const getProviderName = (providerSlug: string | undefined): string => {
    if (!providerSlug) return 'Unknown';
    const provider = providers.find(p => p.slug === providerSlug);
    return provider?.name || providerSlug;
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); 
  };
  
  const handleSelectRow = (gameId: string) => {
    if (selectedRows.includes(gameId)) {
      setSelectedRows(selectedRows.filter(id => id !== gameId));
    } else {
      setSelectedRows([...selectedRows, gameId]);
    }
  };
  
  const handleSelectAll = () => {
    if (selectedRows.length === currentGames.length && currentGames.length > 0) {
      setSelectedRows([]);
    } else {
      setSelectedRows(currentGames.map(game => game.id));
    }
  };
  
  const handleViewGame = (gameId: string) => {
    navigate(`/casino/game/${gameId}`);
  };
  
  const handleEditGame = (game: Game) => { 
    const gameToEdit: Partial<DbGame> = {
        ...game, 
        provider_slug: game.provider_slug || game.provider,
        title: game.title, 
        image_url: game.image,
        category_ids: Array.isArray(game.category_slugs) ? game.category_slugs : (typeof game.category_slugs === 'string' ? [game.category_slugs] : undefined), // GameForm might expect category_ids
    };
    setSelectedGameForEdit(gameToEdit);
    setIsEditDialogOpen(true);
  };
  
  const handleDeleteGame = async (gameId: string) => {
    if (window.confirm("Are you sure you want to delete this game?")) {
      const success = await deleteGame(gameId);
      if (success) {
        setSelectedRows(selectedRows.filter(id => id !== gameId));
      }
    }
  };
  
  const handleFormSubmit = async (values: Partial<DbGame>) => {
    if (isAddDialogOpen) {
      await addGame(values);
      setIsAddDialogOpen(false);
    } else if (isEditDialogOpen && selectedGameForEdit?.id) {
      await updateGame(selectedGameForEdit.id, values);
      setIsEditDialogOpen(false);
    }
    setSelectedGameForEdit(undefined);
  };

  const indexOfLastGame = currentPage * gamesPerPage;
  const indexOfFirstGame = indexOfLastGame - gamesPerPage;
  const currentGames = localFilteredGames.slice(indexOfFirstGame, indexOfLastGame);
  const totalPages = Math.ceil(localFilteredGames.length / gamesPerPage);

  return (
    <div className="py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Game Management</h1>
        
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={(isOpen) => {
            setIsAddDialogOpen(isOpen);
            if (!isOpen) setSelectedGameForEdit(undefined); 
          }}>
            <DialogTrigger asChild>
              <Button className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black" onClick={() => setSelectedGameForEdit(undefined)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Game
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Game</DialogTitle>
              </DialogHeader>
              <GameForm 
                onSubmit={handleFormSubmit} 
                providers={providers} 
                categories={categories} 
                // loading prop removed as it's not accepted by GameForm
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Game Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="thunder-card p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-white/60 text-sm">Total Games</p>
              <h3 className="text-2xl font-bold">{games.length}</h3>
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
              <h3 className="text-2xl font-bold">{games.filter(game => game.isPopular).length}</h3>
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
              <h3 className="text-2xl font-bold">{games.filter(game => game.isNew).length}</h3>
            </div>
            <div className="bg-white/10 p-3 rounded-full">
              <Plus className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Search Bar */}
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
      
      {/* Games Table */}
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
                        checked={selectedRows.length === currentGames.length && currentGames.length > 0}
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
                        <div className="flex-shrink-0 h-10 w-10 rounded overflow-hidden bg-white/10">
                          <img src={game.image || '/placeholder.svg'} alt={game.title} className="h-10 w-10 object-cover" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium">{game.title}</div>
                          <div className="text-xs text-white/60">ID: {game.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      {getProviderName(game.provider_slug || game.provider)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm capitalize">
                      {(Array.isArray(game.category_slugs) ? game.category_slugs.join(', ') : game.category_slugs) || game.category || 'N/A'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">{game.rtp ? `${game.rtp}%` : 'N/A'}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        game.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : game.status === 'inactive'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {game.status || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleViewGame(game.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleEditGame(game)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-500"
                          onClick={() => handleDeleteGame(game.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        <div className="px-4 py-3 flex items-center justify-between border-t border-white/10">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || totalPages === 0}
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-white/60">
                Showing <span className="font-medium">{localFilteredGames.length > 0 ? indexOfFirstGame + 1 : 0}</span> to{' '}
                <span className="font-medium">
                  {Math.min(indexOfLastGame, localFilteredGames.length)}
                </span>{' '}
                of <span className="font-medium">{localFilteredGames.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-l-md"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1 || totalPages === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  if (pageNum > totalPages || pageNum < 1) return null; 
                  
                  return (
                    <Button 
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"} 
                      className={currentPage === pageNum ? "bg-white/10" : ""}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-r-md"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </nav>
            </div>
          </div>
        </div>
      </div>
      
      {/* Edit Game Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(isOpen) => {
        setIsEditDialogOpen(isOpen);
        if (!isOpen) setSelectedGameForEdit(undefined); 
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Game</DialogTitle>
          </DialogHeader>
          {selectedGameForEdit && ( 
            <GameForm 
              onSubmit={handleFormSubmit} 
              initialData={selectedGameForEdit} // Changed from initialValues
              providers={providers}
              categories={categories}
              // loading prop removed
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminGames;
