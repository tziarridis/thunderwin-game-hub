import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { gitSlotParkService } from '@/services/gitSlotParkService';
import { Transaction } from '@/services/transactions'; // Updated import
import AppLayout from '@/components/layout/AppLayout';

const GitSlotParkSeamless = () => {
  const [token, setToken] = useState('');
  const [gameUrl, setGameUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Retrieve token from localStorage on component mount
    const storedToken = localStorage.getItem('gsp_token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const handleGetToken = async () => {
    try {
      const newToken = await gitSlotParkService.getToken();
      setToken(newToken);
      localStorage.setItem('gsp_token', newToken);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve token');
      setToken('');
    }
  };

  const handleLaunchGame = async () => {
    try {
      const launchUrl = await gitSlotParkService.launchGame({
        playerId: 'test_user',
        gameCode: 'demo',
        mode: 'demo',
        returnUrl: window.location.origin,
        language: 'en',
        currency: 'USD',
        platform: 'web'
      });
      setGameUrl(launchUrl);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to launch game');
      setGameUrl('');
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>GitSlotPark Seamless Integration</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="space-y-2">
              <label htmlFor="token">Token:</label>
              <Input
                id="token"
                type="text"
                value={token}
                readOnly
                className="cursor-not-allowed"
              />
            </div>
            <Button onClick={handleGetToken}>Get Token</Button>
            <Button onClick={handleLaunchGame} disabled={!token}>
              Launch Game
            </Button>
            {gameUrl && (
              <div className="space-y-2">
                <label htmlFor="gameUrl">Game URL:</label>
                <Input
                  id="gameUrl"
                  type="text"
                  value={gameUrl}
                  readOnly
                  className="cursor-not-allowed"
                />
                <a href={gameUrl} target="_blank" rel="noopener noreferrer">
                  Open Game in New Tab
                </a>
              </div>
            )}
            {error && <div className="text-red-500">Error: {error}</div>}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default GitSlotParkSeamless;
