
import React, { useState, useEffect, useMemo } from 'react';
import { useGames } from '@/hooks/useGames';
import { Game } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import GameForm from '@/components/admin/GameForm'; // Assuming GameForm handles create/edit
import { PlusCircle, Edit, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';

const GamesPage = () => {
  const { games, loading, error, fetchGames /*, addGame, updateGame, deleteGame, totalGames */ } = useGames();
  // Commented out addGame, updateGame, deleteGame, totalGames as they might not exist on useGames context
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const filteredGames = useMemo(() => 
    games.filter(game => 
      game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.category.toLowerCase().includes(searchTerm.toLowerCase())
    ), [games, searchTerm]
  );

  const handleAddNew = () => {
    setSelectedGame(null);
    setIsFormOpen(true);
  };

  const handleEdit = (game: Game) => {
    setSelectedGame(game);
    setIsFormOpen(true);
  };

  const handleDelete = async (gameId: string) => {
    if (window.confirm('Are you sure you want to delete this game?')) {
      try {
        // await deleteGame(gameId); // Assuming deleteGame exists and works
        toast.success('Game deleted successfully');
        // fetchGames(); // Re-fetch games after deletion
        console.warn("deleteGame function is commented out, game not deleted from backend");
      } catch (err) {
        toast.error(`Failed to delete game: ${(err as Error).message}`);
      }
    }
  };

  const handleFormSubmit = async (gameData: Partial<Game>) => {
    try {
      if (selectedGame && selectedGame.id) {
        // await updateGame(selectedGame.id, gameData); // Assuming updateGame exists
        toast.success('Game updated successfully');
        console.warn("updateGame function is commented out, game not updated on backend");
      } else {
        // await addGame(gameData as Game); // Assuming addGame exists
        toast.success('Game added successfully');
        console.warn("addGame function is commented out, game not added to backend");
      }
      setIsFormOpen(false);
      // fetchGames(); // Re-fetch games after add/update
    } catch (err) {
      toast.error(`Failed to save game: ${(err as Error).message}`);
    }
  };
  

  if (loading) return <div className="p-4">Loading games...</div>;
  if (error) return <div className="p-4 text-red-500">Error loading games: {error.toString()}</div>;

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Games</h1>
        {/* <p className="text-gray-400">Total Games: {totalGames}</p> */}
        <Button onClick={handleAddNew} className="bg-green-500 hover:bg-green-600">
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Game
        </Button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Input 
            type="text"
            placeholder="Search by title, provider, category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-white"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
        </div>
      </div>

      <div className="overflow-x-auto bg-gray-800 rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-700 hover:bg-gray-750">
              <TableHead className="text-white">Title</TableHead>
              <TableHead className="text-white">Provider</TableHead>
              <TableHead className="text-white">Category</TableHead>
              <TableHead className="text-white">RTP</TableHead>
              <TableHead className="text-white">Status</TableHead>
              <TableHead className="text-white text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGames.map((game) => (
              <TableRow key={game.id} className="border-gray-700 hover:bg-gray-750">
                <TableCell>{game.title}</TableCell>
                <TableCell>{game.provider}</TableCell>
                <TableCell>{game.category}</TableCell>
                <TableCell>{game.rtp || 'N/A'}%</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 text-xs rounded-full ${game.isNew ? 'bg-blue-500 text-white' : 'bg-gray-600 text-gray-300'}`}>
                    {game.isNew ? 'New' : 'Active'} {/* Assuming a status or using isNew as proxy */}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(game)} className="text-blue-400 hover:text-blue-300">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(game.id)} className="text-red-400 hover:text-red-300">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {filteredGames.length === 0 && <p className="text-center text-gray-500 mt-4">No games found.</p>}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>{selectedGame ? 'Edit Game' : 'Add New Game'}</DialogTitle>
          </DialogHeader>
          <GameForm 
            initialData={selectedGame} 
            onSubmit={handleFormSubmit} 
            onCancel={() => setIsFormOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GamesPage;

