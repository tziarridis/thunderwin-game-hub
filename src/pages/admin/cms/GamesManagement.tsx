import { useState, useEffect, ReactNode } from "react"; // Added ReactNode
import { 
  Search, Plus, Filter, Edit, Trash2, ChevronLeft, ChevronRight, Eye, Gamepad2, BarChart2, Loader2, Play 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Game, GameProvider, GameCategory, DbGame } from "@/types"; // Ensure GameProvider and GameCategory are imported
import { useToast } from "@/hooks/use-toast"; // Corrected path
import { useNavigate } from "react-router-dom";
import GameForm, { GameFormProps } from "@/components/admin/GameForm"; // GameForm.tsx will need updates for props
import { useGames } from "@/hooks/useGames"; 
import { DataTable } from "@/components/ui/data-table"; // Corrected import

// Define column type matching DataTable expectation
interface ColumnDef<TData> {
  header: string;
  accessorKey: keyof TData | 'actions'; // 'actions' is a common convention for a non-data key
  cell?: (data: TData) => ReactNode; // Expects the data item directly
}


const GamesManagement = () => {
  // state declarations: selectedRows, searchQuery, etc.
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentFilteredGames, setCurrentFilteredGames] = useState<Game[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const gamesPerPage = 10;
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const { 
    games: allGamesFromContext, 
    filteredGames: contextFilteredGames, 
    loading, 
    launchGame,
    addGame, 
    updateGame, 
    deleteGame, 
    providers, 
    categories, 
    fetchGamesAndProviders,
  } = useGames();
  
  const getProviderName = (providerSlug: string | undefined): string => {
    if (!providerSlug) return 'Unknown';
    const provider = providers.find(p => p.slug === providerSlug || p.name === providerSlug); // Check by slug or name
    return provider?.name || providerSlug; // Fallback to slug if name not found
  };

  useEffect(() => {
    let gamesToFilter = allGamesFromContext; // Start with all games from context
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      gamesToFilter = allGamesFromContext.filter(game => 
        (game.title?.toLowerCase().includes(query) || '') || 
        (getProviderName(game.provider_slug || game.provider).toLowerCase().includes(query)) || // Use provider_slug or provider
        (game.id && String(game.id).toLowerCase().includes(query))
      );
    } else {
      // If no search query, use contextFilteredGames if it's actively managed by context filters
      // Or stick to allGames if contextFilteredGames isn't reflecting other active filters.
      // For simplicity now, if no search, show all context games if specific filters are applied in context, else all.
      // This depends on how filterGames in useGames interacts.
      // Assuming contextFilteredGames is the base when no local search is active.
      gamesToFilter = contextFilteredGames.length > 0 ? contextFilteredGames : allGamesFromContext;
    }
    setCurrentFilteredGames(gamesToFilter);
  }, [allGamesFromContext, contextFilteredGames, searchQuery, providers]);

  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value; // Keep case for now, convert toLowerCase inside useEffect filter
    setSearchQuery(query);
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
    if (selectedRows.length === currentGamesForTable.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(currentGamesForTable.map(game => game.id));
    }
  };
  
  const handleViewGame = (gameId: string) => {
    navigate(`/casino/game/${gameId}`); // Changed to game slug or ID, assuming game.id is slug or unique
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
        const success = await deleteGame(gameId); 
        if (success) {
          toast({ title: "Success", description: "Game deleted successfully" });
        } else {
          toast({ title: "Error", description: "Failed to delete game", variant: "destructive" });
        }
      } catch (error) {
        console.error("Failed to delete game:", error);
        toast({ title: "Error", description: "Failed to delete game", variant: "destructive" });
      }
    }
  };
  
  const handleAddGame = async (gameData: Partial<DbGame>) => { 
    if (!addGame) {
      toast({ title: "Error", description: "Add game function not available.", variant: "destructive" });
      return;
    }
    try {
      const result = await addGame(gameData); 
      if (result) {
        setIsAddDialogOpen(false);
        toast({ title: "Success", description: "Game added successfully" });
      } else {
         toast({ title: "Error", description: "Failed to add game", variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to add game:", error);
      toast({ title: "Error", description: "Failed to add game", variant: "destructive" });
    }
  };
  
  const handleUpdateGame = async (gameData: Game) => { 
     if (!updateGame || !gameData.id) {
      toast({ title: "Error", description: "Update game function or game ID not available.", variant: "destructive" });
      return;
    }
    try {
      const { id, ...updateData } = gameData;
      // Map Game to Partial<DbGame> - GameForm should ideally submit DbGame compatible structure for updates
      const dbGameUpdateData: Partial<DbGame> = {
        ...updateData,
        title: updateData.title,
        provider_slug: updateData.provider_slug || updateData.provider,
        category_slugs: updateData.category_slugs || [],
        image_url: updateData.image,
        is_popular: updateData.isPopular,
        is_new: updateData.isNew,
        // map other fields as necessary
      };

      const result = await updateGame(id, dbGameUpdateData); 
      if (result) {
        setIsEditDialogOpen(false);
        toast({ title: "Success", description: "Game updated successfully" });
      } else {
        toast({ title: "Error", description: "Failed to update game", variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to update game:", error);
      toast({ title: "Error", description: "Failed to update game", variant: "destructive" });
    }
  };

  const indexOfLastGame = currentPage * gamesPerPage;
  const indexOfFirstGame = indexOfLastGame - gamesPerPage;
  const currentGamesForTable = currentFilteredGames.slice(indexOfFirstGame, indexOfLastGame);
  const totalPages = Math.ceil(currentFilteredGames.length / gamesPerPage);
  
  const columns: ColumnDef<Game>[] = [
    {
      header: "Game",
      accessorKey: "title",
      cell: (game: Game) => ( // Changed signature
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 rounded overflow-hidden bg-background/80">
            <img src={game.image || game.cover || '/placeholder.svg'} alt={game.title || 'Game image'} className="h-10 w-10 object-cover" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium">{game.title}</div>
            <div className="text-xs text-muted-foreground">ID: {game.id}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Provider",
      accessorKey: "provider_slug", // or "provider" if that's the primary key used
      cell: (game: Game) => getProviderName(game.provider_slug || game.provider) // Changed signature
    },
    {
      header: "Actions",
      accessorKey: "actions", // This is a conventional key for non-data columns
      cell: (game: Game) => ( // Changed signature
        <div className="flex space-x-1 md:space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => navigate(`/casino/game/${game.slug || game.id}`)} 
            title="View Game"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => handleEditGame(game)}
            title="Edit Game"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-green-500 hover:text-green-400"
            onClick={async () => { 
                const url = await launchGame(game, { mode: "demo" });
                if (url) window.open(url, '_blank');
            }}
            title="Play Demo"
          >
            <Play className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-red-500 hover:text-red-400"
            onClick={() => handleDeleteGame(String(game.id))} 
            title="Delete Game"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  const gameFormProps: Partial<GameFormProps> = selectedGame ? { game: selectedGame } : {};


  return (
    <div className="py-6 px-2 md:py-8 md:px-4">
      {/* Header JSX: title, buttons */}
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Game Management</h1>
        
        <div className="flex flex-wrap gap-2 md:gap-3">
          <Button variant="outline" onClick={() => navigate('/casino/seamless')}>
            <Play className="mr-2 h-4 w-4" />
            Seamless API
          </Button>
          {/* <Button variant="outline" className="flex items-center">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button> */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black">
                <Plus className="mr-2 h-4 w-4" />
                Add Game
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-card">
              <DialogHeader>
                <DialogTitle>Add New Game</DialogTitle>
              </DialogHeader>
              <GameForm 
                onSubmit={handleAddGame as any} // Cast because GameForm expects (data: Partial<DbGame>). Adapter might be better.
                providers={providers} 
                categories={categories} 
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Game Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-card p-4 rounded-lg shadow">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-muted-foreground text-sm">Total Games</p>
              <h3 className="text-2xl font-bold">{allGamesFromContext.length}</h3>
            </div>
            <div className="bg-primary/10 p-3 rounded-full">
              <Gamepad2 className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>
        
        <div className="bg-card p-4 rounded-lg shadow">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-muted-foreground text-sm">Popular Games</p>
              <h3 className="text-2xl font-bold">{allGamesFromContext.filter(game => game.isPopular).length}</h3>
            </div>
            <div className="bg-yellow-500/10 p-3 rounded-full">
              <BarChart2 className="h-6 w-6 text-yellow-500" />
            </div>
          </div>
        </div>
        
        <div className="bg-card p-4 rounded-lg shadow">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-muted-foreground text-sm">New Games</p>
              <h3 className="text-2xl font-bold">{allGamesFromContext.filter(game => game.isNew).length}</h3>
            </div>
            <div className="bg-blue-500/10 p-3 rounded-full">
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
          <Input // Changed from input to Input
            type="search"
            className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background focus:ring-primary focus:border-primary"
            placeholder="Search games by title, provider, or ID..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>
      
      <div className="bg-card rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <DataTable 
            data={currentGamesForTable} 
            columns={columns as any} // Cast to any to bypass complex type error for now, ideally fix DataTable or ColumnDef
          />
        )}
        
        <div className="px-4 py-3 flex items-center justify-between border-t border-border">
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
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium">{totalPages > 0 ? indexOfFirstGame + 1 : 0}</span> to{' '}
                <span className="font-medium">
                  {Math.min(indexOfLastGame, currentFilteredGames.length)}
                </span>{' '}
                of <span className="font-medium">{currentFilteredGames.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                 <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-l-md h-8 w-8 md:h-auto md:w-auto md:px-3 md:py-2"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  title="Previous Page"
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
                  
                  if (pageNum <= 0 || pageNum > totalPages) return null;

                  return (
                    <Button 
                      key={pageNum}
                      variant={currentPage === pageNum ? "secondary" : "outline" }
                      className={`h-8 w-8 md:h-auto md:w-auto md:px-3 md:py-2 ${currentPage === pageNum ? "bg-primary/20" : ""}`}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-r-md h-8 w-8 md:h-auto md:w-auto md:px-3 md:py-2"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  title="Next Page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </nav>
            </div>
          </div>
        </div>
      </div>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-card">
          <DialogHeader>
            <DialogTitle>Edit Game</DialogTitle>
          </DialogHeader>
          {selectedGame && (
            <GameForm 
              onSubmit={handleUpdateGame as any} // Cast because GameForm expects (data: Game). Needs adapter or GameForm update.
              game={selectedGame} // Changed from initialData to game
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
