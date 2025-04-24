
import { useState } from 'react';
import { Game } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useGames } from '@/hooks/useGames';
import { Loader2, AlertTriangle } from 'lucide-react';
import { availableProviders } from '@/config/gameProviders';
import CurrencyLanguageSelector from '@/components/admin/CurrencyLanguageSelector';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface GameLauncherProps {
  game: Game;
}

const GameLauncher = ({ game }: GameLauncherProps) => {
  const { launchGame, launchingGame } = useGames();
  const [loading, setLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('ppeur'); // Default to PP EUR
  const [mode, setMode] = useState<'real' | 'demo'>('demo');
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  
  const handleLaunch = async () => {
    try {
      setError(null);
      setLoading(true);
      
      // Check if real money mode is selected but user is not authenticated
      if (mode === 'real' && !isAuthenticated) {
        setError('You must be logged in to play in real money mode');
        toast.error('Please log in to play in real money mode');
        setLoading(false);
        return;
      }
      
      // Find the selected provider in the availableProviders array
      const provider = availableProviders.find(p => p.id === selectedProvider);
      if (!provider) {
        throw new Error('Invalid provider selected');
      }
      
      await launchGame(game, {
        providerId: selectedProvider,
        mode,
        playerId: 'demo_player',
        language: selectedLanguage,
        currency: selectedCurrency
      });
    } catch (error: any) {
      console.error('Error launching game:', error);
      setError(error.message || 'Failed to launch game');
      toast.error(`Error launching game: ${error.message || 'Unknown error'}`);
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
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="provider">Game Provider</Label>
          <Select value={selectedProvider} onValueChange={setSelectedProvider}>
            <SelectTrigger id="provider">
              <SelectValue placeholder="Select provider" />
            </SelectTrigger>
            <SelectContent>
              {availableProviders.map(provider => (
                <SelectItem key={provider.id} value={provider.id}>
                  {provider.name} ({provider.currency})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
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
          {mode === 'real' && !isAuthenticated && (
            <p className="text-xs text-amber-500">You must be logged in to play in real money mode</p>
          )}
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
          disabled={loading || launchingGame || (mode === 'real' && !isAuthenticated)}
        >
          {loading || launchingGame ? (
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
