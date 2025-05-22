
import React, { useState, useEffect } from 'react';
import { Game, GameLaunchOptions } from '@/types/game';
import { useGames } from '@/hooks/useGames';
import { Button } from '@/components/ui/button';
import { X, ExternalLink, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface GameLauncherProps {
  game: Game;
  mode?: 'real' | 'demo';
  isOpen: boolean;
  onClose: () => void;
}

const GameLauncher: React.FC<GameLauncherProps> = ({ game, mode = 'demo', isOpen, onClose }) => {
  const { getGameLaunchUrl } = useGames();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [launchUrl, setLaunchUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (isOpen && game) {
      setIsLoading(true);
      setError(null);
      
      const effectiveMode = isAuthenticated ? mode : 'demo';
      if (mode === 'real' && !isAuthenticated) {
        toast.error("Please log in to play with real money.");
        setError("Please log in to play with real money.");
        setIsLoading(false);
        // Optionally navigate to login or show login prompt
        // navigate('/login'); 
        // onClose(); // Close launcher if login required
        return;
      }

      const launchOptions: GameLaunchOptions = {
        mode: effectiveMode,
        // platform: 'desktop', // Or detect dynamically
      };

      getGameLaunchUrl(game, launchOptions)
        .then(url => {
          if (isMounted) {
            if (url) {
              setLaunchUrl(url);
            } else {
              setError('Failed to get game launch URL. The game might be unavailable.');
            }
          }
        })
        .catch(err => {
          if (isMounted) {
            setError(err.message || 'An unknown error occurred while preparing the game.');
            console.error("Game launch error:", err);
          }
        })
        .finally(() => {
          if (isMounted) {
            setIsLoading(false);
          }
        });
    } else {
      // Reset state if dialog is closed or game changes
      setLaunchUrl(null);
      setError(null);
      setIsLoading(false);
    }
    return () => { isMounted = false; };
  }, [isOpen, game, mode, getGameLaunchUrl, isAuthenticated]);

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] p-0 bg-black border-neutral-800 flex flex-col">
        <DialogHeader className="p-4 border-b border-neutral-700 flex flex-row justify-between items-center text-white">
          <DialogTitle>{game.title} {mode === 'demo' && '(Demo)'}</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-neutral-700">
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>
        
        <div className="flex-grow relative bg-neutral-900">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black bg-opacity-75 z-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
              <p>Loading Game...</p>
            </div>
          )}
          {error && !isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 text-red-400 bg-neutral-800">
              <Info className="h-10 w-10 mb-3"/>
              <p className="font-semibold">Could not load game</p>
              <p className="text-sm">{error}</p>
              {mode === 'real' && !isAuthenticated && (
                <Button onClick={() => { navigate('/login'); onClose(); }} className="mt-4">Log In to Play</Button>
              )}
            </div>
          )}
          {launchUrl && !error && !isLoading && (
            <iframe
              src={launchUrl}
              title={game.title}
              className="w-full h-full border-0"
              allow="autoplay; fullscreen"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
            ></iframe>
          )}
          {!launchUrl && !error && !isLoading && (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 text-muted-foreground bg-neutral-800">
                <p>Preparing game...</p>
             </div>
          )}
        </div>

        <DialogFooter className="p-3 border-t border-neutral-700 bg-black">
          {launchUrl && (
             <Button variant="outline" onClick={() => window.open(launchUrl, '_blank')} className="text-white border-neutral-600 hover:bg-neutral-700">
                Open in New Tab <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          )}
          <Button variant="secondary" onClick={onClose} className="bg-neutral-700 hover:bg-neutral-600 text-white">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GameLauncher;
