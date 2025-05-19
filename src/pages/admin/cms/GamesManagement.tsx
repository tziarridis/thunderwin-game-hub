
import React, { useState, useEffect, useMemo } from "react";
import { Search, Plus, Filter, Edit, Trash2, Eye, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Game, DbGame } from "@/types";
import { useNavigate } from "react-router-dom";
import GameForm, { GameFormProps } from "@/components/admin/GameForm"; // Import GameFormProps
import { gameService } from "@/services/gameService";
import { toast } from "sonner";
import CMSPageHeader from "@/components/admin/cms/CMSPageHeader";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useGames } from "@/hooks/useGames";


const GamesManagement = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const gamesPerPage = 10;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const navigate = useNavigate();
  const { fetchGames: refreshGlobalGames, providers: gameProvidersFromHook, categories: gameCategoriesFromHook } = useGames();


  const fetchPageData = async () => {
    setIsLoading(true);
    try {
      const fetchedGames = await gameService.getAllGames({ search: searchQuery });
      setGames(fetchedGames);
    } catch (error) {
      console.error("Failed to fetch games:", error);
      toast.error("Failed to load games.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPageData();
  }, [searchQuery]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleEdit = (game: Game) => {
    setEditingGame(game);
    setIsFormOpen(true);
  };

  const handleDelete = async (gameId: string | number) => {
    const gameIdStr = String(gameId);
    if (window.confirm("Are you sure you want to delete this game?")) {
      try {
        await gameService.deleteGame(gameIdStr);
        toast.success("Game deleted successfully.");
        fetchPageData(); // Refresh
        refreshGlobalGames(); // Refresh global context
      } catch (error: any) {
        toast.error(`Failed to delete game: ${error.message}`);
      }
    }
  };

  const prepareGameForForm = (game: Game | null): Partial<DbGame> | null => {
    if (!game) return null;
    const ensureNumber = (value: string | number | undefined): number | undefined => {
      if (value === undefined || value === null || value === '') return undefined;
      const num = Number(value);
      return isNaN(num) ? undefined : num;
    };
    return {
        id: String(game.id),
        title: game.title,
        slug: game.slug,
        provider_slug: game.provider_slug || game.provider,
        category_slugs: Array.isArray(game.category_slugs) ? game.category_slugs : (typeof game.category_slugs === 'string' ? [game.category_slugs] : (game.categoryName ? [game.categoryName] : [])),
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
        game_id: game.game_id ? String(game.game_id) : undefined,
        game_code: game.game_code ? String(game.game_code) : undefined,
    };
  };
  
  const gameFormInitialData = editingGame ? prepareGameForForm(editingGame) : null;

  const handleFormSubmit = async (values: Partial<DbGame>) => { // GameForm submits Partial<DbGame>
    try {
      const gamePayload: Partial<Game> = { // Map DbGame back to Game for service
        ...values,
        title: values.title || values.game_name,
        image: values.cover,
        categoryName: values.game_type,
        minBet: values.min_bet,
        maxBet: values.max_bet,
      };

      if (editingGame && editingGame.id) {
        await gameService.updateGame(String(editingGame.id), gamePayload);
        toast.success("Game updated successfully.");
      } else {
        await gameService.createGame(gamePayload);
        toast.success("Game created successfully.");
      }
      setIsFormOpen(false);
      setEditingGame(null);
      fetchPageData(); // Refresh
      refreshGlobalGames();
    } catch (error: any) {
      toast.error(`Failed to save game: ${error.message}`);
    }
  };


  const paginatedGames = useMemo(() => {
    const startIndex = (currentPage - 1) * gamesPerPage;
    return games.slice(startIndex, startIndex + gamesPerPage);
  }, [games, currentPage, gamesPerPage]);

  const totalPages = Math.ceil(games.length / gamesPerPage);
  
  const gameFormPropsBase: Omit<GameFormProps, 'game' | 'onSubmit'> = {
    onCancel: () => {
      setIsFormOpen(false);
      setEditingGame(null);
    },
  };

  return (
    <div className="p-6 space-y-6">
      <CMSPageHeader
        title="Games Content Management"
        description="Add, edit, and manage all game entries for the casino."
        actions={
          <Button onClick={() => { setEditingGame(null); setIsFormOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Add New Game
          </Button>
        }
      />

      <div className="flex justify-between items-center">
        <Input
          placeholder="Search games..."
          value={searchQuery}
          onChange={handleSearch}
          className="max-w-sm"
          icon={<Search className="h-4 w-4 text-muted-foreground" />}
        />
        {/* Filter button can be added here */}
      </div>

      {isLoading && paginatedGames.length === 0 ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="bg-card rounded-lg shadow-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                {/* <TableHead className="w-[50px]">Select</TableHead> */}
                <TableHead>Game Title</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedGames.length > 0 ? paginatedGames.map((game) => (
                <TableRow key={String(game.id)}>
                  {/* <TableCell><Checkbox /></TableCell> */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img src={game.image || '/placeholder.svg'} alt={game.title} className="h-10 w-10 rounded-md object-cover" />
                      <div>
                        <div className="font-medium">{game.title}</div>
                        <div className="text-xs text-muted-foreground">ID: {String(game.id).substring(0, 8)}...</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{game.providerName || game.provider_slug || 'N/A'}</TableCell>
                  <TableCell>
                    { (Array.isArray(game.category_slugs) ? game.category_slugs.join(', ') : game.categoryName) || 'N/A' }
                  </TableCell>
                  <TableCell>
                    <Badge variant={game.status === 'active' ? 'default' : 'outline'}>
                      {game.status || 'Unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => navigate(`/casino/game/${game.slug || String(game.id)}`)} title="View Game">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(game)} title="Edit Game">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(String(game.id))} className="text-destructive hover:text-destructive-foreground" title="Delete Game">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={5} className="text-center h-24">No games found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-end items-center space-x-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingGame ? "Edit Game" : "Add New Game"}</DialogTitle>
          </DialogHeader>
          <GameForm
            {...gameFormPropsBase}
            onSubmit={handleFormSubmit}
            game={gameFormInitialData}
            // providers={gameProvidersFromHook} // Pass these if GameForm needs them for dropdowns
            // categories={gameCategoriesFromHook}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GamesManagement;
