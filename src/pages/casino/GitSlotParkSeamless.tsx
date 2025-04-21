import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { gitSlotParkService } from '@/services/gitSlotParkService';
import { toast } from 'sonner';

const GitSlotParkSeamless = () => {
  const [playerId, setPlayerId] = useState('test_player_1');
  const [selectedGameCode, setSelectedGameCode] = useState('');
  const [language, setLanguage] = useState('en');
  const [mode, setMode] = useState<'real' | 'demo'>('demo');
  const [gameUrl, setGameUrl] = useState<string>('');
  const [games, setGames] = useState<any[]>([]);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = () => {
    try {
      const gspGames = gitSlotParkService.getAvailableGames();
      setGames(gspGames);
      if (gspGames.length > 0 && !selectedGameCode) {
        setSelectedGameCode(gspGames[0].code);
      }
    } catch (error) {
      console.error('Error loading games:', error);
      toast.error('Failed to load games');
    }
  };

  const handleGameLaunch = async () => {
    try {
      const url = await gitSlotParkService.launchGame({
        playerId,
        gameCode: selectedGameCode,
        language,
        mode,
        returnUrl: window.location.href
      });

      setGameUrl(url);
      toast.success('Game launch URL generated');
    } catch (error) {
      console.error('Error launching game:', error);
      toast.error('Failed to launch game');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <Card className="divide-y divide-gray-200">
          <CardHeader>
            <CardTitle className="text-lg">GitSlotPark Seamless Integration</CardTitle>
            <CardDescription>Test game launch</CardDescription>
          </CardHeader>
          <CardContent className="py-4">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="playerId">Player ID</Label>
                <Input
                  type="text"
                  id="playerId"
                  className="mt-1 block w-full"
                  placeholder="Enter Player ID"
                  value={playerId}
                  onChange={(e) => setPlayerId(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="gameSelect">Select Game</Label>
                <Select onValueChange={setSelectedGameCode} defaultValue={selectedGameCode}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a game" />
                  </SelectTrigger>
                  <SelectContent>
                    {games.map((game) => (
                      <SelectItem key={game.code} value={game.code}>
                        {game.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="language">Language</Label>
                <Select onValueChange={setLanguage} defaultValue={language}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="mode">Mode</Label>
                <Select onValueChange={(value) => setMode(value as 'real' | 'demo')} defaultValue={mode}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="demo">Demo</SelectItem>
                    <SelectItem value="real">Real</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleGameLaunch}>
              Launch Game
            </Button>
          </CardFooter>
        </Card>
        {gameUrl && (
          <div className="mt-4 p-4 bg-gray-200 rounded-md">
            <Label className="block mb-2">Game URL:</Label>
            <Input readOnly value={gameUrl} className="font-mono text-xs" />
          </div>
        )}
      </div>
    </div>
  );
};

export default GitSlotParkSeamless;
