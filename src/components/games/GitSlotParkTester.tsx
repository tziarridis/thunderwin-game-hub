
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { gitSlotParkService } from '@/services/gitSlotParkService';
import { Loader2 } from 'lucide-react';

const GitSlotParkTester = () => {
  const [loading, setLoading] = useState(false);
  const [gameId, setGameId] = useState('2001');
  const [playerId, setPlayerId] = useState('Player01');
  const [language, setLanguage] = useState('en');
  const [mode, setMode] = useState<'demo' | 'real'>('demo');
  const [freespinId, setFreespinId] = useState('');
  const [gameUrl, setGameUrl] = useState('');
  
  const availableGames = gitSlotParkService.getAvailableGames();
  
  const handleLaunchGame = async () => {
    try {
      setLoading(true);
      const url = await gitSlotParkService.launchGame({
        gameId,
        playerId,
        language,
        mode
      });
      
      setGameUrl(url);
      toast.success(`Game URL generated successfully!`);
      window.open(url, '_blank');
    } catch (error: any) {
      console.error('Error launching game:', error);
      toast.error(`Error: ${error.message || 'Failed to launch game'}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancelFreeGame = async () => {
    if (!freespinId) {
      toast.error('Please enter a Free Spin ID');
      return;
    }
    
    try {
      setLoading(true);
      const result = await gitSlotParkService.cancelFreeGame(playerId, parseInt(gameId), freespinId);
      
      if (result.code === 0) {
        toast.success('Free game cancelled successfully');
      } else {
        toast.error(`Error: ${result.message || 'Failed to cancel free game'}`);
      }
    } catch (error: any) {
      console.error('Error cancelling free game:', error);
      toast.error(`Error: ${error.message || 'Failed to cancel free game'}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>GitSlotPark Integration Tester</CardTitle>
        <CardDescription>
          Test the integration with GitSlotPark games
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="launch" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="launch">Launch Game</TabsTrigger>
            <TabsTrigger value="freespin">Free Spins</TabsTrigger>
          </TabsList>
          
          <TabsContent value="launch" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="game">Game</Label>
              <Select value={gameId} onValueChange={setGameId}>
                <SelectTrigger id="game">
                  <SelectValue placeholder="Select a game" />
                </SelectTrigger>
                <SelectContent>
                  {availableGames.map(game => (
                    <SelectItem key={game.id} value={String(game.id)}>
                      {game.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="playerId">Player ID</Label>
              <Input id="playerId" value={playerId} onChange={e => setPlayerId(e.target.value)} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="pt">Portuguese</SelectItem>
                  <SelectItem value="it">Italian</SelectItem>
                  <SelectItem value="tr">Turkish</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mode">Mode</Label>
              <Select value={mode} onValueChange={(value) => setMode(value as 'demo' | 'real')}>
                <SelectTrigger id="mode">
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="demo">Demo</SelectItem>
                  <SelectItem value="real">Real Money</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={handleLaunchGame} 
              disabled={loading} 
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Launching...
                </>
              ) : 'Launch Game'}
            </Button>
            
            {gameUrl && (
              <div className="mt-4">
                <Label htmlFor="gameUrl">Game URL</Label>
                <div className="flex mt-1">
                  <Input id="gameUrl" value={gameUrl} readOnly className="flex-1" />
                  <Button 
                    variant="outline" 
                    className="ml-2"
                    onClick={() => {
                      navigator.clipboard.writeText(gameUrl);
                      toast.success('URL copied to clipboard');
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="freespin" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="freespinGame">Game</Label>
              <Select value={gameId} onValueChange={setGameId}>
                <SelectTrigger id="freespinGame">
                  <SelectValue placeholder="Select a game" />
                </SelectTrigger>
                <SelectContent>
                  {availableGames.map(game => (
                    <SelectItem key={game.id} value={String(game.id)}>
                      {game.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="freespinPlayerId">Player ID</Label>
              <Input id="freespinPlayerId" value={playerId} onChange={e => setPlayerId(e.target.value)} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="freespinId">Free Spin ID</Label>
              <Input 
                id="freespinId" 
                value={freespinId} 
                onChange={e => setFreespinId(e.target.value)}
                placeholder="e.g., d769f287-c120-46fa-9d2f-00ea3cbd7e55" 
              />
            </div>
            
            <Button 
              onClick={handleCancelFreeGame} 
              disabled={loading || !freespinId} 
              className="w-full"
              variant="destructive"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : 'Cancel Free Game'}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <p className="text-xs text-slate-500">
          GitSlotPark integration API tester. Note: Some operations may be simulated in this environment.
        </p>
      </CardFooter>
    </Card>
  );
};

export default GitSlotParkTester;
