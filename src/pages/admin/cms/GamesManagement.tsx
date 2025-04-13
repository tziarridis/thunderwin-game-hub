
import React, { useState } from "react";
import {
  Search,
  Plus,
  Filter,
  Edit,
  Trash2,
  Eye,
  Star,
  Home,
  Download,
  Loader2,
  BarChart2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { DataTable } from "@/components/ui/data-table";
import { useGames } from "@/hooks/useGames";
import { GameProvider, Game } from "@/types/game";
import { useToast } from "@/components/ui/use-toast";
import GameForm from "@/components/admin/GameForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CMSPageHeader from "@/components/admin/cms/CMSPageHeader";

const GamesManagement = () => {
  const {
    games,
    loading,
    params,
    totalGames,
    providers,
    loadingProviders,
    updateParams,
    addGame,
    updateGame,
    deleteGame,
    toggleGameFeature
  } = useGames();

  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [gameType, setGameType] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSearch = () => {
    updateParams({ search: searchQuery, page: 1 });
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleProviderChange = (value: string) => {
    setSelectedProvider(value);
    updateParams({
      provider_id: value === "all" ? undefined : parseInt(value),
      page: 1
    });
  };

  const handleGameTypeChange = (value: string) => {
    setGameType(value);
    updateParams({
      game_type: value === "all" ? undefined : value,
      page: 1
    });
  };

  const handlePageChange = (page: number) => {
    updateParams({ page });
  };

  const handleOpenAddDialog = () => {
    setIsAddDialogOpen(true);
  };

  const handleOpenEditDialog = (game: Game) => {
    setSelectedGame(game);
    setIsEditDialogOpen(true);
  };

  const handleAddGame = async (gameData: Omit<Game, "id">) => {
    try {
      await addGame(gameData);
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Failed to add game:", error);
    }
  };

  const handleUpdateGame = async (gameData: Game) => {
    try {
      await updateGame(gameData);
      setIsEditDialogOpen(false);
      setSelectedGame(null);
    } catch (error) {
      console.error("Failed to update game:", error);
    }
  };

  const handleDeleteGame = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this game?")) {
      try {
        await deleteGame(id);
      } catch (error) {
        console.error("Failed to delete game:", error);
      }
    }
  };

  const handleToggleFeature = async (id: number, feature: 'is_featured' | 'show_home', currentValue: boolean) => {
    try {
      await toggleGameFeature(id, feature, !currentValue);
    } catch (error) {
      console.error(`Failed to toggle ${feature}:`, error);
    }
  };

  const columns = [
    {
      header: "Game",
      accessorKey: "game_name",
      cell: (row: any) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 rounded overflow-hidden bg-white/10">
            <img
              src={row.cover || "/placeholder.svg"}
              alt={row.game_name}
              className="h-10 w-10 object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder.svg";
              }}
            />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium">{row.game_name}</div>
            <div className="text-xs text-gray-500">{row.game_code}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Provider",
      accessorKey: "provider_id",
      cell: (row: any) => (
        <div className="text-sm">
          {providers.find(p => p.id === row.provider_id)?.name || row.distribution}
        </div>
      ),
    },
    {
      header: "Type",
      accessorKey: "game_type",
      cell: (row: any) => <div className="text-sm capitalize">{row.game_type || "N/A"}</div>,
    },
    {
      header: "RTP",
      accessorKey: "rtp",
      cell: (row: any) => <div className="text-sm">{row.rtp}%</div>,
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row: any) => (
        <div className="text-sm">
          <span
            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
              row.status === "active"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {row.status}
          </span>
        </div>
      ),
    },
    {
      header: "Features",
      accessorKey: "features",
      cell: (row: any) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${row.is_featured ? "text-yellow-500" : "text-gray-400"}`}
            onClick={() => handleToggleFeature(row.id, "is_featured", row.is_featured)}
            title={row.is_featured ? "Remove from featured" : "Add to featured"}
          >
            <Star className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${row.show_home ? "text-blue-500" : "text-gray-400"}`}
            onClick={() => handleToggleFeature(row.id, "show_home", row.show_home)}
            title={row.show_home ? "Remove from home" : "Add to home"}
          >
            <Home className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (row: any) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => window.open(`/casino/game/${row.id}`, "_blank")}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleOpenEditDialog(row)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-500"
            onClick={() => handleDeleteGame(row.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <CMSPageHeader
        title="Games Management"
        description="Manage casino games and their settings"
      />

      <Tabs defaultValue="games">
        <TabsList className="mb-4">
          <TabsTrigger value="games">Games</TabsTrigger>
          <TabsTrigger value="providers">Providers</TabsTrigger>
        </TabsList>

        <TabsContent value="games" className="space-y-4">
          {/* Game Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="thunder-card p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white/60 text-sm">Total Games</p>
                  <h3 className="text-2xl font-bold">{totalGames}</h3>
                </div>
                <div className="bg-white/10 p-3 rounded-full">
                  <BarChart2 className="h-6 w-6 text-casino-thunder-green" />
                </div>
              </div>
            </div>

            <div className="thunder-card p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white/60 text-sm">Featured Games</p>
                  <h3 className="text-2xl font-bold">
                    {games.filter((game) => game.is_featured).length}
                  </h3>
                </div>
                <div className="bg-white/10 p-3 rounded-full">
                  <Star className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
            </div>

            <div className="thunder-card p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white/60 text-sm">Home Games</p>
                  <h3 className="text-2xl font-bold">
                    {games.filter((game) => game.show_home).length}
                  </h3>
                </div>
                <div className="bg-white/10 p-3 rounded-full">
                  <Home className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search games..."
                  className="pl-8 thunder-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Select
                value={selectedProvider || "all"}
                onValueChange={handleProviderChange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Providers</SelectItem>
                  {providers.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id.toString()}>
                      {provider.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={gameType || "all"}
                onValueChange={handleGameTypeChange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Game Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="slots">Slots</SelectItem>
                  <SelectItem value="table">Table Games</SelectItem>
                  <SelectItem value="live">Live Casino</SelectItem>
                  <SelectItem value="jackpot">Jackpot</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={handleSearch} className="thunder-input">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>

              <Button
                onClick={handleOpenAddDialog}
                className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Game
              </Button>
            </div>
          </div>

          {/* Games Table */}
          <div className="thunder-card overflow-hidden p-4">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-casino-thunder-green" />
              </div>
            ) : (
              <DataTable data={games} columns={columns} />
            )}

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
              <div>
                <p className="text-sm text-white/60">
                  Showing{" "}
                  <span className="font-medium">
                    {(params.page || 1) * (params.limit || 10) - (params.limit || 10) + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(
                      (params.page || 1) * (params.limit || 10),
                      totalGames
                    )}
                  </span>{" "}
                  of <span className="font-medium">{totalGames}</span> games
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange((params.page || 1) - 1)}
                  disabled={(params.page || 1) <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handlePageChange((params.page || 1) + 1)}
                  disabled={(params.page || 1) * (params.limit || 10) >= totalGames}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="providers" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Game Providers</h2>
            <Button className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black">
              <Plus className="mr-2 h-4 w-4" />
              Add Provider
            </Button>
          </div>

          {loadingProviders ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-casino-thunder-green" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {providers.map((provider) => (
                <div key={provider.id} className="thunder-card p-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                      {provider.logo ? (
                        <img
                          src={provider.logo}
                          alt={provider.name}
                          className="h-10 w-10 object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder.svg";
                          }}
                        />
                      ) : (
                        <span className="text-xl font-bold">
                          {provider.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="ml-4">
                      <h3 className="font-medium">{provider.name}</h3>
                      <p className="text-sm text-gray-400">
                        {games.filter((g) => g.provider_id === provider.id).length} games
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        handleProviderChange(provider.id.toString());
                        document.querySelector('[value="games"]')?.dispatchEvent(
                          new MouseEvent("click", { bubbles: true })
                        );
                      }}
                    >
                      <Eye className="mr-1 h-3 w-3" />
                      View Games
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs ml-2"
                    >
                      <Download className="mr-1 h-3 w-3" />
                      Import Games
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Game Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Game</DialogTitle>
          </DialogHeader>
          <GameForm
            onSubmit={handleAddGame}
            providers={providers}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Game Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Game</DialogTitle>
          </DialogHeader>
          {selectedGame && (
            <GameForm
              onSubmit={handleUpdateGame}
              initialValues={selectedGame}
              providers={providers}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GamesManagement;
