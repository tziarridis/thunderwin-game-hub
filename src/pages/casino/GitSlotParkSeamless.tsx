import { useState, useEffect } from "react";
import { getUserTransactions } from "@/services/transactionService";
import { Transaction } from "@/types/transaction";

const GitSlotParkSeamless = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameData, setGameData] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const result = await getUserTransactions('user-id-here');
        setTransactions(result.data);
        
        // Process transaction data for the game
        const processedData = result.data.map(tx => ({
          id: tx.id,
          amount: tx.amount,
          type: tx.type,
          timestamp: new Date(tx.date).getTime()
        }));
        
        setGameData(processedData);
      } catch (error) {
        console.error("Failed to fetch game transactions:", error);
        setError("Could not load game data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    if (!isInitialized) {
      fetchTransactions();
      initializeGame();
      setIsInitialized(true);
    }
  }, [isInitialized]);
  
  const initializeGame = () => {
    // Game initialization code
    console.log("Initializing GitSlotPark game...");
    
    // Mock game initialization
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
      gameContainer.innerHTML = '<div class="text-center p-8 bg-black/50 rounded">Game loading...</div>';
    }
    
    // In a real implementation, this would initialize the game SDK
    setTimeout(() => {
      if (gameContainer) {
        gameContainer.innerHTML = '<div class="text-center p-8 bg-green-900/20 rounded">Game Ready - Click to Play</div>';
      }
    }, 2000);
  };
  
  const handleGameAction = (action: string) => {
    console.log(`Game action: ${action}`);
    // Handle game actions like spin, bet, etc.
  };
  
  return (
    <div className="min-h-screen pt-20 pb-12 bg-casino-thunder-darker">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold text-white mb-6">GitSlotPark Seamless Integration</h1>
        
        {error && (
          <div className="bg-red-900/20 border border-red-900 p-4 rounded-md text-red-400 mb-6">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="thunder-card p-4 mb-6">
              <div id="game-container" className="aspect-video bg-black rounded-md overflow-hidden">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-12 h-12 border-4 border-casino-thunder-green border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-white">
                    Game will be initialized here
                  </div>
                )}
              </div>
            </div>
            
            <div className="thunder-card p-6">
              <h2 className="text-xl font-bold text-white mb-4">Game Controls</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button 
                  className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black py-3 px-4 rounded-md font-medium"
                  onClick={() => handleGameAction('spin')}
                >
                  Spin
                </button>
                <button 
                  className="bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-md font-medium"
                  onClick={() => handleGameAction('bet')}
                >
                  Bet
                </button>
                <button 
                  className="bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-md font-medium"
                  onClick={() => handleGameAction('maxBet')}
                >
                  Max Bet
                </button>
                <button 
                  className="bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-md font-medium"
                  onClick={() => handleGameAction('autoPlay')}
                >
                  Auto Play
                </button>
              </div>
            </div>
          </div>
          
          <div>
            <div className="thunder-card p-6 mb-6">
              <h2 className="text-xl font-bold text-white mb-4">Game History</h2>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-2 border-casino-thunder-green border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : transactions.length > 0 ? (
                <div className="space-y-3">
                  {transactions.slice(0, 5).map(tx => (
                    <div key={tx.id} className="bg-white/5 p-3 rounded-md">
                      <div className="flex justify-between">
                        <span className={`text-sm font-medium ${
                          tx.type === 'win' ? 'text-green-400' : 
                          tx.type === 'bet' ? 'text-red-400' : 'text-white/80'
                        }`}>
                          {tx.type === 'win' ? 'Win' : 
                           tx.type === 'bet' ? 'Bet' : tx.type}
                        </span>
                        <span className="text-sm text-white/60">
                          {new Date(tx.date).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="mt-1">
                        <span className="text-lg font-bold">
                          {tx.type === 'win' ? '+' : tx.type === 'bet' ? '-' : ''}
                          ${tx.amount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-white/50">
                  No game history available
                </div>
              )}
            </div>
            
            <div className="thunder-card p-6">
              <h2 className="text-xl font-bold text-white mb-4">Game Info</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/70">Provider:</span>
                  <span className="text-white">GitSlotPark</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">RTP:</span>
                  <span className="text-white">96.5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Volatility:</span>
                  <span className="text-white">Medium</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Min Bet:</span>
                  <span className="text-white">$0.10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Max Bet:</span>
                  <span className="text-white">$100.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GitSlotParkSeamless;
