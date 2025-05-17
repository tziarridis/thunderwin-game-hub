import { useState } from "react";
import { Game, GameLaunchOptions } from '@/types';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useGames } from '@/hooks/useGames';
import { Loader2 } from 'lucide-react';
import { availableProviders } from '@/config/gameProviders';
import CurrencyLanguageSelector from '@/components/admin/CurrencyLanguageSelector';

interface GameLauncherProps {
  game: Game;
}

const GameLauncher = ({ game }: GameLauncherProps) => {
  const { launchGame } = useGames();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'real' | 'demo'>('demo');
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  
  const handleLaunch = async () => {
    try {
      setLoading(true);
      const launchOptions: GameLaunchOptions = {
        mode,
        playerId: 'demo_player',
        language: selectedLanguage,
        currency: selectedCurrency,
        platform: 'web'
      };
      await launchGame(game, launchOptions);
    } catch (error) {
      console.error('Error launching game:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Launch Game</CardTitle>
        <CardDescription>Launch {game.title} with selected provider</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        
        <div className="space-y-2">
          <Label htmlFor="mode">Game Mode</Label>
          <Select value={mode} onValueChange={(value) => setMode(value as 'real' | 'demo')}>
            <SelectTrigger id="mode">
              <SelectValue placeholder="Select mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="demo">Demo Mode</SelectItem>
              <SelectItem value="real">Real Money</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <CurrencyLanguageSelector
          selectedCurrency={selectedCurrency}
          onCurrencyChange={setSelectedCurrency}
          selectedLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
        />
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handleLaunch}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Launching...
            </>
          ) : (
            'Launch Game'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GameLauncher;
