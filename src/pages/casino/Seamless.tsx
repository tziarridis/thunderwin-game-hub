
import { useEffect, useState } from 'react';
import { pragmaticPlayService, PPWalletCallback } from '@/services/pragmaticPlayService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Seamless Wallet Integration Component
 * This component handles incoming wallet callback requests from game providers
 */
const Seamless = () => {
  const [lastCallback, setLastCallback] = useState<PPWalletCallback | null>(null);
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState<{errorcode: string, balance: number} | null>(null);
  const { updateUserBalance } = useAuth();

  useEffect(() => {
    // In a real implementation, this would be a server-side endpoint
    // For demo purposes, we'll parse the query params
    const parseCallbackFromUrl = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        
        // Check if this is a wallet callback
        if (urlParams.has('agentid') && urlParams.has('playerid') && urlParams.has('type')) {
          // Parse the callback parameters
          const callback: PPWalletCallback = {
            agentid: urlParams.get('agentid') || '',
            playerid: urlParams.get('playerid') || '',
            amount: parseFloat(urlParams.get('amount') || '0'),
            type: (urlParams.get('type') as 'debit' | 'credit' | 'rollback') || 'debit',
            trxid: urlParams.get('trxid') || '',
            roundid: urlParams.get('roundid') || '',
            gameref: urlParams.get('gameref') || undefined,
            gameid: urlParams.get('gameid') || undefined,
            metadata: urlParams.get('metadata') || undefined
          };
          
          setLastCallback(callback);
          
          // Process the callback
          const result = await pragmaticPlayService.processWalletCallback(callback);
          setResponse(result);
          
          // Update the user's balance in our Auth context
          if (callback.type === 'credit') {
            // Player won money
            updateUserBalance(callback.amount);
          } else if (callback.type === 'debit') {
            // Player bet money (negative amount)
            updateUserBalance(-callback.amount);
          }
          
          toast.success(`Processed ${callback.type} transaction: ${callback.amount} EUR`);
        } else {
          toast.info('No wallet callback parameters found in URL');
        }
      } catch (error) {
        console.error('Error processing callback:', error);
        toast.error('Failed to process callback');
      } finally {
        setLoading(false);
      }
    };
    
    parseCallbackFromUrl();
  }, [updateUserBalance]);

  return (
    <div className="container mx-auto p-6">
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle>Seamless Wallet Integration</CardTitle>
          <CardDescription>
            This page handles wallet callbacks from game providers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-casino-thunder-green border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4">Processing callback...</p>
            </div>
          ) : lastCallback ? (
            <>
              <div className="bg-slate-800 p-4 rounded-md">
                <h3 className="text-lg font-medium mb-2">Callback Request</h3>
                <pre className="text-xs overflow-auto p-2 bg-slate-950 rounded">
                  {JSON.stringify(lastCallback, null, 2)}
                </pre>
              </div>
              
              {response && (
                <div className="bg-slate-800 p-4 rounded-md">
                  <h3 className="text-lg font-medium mb-2">Response</h3>
                  <pre className="text-xs overflow-auto p-2 bg-slate-950 rounded">
                    {JSON.stringify(response, null, 2)}
                  </pre>
                </div>
              )}
              
              <div className="bg-green-900/20 border border-green-800 p-4 rounded-md">
                <h3 className="text-lg font-medium mb-2">Wallet Transaction Processed</h3>
                <p>
                  {lastCallback.type === 'debit' && `Bet of ${lastCallback.amount} EUR processed.`}
                  {lastCallback.type === 'credit' && `Win of ${lastCallback.amount} EUR processed.`}
                  {lastCallback.type === 'rollback' && `Rollback of transaction ${lastCallback.trxid} processed.`}
                </p>
                <p className="mt-2">
                  New Balance: {response?.balance || 0} EUR
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">No callback data received</p>
              <p className="text-sm mt-2 text-gray-500">
                This page is meant to be called by the game provider API
              </p>
            </div>
          )}
          
          <div className="mt-8 p-4 bg-slate-800 rounded-md">
            <h3 className="text-lg font-medium mb-2">How Seamless Integration Works</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Game provider sends wallet requests to this endpoint</li>
              <li>We validate the request signature and parameters</li>
              <li>We process the transaction (bet, win, or rollback)</li>
              <li>We respond with the new balance and success status</li>
              <li>The game continues with the updated balance</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Seamless;
