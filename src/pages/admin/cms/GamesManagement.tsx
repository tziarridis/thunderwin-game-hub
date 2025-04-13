
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  BarChart2,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DataTable } from '@/components/ui/data-table';
import { useToast } from '@/components/ui/use-toast';
import CMSPageHeader from '@/components/admin/cms/CMSPageHeader';
import { gamesApi } from '@/services/gamesService';
import { Game, GameListParams, GameProvider } from '@/types/game';

const GamesManagement = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState<GameProvider[]>([]);
  const [searchParams, setSearchParams] = useState<GameListParams>({
    page: 1,
    limit: 10
  });
  const [totalGames, setTotalGames] = useState(0);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchGames = async () => {
    setLoading(true);
    try {
      const response = await gamesApi.getGames(searchParams);
      setGames(response.data);
      setTotalGames(response.total);
      toast({
        title: "Success",
        description: "Games loaded successfully",
      });
    } catch (error) {
      console.error("Failed to fetch games:", error);
      toast({
        title: "Error",
        description: "Failed to load games",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProviders = async () => {
    try {
      const data = await gamesApi.getProviders();
      setProviders(data);
    } catch (error) {
      console.error("Failed to fetch providers:", error);
      toast({
        title: "Error",
        description: "Failed to load game providers",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchGames();
    fetchProviders();
  }, [searchParams.page, searchParams.limit]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const search = formData.get('search') as string;
    
    setSearchParams({
      ...searchParams,
      search,
      page: 1 // Reset to first page on new search
    });
    
    fetchGames();
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams({
      ...searchParams,
      page: newPage
    });
  };

  const handleDeleteGame = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this game?")) {
      try {
        await gamesApi.deleteGame(id);
        toast({
          title: "Success",
          description: "Game deleted successfully",
        });
        fetchGames();
      } catch (error) {
        console.error("Failed to delete game:", error);
        toast({
          title: "Error",
          description: "Failed to delete game",
          variant: "destructive"
        });
      }
    }
  };

  const columns = [
    {
      header: "Game ID",
      accessorKey: "game_id",
    },
    {
      header: "Game",
      accessorKey: "game_name",
      cell: (game: Game) => (
        <div className="flex items-center gap-2">
          {game.cover && (
            <img 
              src={game.cover} 
              alt={game.game_name} 
              className="w-10 h-10 rounded object-cover bg-slate-700"
            />
          )}
          <div>
            <div className="font-medium">{game.game_name}</div>
            <div className="text-xs text-slate-400">{game.game_code}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Provider",
      accessorKey: "distribution",
    },
    {
      header: "Type",
      accessorKey: "game_type",
    },
    {
      header: "RTP",
      accessorKey: "rtp",
      cell: (game: Game) => `${game.rtp}%`,
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (game: Game) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          game.status === 'active' ? 'bg-green-100 text-green-800' : 
          game.status === 'inactive' ? 'bg-red-100 text-red-800' : 
          'bg-yellow-100 text-yellow-800'
        }`}>
          {game.status}
        </span>
      ),
    },
    {
      header: "Featured",
      accessorKey: "is_featured",
      cell: (game: Game) => game.is_featured ? "Yes" : "No",
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (game: Game) => (
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => {
              window.open(`/casino/game/${game.game_id}`, '_blank');
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => {
              setSelectedGame(game);
              setIsEditDialogOpen(true);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-red-500"
            onClick={() => handleDeleteGame(game.id as number)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const totalPages = Math.ceil(totalGames / searchParams.limit);

  return (
    <div>
      <CMSPageHeader
        title="Games Management"
        description="Manage casino games, their providers, and appearance on the site."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4 bg-slate-800 border-slate-700">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-white/60 text-sm">Total Games</p>
              <h3 className="text-2xl font-bold">{totalGames}</h3>
            </div>
            <div className="bg-white/10 p-3 rounded-full">
              <BarChart2 className="h-6 w-6 text-casino-thunder-green" />
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-slate-800 border-slate-700">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-white/60 text-sm">Featured Games</p>
              <h3 className="text-2xl font-bold">
                {games.filter(game => game.is_featured).length}
              </h3>
            </div>
            <div className="bg-white/10 p-3 rounded-full">
              <Plus className="h-6 w-6 text-yellow-500" />
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-slate-800 border-slate-700">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-white/60 text-sm">Providers</p>
              <h3 className="text-2xl font-bold">{providers.length}</h3>
            </div>
            <div className="bg-white/10 p-3 rounded-full">
              <BarChart2 className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <Input
              type="search"
              name="search"
              className="pl-10 bg-slate-800 border-slate-700 text-white"
              placeholder="Search games by name, code, or provider..."
              defaultValue={searchParams.search || ''}
            />
          </div>
        </form>
        
        <div className="flex gap-3">
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
            <DialogContent className="bg-slate-800 text-white border-slate-700">
              <DialogHeader>
                <DialogTitle>Add New Game</DialogTitle>
              </DialogHeader>
              {/* Game form would go here */}
              <p className="text-sm text-white/60">Game form to be implemented</p>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="bg-slate-800 border-slate-700 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="w-10 h-10 animate-spin text-casino-thunder-green" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <DataTable 
                columns={columns}
                data={games}
              />
            </div>
            
            <div className="px-4 py-3 border-t border-slate-700 flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">
                  Showing <span className="font-medium">{(searchParams.page - 1) * searchParams.limit + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(searchParams.page * searchParams.limit, totalGames)}
                  </span>{' '}
                  of <span className="font-medium">{totalGames}</span> games
                </p>
              </div>
              
              <div className="flex gap-1">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-l-md"
                  onClick={() => handlePageChange(Math.max(1, searchParams.page - 1))}
                  disabled={searchParams.page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (searchParams.page <= 3) {
                    pageNum = i + 1;
                  } else if (searchParams.page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = searchParams.page - 2 + i;
                  }
                  
                  return (
                    <Button 
                      key={pageNum}
                      variant={searchParams.page === pageNum ? "default" : "outline"}
                      className={searchParams.page === pageNum ? "bg-casino-thunder-green text-black" : ""}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-r-md"
                  onClick={() => handlePageChange(Math.min(totalPages, searchParams.page + 1))}
                  disabled={searchParams.page === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-slate-800 text-white border-slate-700">
          <DialogHeader>
            <DialogTitle>Edit Game</DialogTitle>
          </DialogHeader>
          {selectedGame && (
            <div>
              <p className="text-sm text-white/60">Editing {selectedGame.game_name}</p>
              {/* Game edit form would go here */}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GamesManagement;
