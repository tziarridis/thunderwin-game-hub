import { useState, useEffect } from "react";
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
  Loader2,
  Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Game } from "@/types"; // Import the UI Game type
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import GameForm from "@/components/admin/GameForm";
import { useGames } from "@/hooks/useGames";
import { 
  saveGameAdapter, 
  updateGameAdapter, 
  deleteGameAdapter, 
  toggleGameFeatureAdapter 
} from "@/utils/cmsGamesAdapter";
import { DataTable } from "@/components/ui/data-table";

const GamesManagement = () => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const gamesPerPage = 10;
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Use our custom hook for getting games data
  const { 
    games, 
    loading, 
    totalGames,
    launchGame
  } = useGames();
  
  // Helper function to get provider name
  const getProviderName = (provider: string | { name?: string } | undefined): string => {
    if (!provider) return 'Unknown';
    if (typeof provider === 'string') return provider;
    return provider.name || 'Unknown';
  };
  
  // Update filtered games when games change or search query changes
  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const results = games.filter(game => 
        (game.title?.toLowerCase().includes(query) || '') || 
        getProviderName(game.provider).toLowerCase().includes(query) ||
        (game.id?.includes(query) || '')
      );
      setFilteredGames(results);
    } else {
      setFilteredGames(games);
    }
  }, [games, searchQuery]);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    if (query) {
      const results = games.filter(game => 
        (game.title?.toLowerCase().includes(query) || '') || 
        getProviderName(game.provider).toLowerCase().includes(query) ||
        (game.id?.includes(query) || '')
      );
      setFilteredGames(results);
    } else {
      setFilteredGames(games);
    }
    
    setCurrentPage(1); // Reset to first page on new search
  };
  
  const handleSelectRow = (gameId: string) => {
    if (selectedRows.includes(gameId)) {
      setSelectedRows(selectedRows.filter(id => id !== gameId));
    } else {
      setSelectedRows([...selectedRows, gameId]);
    }
  };
  
  const handleSelectAll = () => {
    if (selectedRows.length === currentGames.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(currentGames.map(game => game.id));
    }
  };
  
  const handleViewGame = (gameId: string) => {
    navigate(`/casino/game/${gameId}`);
  };
  
  const handleEditGame = (game: Game) => {
    setSelectedGame(game);
    setIsEditDialogOpen(true);
  };
  
  const handleDeleteGame = async (gameId: string) => {
    if (window.confirm("Are you sure you want to delete this game?")) {
      try {
        await deleteGameAdapter(gameId);
        setSelectedRows(selectedRows.filter(id => id !== gameId));
        toast({
          title: "Success",
          description: "Game deleted successfully",
        });
      } catch (error) {
        console.error("Failed to delete game:", error);
        toast({
          title: "Error",
          description: "Failed to delete game",
          variant: "destructive",
        });
      }
    }
  };
  
  const handleAddGame = async (gameData: Game | Omit<Game, 'id'>) => {
    try {
      await saveGameAdapter(gameData);
      setIsAddDialogOpen(false);
      toast({
        title: "Success",
        description: "Game added successfully",
      });
    } catch (error) {
      console.error("Failed to add game:", error);
      toast({
        title: "Error",
        description: "Failed to add game",
        variant: "destructive",
      });
    }
  };
  
  const handleUpdateGame = async (gameData: Game | Omit<Game, 'id'>) => {
    try {
      if ('id' in gameData) {
        await updateGameAdapter(gameData);
        setIsEditDialogOpen(false);
        toast({
          title: "Success",
          description: "Game updated successfully",
        });
      }
    } catch (error) {
      console.error("Failed to update game:", error);
      toast({
        title: "Error",
        description: "Failed to update game",
        variant: "destructive",
      });
    }
  };

  // Calculate pagination
  const indexOfLastGame = currentPage * gamesPerPage;
  const indexOfFirstGame = indexOfLastGame - gamesPerPage;
  const currentGames = filteredGames.slice(indexOfFirstGame, indexOfLastGame);
  const totalPages = Math.ceil(filteredGames.length / gamesPerPage);
  
  // Table columns configuration
  const columns = [
    {
      header: "Game",
      accessorKey: "title",
      cell: (game: Game) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 rounded overflow-hidden bg-white/10">
            <img src={game.image} alt={game.title} className="h-10 w-10 object-cover" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium">{game.title}</div>
            <div className="text-xs text-white/60">ID: {game.id}</div>
          </div>
        </div>
      )
    },
    {
      header: "Provider",
      accessorKey: "provider",
      cell: (game: Game) => getProviderName(game.provider)
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (game: Game) => (
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => navigate(`/casino/game/${game.id}`)}
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
            className="h-8 w-8 text-green-500"
            onClick={() => launchGame(game, { mode: "demo" })}
          >
            <Play className="h-4 w-4" />
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
      )
    }
  ];

  return (
    <div className="py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Game Management</h1>
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/casino/seamless')}>
            <Play className="mr-2 h-4 w-4" />
            Seamless API
          </Button>
          <Button variant="outline" className="flex items-center">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black">
                <Plus className="mr-2 h-4 w-4" />
                Add Game
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Game</DialogTitle>
              </DialogHeader>
              <GameForm onSubmit={handleAddGame} />
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
      
      {/* Games Table - using DataTable component for better display */}
      <div className="thunder-card overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-casino-thunder-green" />
          </div>
        ) : (
          <DataTable 
            data={currentGames}
            columns={columns}
          />
        )}
        
        {/* Pagination */}
        <div className="px-4 py-3 flex items-center justify-between border-t border-white/10">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-white/60">
                Showing <span className="font-medium">{indexOfFirstGame + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(indexOfLastGame, filteredGames.length)}
                </span>{' '}
                of <span className="font-medium">{filteredGames.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-l-md"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Show pages around current page
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
                  
                  return (
                    <Button 
                      key={pageNum}
                      variant="outline" 
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
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </nav>
            </div>
          </div>
        </div>
      </div>
      
      {/* Edit Game Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Game</DialogTitle>
          </DialogHeader>
          {selectedGame && (
            <GameForm 
              onSubmit={handleUpdateGame} 
              initialData={selectedGame}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GamesManagement;
