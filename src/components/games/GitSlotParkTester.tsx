
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { gitSlotParkService } from '@/services/gitSlotParkService';
import { toast } from 'sonner';

interface GameOption {
  code: string;
  name: string;
}

const GitSlotParkTester = () => {
  const [playerIdInput, setPlayerIdInput] = useState('test_player_1');
  const [playerId, setPlayerId] = useState('test_player_1');
  const [selectedGameCode, setSelectedGameCode] = useState('');
  const [language, setLanguage] = useState('en');
  const [mode, setMode] = useState<'real' | 'demo'>('demo');
  const [balance, setBalance] = useState<number>(0);
  const [currency, setCurrency] = useState<string>('EUR');
  const [amount, setAmount] = useState<number>(10);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [games, setGames] = useState<GameOption[]>([]);
  const [gameUrl, setGameUrl] = useState<string>('');
  
  // Fetch initial data
  useEffect(() => {
    loadGames();
    updateBalance();
  }, []);
  
  // Update when player ID changes
  useEffect(() => {
    if (playerId) {
      updateBalance();
      loadTransactions();
    }
  }, [playerId]);
  
  const loadGames = () => {
    try {
      // GitSlotPark games are returned directly as an array
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
  
  const updateBalance = async () => {
    if (!playerId) return;
    
    try {
      const balanceData = await gitSlotParkService.getBalance(playerId);
      setBalance(balanceData.balance);
      setCurrency(balanceData.currency);
    } catch (error) {
      console.error('Error getting balance:', error);
      toast.error('Failed to get balance');
    }
  };
  
  const loadTransactions = async () => {
    if (!playerId) return;
    
    try {
      const txData = await gitSlotParkService.getTransactions(playerId);
      setTransactions(txData.slice(0, 10));
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast.error('Failed to load transactions');
    }
  };
  
  const handleLaunchGame = async () => {
    if (!playerId || !selectedGameCode) {
      toast.error('Player ID and Game are required');
      return;
    }
    
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
  
  const handleDeposit = async () => {
    if (!playerId || amount <= 0) {
      toast.error('Player ID and a positive amount are required');
      return;
    }
    
    try {
      const result = await gitSlotParkService.credit(playerId, amount);
      if (result.success) {
        toast.success(result.message);
        updateBalance();
        loadTransactions();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error depositing funds:', error);
      toast.error('Failed to deposit funds');
    }
  };
  
  const handleWithdraw = async () => {
    if (!playerId || amount <= 0) {
      toast.error('Player ID and a positive amount are required');
      return;
    }
    
    try {
      const result = await gitSlotParkService.debit(playerId, amount);
      if (result.success) {
        toast.success(result.message);
        updateBalance();
        loadTransactions();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error withdrawing funds:', error);
      toast.error('Failed to withdraw funds');
    }
  };
  
  const handleSetPlayerId = () => {
    if (!playerIdInput.trim()) {
      toast.error('Player ID cannot be empty');
      return;
    }
    setPlayerId(playerIdInput);
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>GitSlotPark Tester</CardTitle>
          <CardDescription>Integration tool for testing GitSlotPark games</CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="settings" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="wallet">Wallet</TabsTrigger>
              <TabsTrigger value="history">Transaction History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="settings">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="playerId">Player ID</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="playerId" 
                        value={playerIdInput} 
                        onChange={(e) => setPlayerIdInput(e.target.value)}
                        placeholder="Enter player ID"
                      />
                      <Button onClick={handleSetPlayerId}>Set</Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="gameSelect">Game</Label>
                    <Select 
                      value={selectedGameCode} 
                      onValueChange={setSelectedGameCode}
                    >
                      <SelectTrigger id="gameSelect">
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
                  
                  <div className="space-y-2">
                    <Label htmlFor="languageSelect">Language</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger id="languageSelect">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="modeSelect">Mode</Label>
                    <Select 
                      value={mode} 
                      onValueChange={(value) => setMode(value as 'real' | 'demo')}
                    >
                      <SelectTrigger id="modeSelect">
                        <SelectValue placeholder="Select mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="demo">Demo</SelectItem>
                        <SelectItem value="real">Real Money</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Button className="w-full" onClick={handleLaunchGame}>
                  Launch Game
                </Button>
                
                {gameUrl && (
                  <div className="mt-4 p-4 bg-black/20 rounded-md">
                    <Label className="block mb-2">Game URL:</Label>
                    <div className="flex gap-2">
                      <Input readOnly value={gameUrl} className="font-mono text-xs" />
                      <Button 
                        onClick={() => window.open(gameUrl, '_blank')}
                        variant="outline"
                      >
                        Open
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="wallet">
              <div className="space-y-4">
                <div className="p-4 bg-black/20 rounded-md text-center">
                  <div className="text-lg text-white/70">Current Balance</div>
                  <div className="text-3xl font-bold">{balance.toFixed(2)} {currency}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input 
                      id="amount" 
                      type="number" 
                      min="1" 
                      value={amount} 
                      onChange={(e) => setAmount(parseFloat(e.target.value))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Actions</Label>
                    <div className="flex gap-2">
                      <Button onClick={handleDeposit} className="flex-1">
                        Deposit
                      </Button>
                      <Button onClick={handleWithdraw} className="flex-1" variant="destructive">
                        Withdraw
                      </Button>
                    </div>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    updateBalance();
                    toast.success('Balance refreshed');
                  }}
                >
                  Refresh Balance
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="history">
              <div className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full mb-4"
                  onClick={loadTransactions}
                >
                  Refresh Transactions
                </Button>
                
                {transactions.length === 0 ? (
                  <div className="text-center p-8 text-white/50">
                    No transactions found
                  </div>
                ) : (
                  <div className="space-y-2">
                    {transactions.map((tx, index) => (
                      <div key={index} className="p-3 bg-black/20 rounded-md">
                        <div className="flex justify-between mb-1">
                          <span 
                            className={
                              tx.type === 'win' || tx.type === 'deposit' 
                                ? 'text-green-400' 
                                : tx.type === 'bet' || tx.type === 'withdraw' 
                                  ? 'text-red-400' 
                                  : 'text-blue-400'
                            }
                          >
                            {tx.type.toUpperCase()}
                          </span>
                          <span className="text-white/70 text-sm">
                            {new Date(tx.created_at).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Game: {tx.game_id || 'N/A'}</span>
                          <span 
                            className={
                              tx.type === 'win' || tx.type === 'deposit' 
                                ? 'text-green-400' 
                                : tx.type === 'bet' || tx.type === 'withdraw' 
                                  ? 'text-red-400' 
                                  : ''
                            }
                          >
                            {tx.type === 'win' || tx.type === 'deposit' ? '+' : ''}
                            {tx.type === 'bet' || tx.type === 'withdraw' ? '-' : ''}
                            {tx.amount} {tx.currency}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="justify-between border-t border-white/10 pt-4">
          <div className="text-sm text-white/50">
            Current Player: <span className="font-semibold">{playerId}</span>
          </div>
          <Button 
            variant="ghost" 
            onClick={() => {
              updateBalance();
              loadTransactions();
              toast.success('Data refreshed');
            }}
          >
            Refresh Data
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default GitSlotParkTester;
