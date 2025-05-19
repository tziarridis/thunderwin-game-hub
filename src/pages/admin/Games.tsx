import React, { useState, useEffect, useMemo } from "react";
import { 
  Search, Plus, Filter, Edit, Trash2, ChevronLeft, ChevronRight, Eye, Gamepad2, BarChart2, Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Game, DbGame } from "@/types";
import { useNavigate } from "react-router-dom";
import GameForm, { GameFormProps } from "@/components/admin/GameForm"; // Import GameFormProps
import { useGames } from "@/hooks/useGames"; // This hook might need create/delete methods or use gameService directly
import { gameService } from "@/services/gameService"; // Direct service usage
import { toast } from "sonner";
import { Input } from "@/components/ui/input"; // For search
import { Checkbox } from "@/components/ui/checkbox"; // For row selection
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; // For table
import { Badge } from "@/components/ui/badge"; // For status

const AdminGames = () => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedGameForEdit, setSelectedGameForEdit] = useState<Game | null>(null); // Use Game type
  const gamesPerPage = 10;
  const navigate = useNavigate();
  
  // useGames provides allGames, loading, providers, categories, and fetchGames (for refresh)
  const { 
    games: allGamesFromHook,
    isLoading: loadingFromHook, 
    providers, // from useGames
    categories, // from useGames
    fetchGames: refreshGamesFromHook // Renamed to avoid conflict
  } = useGames(); 

  const [localGames, setLocalGames] = useState<Game[]>([]);
  const [isLoadingLocal, setIsLoadingLocal] = useState(true);

  // Fetch games using gameService for more control if needed, or rely on useGames
  const fetchLocalGames = async () => {
    setIsLoadingLocal(true);
    try {
      // Using gameService directly to ensure create/update/delete consistency for admin
      const gamesData = await gameService.getAllGames({ search: searchQuery });
      setLocalGames(gamesData);
    } catch (error) {
      toast.error("Failed to load games for admin.");
      console.error(error);
    } finally {
      setIsLoadingLocal(false);
    }
  };
  
  useEffect(() => {
    fetchLocalGames(); // Fetch games initially and on search query change
  }, [searchQuery]);
  
  // Or, if useGames is sufficient and handles search:
  // useEffect(() => {
  //   refreshGamesFromHook({ search: searchQuery }); // Assuming useGames' fetchGames accepts filters
  // }, [searchQuery, refreshGamesFromHook]);
  // const localGames = allGamesFromHook;
  // const isLoadingLocal = loadingFromHook;


  const getProviderName = (providerSlug: string | undefined): string => {
    if (!providerSlug) return 'Unknown';
    // providers from useGames might be string[] or object[]. Adjust accordingly.
    // Assuming providers from useGames is string[] of slugs/names.
    const providerDetail = providers.find(p => 
        (typeof p === 'object' ? (p as any).slug === providerSlug || (p as any).name === providerSlug : p === providerSlug)
    );
    return typeof providerDetail === 'object' ? (providerDetail as any).name : providerDetail || providerSlug;
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); 
  };
  
  const handleSelectRow = (gameId: string) => {
    const gameIdStr = String(gameId); // Ensure it's a string
    setSelectedRows(prevSelectedRows =>
      prevSelectedRows.includes(gameIdStr)
        ? prevSelectedRows.filter(id => id !== gameIdStr)
        : [...prevSelectedRows, gameIdStr]
    );
  };
  
  const handleSelectAll = (checked: boolean | string) => { // Checkbox onCheckedChange gives boolean or "indeterminate"
    if (checked === true) {
      setSelectedRows(currentGames.map(game => String(game.id)));
    } else {
      setSelectedRows([]);
    }
  };
  
  const handleViewGame = (gameSlugOrId: string | number) => {
    navigate(`/casino/game/${String(gameSlugOrId)}`);
  };

  const handleEditGame = (game: Game) => { 
    setSelectedGameForEdit(game);
    setIsEditDialogOpen(true);
  };
  
  const handleDeleteGame = async (gameId: string | number) => {
    const gameIdStr = String(gameId);
    if (window.confirm("Are you sure you want to delete this game?")) {
      try {
        await gameService.deleteGame(gameIdStr);
        toast.success('Game deleted successfully!');
        fetchLocalGames(); // Refresh local list
        refreshGamesFromHook(); // Refresh global list from useGames
        setSelectedRows(prev => prev.filter(id => id !== gameIdStr));
      } catch (error: any) {
        toast.error(`Failed to delete game: ${error.message}`);
      }
    }
  };
  
  // This function maps frontend Game type to what GameForm expects (Partial<DbGame>)
  const prepareGameForForm = (game: Game | null): Partial<DbGame> | null => {
    if (!game) return null;
    
    const ensureNumber = (value: string | number | undefined): number | undefined => {
      if (value === undefined || value === null || value === '') return undefined;
      const num = Number(value);
      return isNaN(num) ? undefined : num;
    };

    return {
        id: String(game.id), // GameForm might expect string ID
        title: game.title,
        slug: game.slug,
        provider_slug: game.provider_slug || game.provider,
        // GameForm expects category_slugs as string[]
        category_slugs: Array.isArray(game.category_slugs) ? game.category_slugs : (typeof game.category_slugs === 'string' ? [game.category_slugs] : (game.categoryName ? [game.categoryName] : [])),
        rtp: ensureNumber(game.rtp),
        status: game.status as DbGame['status'] || 'active',
        description: game.description,
        cover: game.image, // GameForm expects 'cover'
        banner: game.banner,
        is_popular: game.isPopular,
        is_new: game.isNew,
        is_featured: game.is_featured, // Game type has is_featured
        show_home: game.show_home, // Game type has show_home
        tags: game.tags,
        features: game.features,
        themes: game.themes,
        volatility: game.volatility,
        lines: typeof game.lines === 'string' ? parseInt(game.lines) : game.lines,
        min_bet: ensureNumber(game.minBet),
        max_bet: ensureNumber(game.maxBet),
        release_date: game.release_date,
        game_id: game.game_id ? String(game.game_id) : undefined,
        game_code: game.game_code ? String(game.game_code) : undefined,
    };
  };
  
  const gameFormInitialData = selectedGameForEdit ? prepareGameForForm(selectedGameForEdit) : null;

  const handleFormSubmit = async (values: Partial<DbGame>) => { // GameForm submits Partial<DbGame>
    try {
      const gamePayload: Partial<Game> = { // Map DbGame back to Game for service if needed, or service takes DbGame
        ...values, // values is Partial<DbGame>
        // Map DbGame fields back to Game fields if service expects Game
        title: values.title || values.game_name,
        image: values.cover,
        categoryName: values.game_type,
        minBet: values.min_bet,
        maxBet: values.max_bet,
        // ... other mappings if service expects Partial<Game>
      };

      if (isAddDialogOpen) {
        // gameService.createGame expects Partial<Game>
        await gameService.createGame(gamePayload);
        toast.success('Game created successfully!');
        setIsAddDialogOpen(false);
      } else if (isEditDialogOpen && (values.id || selectedGameForEdit?.id)) {
        // gameService.updateGame expects Partial<Game>
        await gameService.updateGame(String(values.id || selectedGameForEdit!.id), gamePayload);
        toast.success('Game updated successfully!');
        setIsEditDialogOpen(false);
      }
      fetchLocalGames(); 
      refreshGamesFromHook();
      setSelectedGameForEdit(null); 
    } catch (error: any) {
      toast.error(`Failed to save game: ${error.message}`);
    }
  };


  const indexOfLastGame = currentPage * gamesPerPage;
  const indexOfFirstGame = indexOfLastGame - gamesPerPage;
  const currentGames = localGames.slice(indexOfFirstGame, indexOfLastGame);
  const totalPages = Math.ceil(localGames.length / gamesPerPage);
  
  const gameFormPropsBase: Omit<GameFormProps, 'game' | 'onSubmit'> = { // Remove isEditing from base props
    onCancel: () => {
      setIsAddDialogOpen(false);
      setIsEditDialogOpen(false);
      setSelectedGameForEdit(null);
    },
    // isEditing is determined by presence of `game` prop in GameForm
  };

  return (
    <div className="py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Game Management</h1>
        <div className="flex gap-3">
          {/* <Button variant="outline" className="flex items-center">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button> */}
          <Dialog open={isAddDialogOpen} onOpenChange={(isOpen) => {
            setIsAddDialogOpen(isOpen);
            if (!isOpen) setSelectedGameForEdit(null); 
          }}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => { setSelectedGameForEdit(null); setIsAddDialogOpen(true); }}>
                <Plus className="mr-2 h-4 w-4" />
                Add Game
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Game</DialogTitle>
              </DialogHeader>
              <GameForm 
                {...gameFormPropsBase}
                onSubmit={handleFormSubmit} 
                game={null} // For adding new game
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* ... (Summary cards using localGames.length etc.) ... */}
        <div className="bg-card p-4 rounded-lg shadow">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-muted-foreground text-sm">Total Games</p>
              <h3 className="text-2xl font-bold">{localGames.length}</h3>
            </div>
            <Gamepad2 className="h-8 w-8 text-primary" />
          </div>
        </div>
         <div className="bg-card p-4 rounded-lg shadow">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-muted-foreground text-sm">Popular Games</p>
              <h3 className="text-2xl font-bold">{localGames.filter(g => g.isPopular).length}</h3>
            </div>
            <BarChart2 className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg shadow">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-muted-foreground text-sm">New Games</p>
              <h3 className="text-2xl font-bold">{localGames.filter(g => g.isNew).length}</h3>
            </div>
            <Plus className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      </div>
      
      <div className="mb-6">
          <Input
            type="search"
            className="w-full max-w-md"
            placeholder="Search games by title, provider, or ID..."
            value={searchQuery}
            onChange={handleSearch}
            icon={<Search className="w-4 h-4 text-muted-foreground" />}
          />
      </div>
      
      <div className="bg-card rounded-lg shadow overflow-hidden">
        {isLoadingLocal && currentGames.length === 0 ? ( 
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                        checked={currentGames.length > 0 && selectedRows.length === currentGames.length ? true : (selectedRows.length > 0 ? "indeterminate" : false) }
                        onCheckedChange={handleSelectAll}
                        disabled={currentGames.length === 0}
                      />
                  </TableHead>
                  <TableHead>Game</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Categories</TableHead>
                  <TableHead>RTP</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentGames.map((game) => (
                  <TableRow key={String(game.id)} className="hover:bg-muted/50">
                    <TableCell>
                      <Checkbox
                        checked={selectedRows.includes(String(game.id))}
                        onCheckedChange={() => handleSelectRow(String(game.id))}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <img src={game.image || '/placeholder.svg'} alt={game.title} className="h-10 w-10 rounded-md object-cover mr-3" />
                        <div>
                          <div className="text-sm font-medium">{game.title}</div>
                          <div className="text-xs text-muted-foreground">ID: {String(game.id).substring(0,8)}...</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{game.providerName || getProviderName(game.provider_slug || game.provider)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {game.categoryName || (Array.isArray(game.category_slugs) ? game.category_slugs.join(', ') : game.category)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{game.rtp ? `${typeof game.rtp === 'number' ? game.rtp.toFixed(2) : game.rtp}%` : "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant={
                        game.status === 'active' ? 'default' :
                        game.status === 'inactive' ? 'destructive' :
                        game.status === 'maintenance' ? 'outline' : // 'warning' if you have that variant
                        'secondary'
                      }>
                        {game.status || 'unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => handleViewGame(game.slug || String(game.id))} className="hover:text-primary">
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
                            <Button variant="ghost" size="icon" onClick={() => handleEditGame(game)} className="hover:text-blue-500">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Edit Game: {selectedGameForEdit?.title}</DialogTitle>
                            </DialogHeader>
                            <GameForm 
                              {...gameFormPropsBase}
                              onSubmit={handleFormSubmit} 
                              game={gameFormInitialData} // Pass data for editing
                            />
                          </DialogContent>
                        </Dialog>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteGame(String(game.id))} className="hover:text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
          <span className="text-sm text-muted-foreground">
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
