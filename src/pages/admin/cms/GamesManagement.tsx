import { useState, useEffect } from "react";
import { 
  Search, Plus, Filter, Edit, Trash2, ChevronLeft, ChevronRight, Eye, Gamepad2, BarChart2, Loader2, Play 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Game, GameProvider, GameCategory } from "@/types"; // Ensure GameProvider and GameCategory are imported
import { useToast } from "@/components/ui/use-toast"; // Corrected path for useToast
import { useNavigate } from "react-router-dom";
import GameForm from "@/components/admin/GameForm"; // GameForm.tsx will need updates for props
import { useGames } from "@/hooks/useGames"; // Ensure useGames provides categories and providers
import { 
  // saveGameAdapter, // These adapters likely need updates or to use context methods
  // updateGameAdapter, 
  // deleteGameAdapter, 
  // toggleGameFeatureAdapter 
} from "@/utils/cmsGamesAdapter"; // This file might be deprecated if useGames handles CRUD
import { DataTable } from "@/components/ui/data-table";

const GamesManagement = () => {
  // ... keep existing code (state declarations: selectedRows, searchQuery, etc.)
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentFilteredGames, setCurrentFilteredGames] = useState<Game[]>([]); // Renamed to avoid conflict with context
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const gamesPerPage = 10;
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const { 
    games: allGamesFromContext, // Renamed to avoid conflict
    filteredGames: contextFilteredGames, // Games filtered by useGames hook
    loading, 
    // totalGames, // This might come from allGamesFromContext.length or a specific context value
    launchGame,
    addGame, // From useGames
    updateGame, // From useGames
    deleteGame, // From useGames
    providers, // From useGames for GameForm
    categories, // From useGames for GameForm
    fetchGamesAndProviders, // To refresh list
  } = useGames();
  
  // ... keep existing code (getProviderName helper)

  const getProviderName = (provider: string | { name?: string } | undefined): string => {
    if (!provider) return 'Unknown';
    if (typeof provider === 'string') return provider;
    return provider.name || 'Unknown';
  };

  useEffect(() => {
    // Use games from context, apply local search on top or use context's filter
    let gamesToFilter = searchQuery ? allGamesFromContext : contextFilteredGames;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      gamesToFilter = allGamesFromContext.filter(game => 
        (game.title?.toLowerCase().includes(query) || '') || 
        (getProviderName(game.provider).toLowerCase().includes(query)) ||
        (game.id && String(game.id).toLowerCase().includes(query))
      );
    }
    setCurrentFilteredGames(gamesToFilter);
    // If using context's filterGames:
    // filterGames(searchQuery, selectedCategorySlug, selectedProviderSlug);
  }, [allGamesFromContext, contextFilteredGames, searchQuery]); // Add filterGames, selectedCategorySlug etc. if using context filter

  // ... keep existing code (handleSearch, handleSelectRow, handleSelectAll, handleViewGame functions)
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    // if (query) {
    //   const results = games.filter(game => 
    //     (game.title?.toLowerCase().includes(query) || '') || 
    //     getProviderName(game.provider).toLowerCase().includes(query) ||
    //     (game.id?.includes(query) || '')
    //   );
    //   setFilteredGames(results);
    // } else {
    //   setFilteredGames(games);
    // }
    
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
    if (selectedRows.length === currentGamesForTable.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(currentGamesForTable.map(game => game.id));
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
      if (!deleteGame) {
        toast({ title: "Error", description: "Delete function not available.", variant: "destructive" });
        return;
      }
      try {
        const success = await deleteGame(gameId); // Using context deleteGame
        if (success) {
          //setSelectedRows(selectedRows.filter(id => id !== gameId)); // if using local selection
          toast({ title: "Success", description: "Game deleted successfully" });
          // fetchGamesAndProviders(); // Already called within useGames.deleteGame
        } else {
          toast({ title: "Error", description: "Failed to delete game", variant: "destructive" });
        }
      } catch (error) {
        console.error("Failed to delete game:", error);
        toast({ title: "Error", description: "Failed to delete game", variant: "destructive" });
      }
    }
  };
  
  const handleAddGame = async (gameData: Omit<Game, 'id'>) => { // GameForm usually provides data without ID for new games
    if (!addGame) {
      toast({ title: "Error", description: "Add game function not available.", variant: "destructive" });
      return;
    }
    try {
      // The addGame from context expects Partial<DbGame>. Need an adapter or ensure GameForm produces this.
      // For now, assuming GameForm produces data compatible with Partial<DbGame> or casting.
      const result = await addGame(gameData as any); // Adapter needed here if types differ significantly
      if (result) {
        setIsAddDialogOpen(false);
        toast({ title: "Success", description: "Game added successfully" });
        // fetchGamesAndProviders(); // Already called within useGames.addGame
      } else {
         toast({ title: "Error", description: "Failed to add game", variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to add game:", error);
      toast({ title: "Error", description: "Failed to add game", variant: "destructive" });
    }
  };
  
  const handleUpdateGame = async (gameData: Game) => { // GameForm provides full Game object for updates
     if (!updateGame || !gameData.id) {
      toast({ title: "Error", description: "Update game function or game ID not available.", variant: "destructive" });
      return;
    }
    try {
      // updateGame from context expects (gameId, Partial<DbGame>). Adapter needed.
      // For now, assuming GameForm produces data compatible or casting.
      const { id, ...updateData } = gameData;
      const result = await updateGame(id, updateData as any); // Adapter needed
      if (result) {
        setIsEditDialogOpen(false);
        toast({ title: "Success", description: "Game updated successfully" });
        // fetchGamesAndProviders(); // Already called within useGames.updateGame
      } else {
        toast({ title: "Error", description: "Failed to update game", variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to update game:", error);
      toast({ title: "Error", description: "Failed to update game", variant: "destructive" });
    }
  };

  // Pagination with currentFilteredGames
  const indexOfLastGame = currentPage * gamesPerPage;
  const indexOfFirstGame = indexOfLastGame - gamesPerPage;
  const currentGamesForTable = currentFilteredGames.slice(indexOfFirstGame, indexOfLastGame);
  const totalPages = Math.ceil(currentFilteredGames.length / gamesPerPage);
  
  // ... keep existing code (columns definition, but ensure game.id access is safe, e.g. game.id!)
  // Ensure cell functions in `columns` use `game: Game` correctly. For game.id in handleDeleteGame, it should be string.
    const columns = [
    {
      header: "Game",
      accessorKey: "title",
      cell: ({ row }: { row: { original: Game } }) => {
        const game = row.original;
        return (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 rounded overflow-hidden bg-white/10">
            <img src={game.image || '/placeholder.svg'} alt={game.title || 'Game image'} className="h-10 w-10 object-cover" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium">{game.title}</div>
            <div className="text-xs text-white/60">ID: {game.id}</div>
          </div>
        </div>
      )},
    },
    {
      header: "Provider",
      accessorKey: "provider",
      cell: ({ row }: { row: { original: Game } }) => getProviderName(row.original.provider)
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: ({ row }: { row: { original: Game } }) => {
        const game = row.original;
        return (
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => navigate(`/casino/game/${game.id}`)} // Ensure game.id is string
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
            onClick={async () => { // Make onClick async for launchGame
                const url = await launchGame(game, { mode: "demo" });
                if (url) window.open(url, '_blank');
            }}
          >
            <Play className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-red-500"
            onClick={() => handleDeleteGame(String(game.id))} // Ensure game.id is string
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    }
  ];


  return (
    <div className="py-8 px-4">
      {/* ... keep existing code (Header JSX: title, buttons) ... */}
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
              {/* Pass providers and categories to GameForm */}
              <GameForm 
                onSubmit={handleAddGame} 
                providers={providers} 
                categories={categories} 
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Game Stats - ensure game properties like isPopular, isNew are correct based on Game type */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="thunder-card p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-white/60 text-sm">Total Games</p>
              <h3 className="text-2xl font-bold">{allGamesFromContext.length}</h3>
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
              <h3 className="text-2xl font-bold">{allGamesFromContext.filter(game => game.isPopular).length}</h3>
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
              <h3 className="text-2xl font-bold">{allGamesFromContext.filter(game => game.isNew).length}</h3>
            </div>
            <div className="bg-white/10 p-3 rounded-full">
              <Plus className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </div>
      </div>
      
      {/* ... keep existing code (Search Bar JSX) ... */}
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
            onChange={handleSearch} // Simplified handleSearch
          />
        </div>
      </div>
      
      {/* Games Table */}
      <div className="thunder-card overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-casino-thunder-green" />
          </div>
        ) : (
          <DataTable 
            data={currentGamesForTable} // Use paginated games
            columns={columns}
            // selectedRows, onSelectRow, onSelectAll might be props for DataTable if it supports selection
          />
        )}
        
        {/* Pagination */}
        {/* Ensure pagination logic uses currentFilteredGames.length for totalPages and item counts */}
        <div className="px-4 py-3 flex items-center justify-between border-t border-white/10">
          {/* ... keep existing code (mobile pagination buttons) ... */}
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
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-white/60">
                Showing <span className="font-medium">{totalPages > 0 ? indexOfFirstGame + 1 : 0}</span> to{' '}
                <span className="font-medium">
                  {Math.min(indexOfLastGame, currentFilteredGames.length)}
                </span>{' '}
                of <span className="font-medium">{currentFilteredGames.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                 {/* ... pagination number buttons ... */}
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
                  
                  if (pageNum <= 0) return null; // Avoid rendering invalid page numbers

                  return (
                    <Button 
                      key={pageNum}
                      variant={currentPage === pageNum ? "secondary" : "outline" }
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
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Game</DialogTitle>
          </DialogHeader>
          {selectedGame && (
            <GameForm 
              onSubmit={handleUpdateGame} 
              initialData={selectedGame} // Ensure GameForm accepts initialData
              providers={providers} 
              categories={categories}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GamesManagement;
