import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { walletService } from '@/services/walletService';
import { DbWallet } from '@/types';

interface AggregatorGameLauncherProps {
  game: any;
  provider: 'gitslotpark' | 'pragmaticplay';
  buttonText?: string;
  variant?: 'default' | 'outline' | 'destructive' | 'secondary' | 'ghost' | 'link';
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const AggregatorGameLauncher = ({
  game,
  provider,
  buttonText = 'Play Game',
  variant = 'default',
  className = '',
  size = 'default'
}: AggregatorGameLauncherProps) => {
  const [isLaunching, setIsLaunching] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  const handleLaunch = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to play games");
      navigate('/login');
      return;
    }
    
    try {
      setIsLaunching(true);
      
      if (user?.id) {
        const walletResponse = await walletService.getWalletByUserId(user.id);
        // Ensure walletResponse.data is not null and is a single DbWallet
        const singleWallet = walletResponse.success && walletResponse.data ? (walletResponse.data as DbWallet) : null;
        if (!singleWallet || singleWallet.balance <= 0) {
          toast.error("Insufficient funds. Please deposit to play.");
          setIsLaunching(false);
          return;
        }
      }
      
      // Route to the correct seamless page based on provider
      if (provider === 'gitslotpark') {
        navigate(`/casino/gitslotpark-seamless?gameCode=${game.gameCode}`);
      } else if (provider === 'pragmaticplay') {
        navigate(`/casino/seamless?gameCode=${game.gameCode}`);
      }
      
      toast.success(`Launching: ${game.title}`);
    } catch (error: any) {
      console.error('Error launching game:', error);
      toast.error(`Error launching game: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLaunching(false);
    }
  };
  
  return (
    <Button 
      variant={variant}
      onClick={handleLaunch}
      disabled={isLaunching}
      className={className}
      size={size}
    >
      {isLaunching ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Launching...
        </>
      ) : buttonText}
    </Button>
  );
};

export default AggregatorGameLauncher;
