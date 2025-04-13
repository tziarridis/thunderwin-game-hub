
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { pragmaticPlayService } from "@/services/pragmaticPlayService";
import { Loader2, Check, X, Play, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PPApiValidatorProps {
  addLog?: (message: string) => void;
}

const PPApiValidator: React.FC<PPApiValidatorProps> = ({ addLog = () => {} }) => {
  const [endpoint, setEndpoint] = useState("launchgame");
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<{
    success: boolean;
    message: string;
    data?: any;
    timestamp: string;
  }[]>([]);

  const testEndpoint = async () => {
    setIsLoading(true);
    addLog(`Testing PP API endpoint: ${endpoint}`);

    try {
      let result;
      switch (endpoint) {
        case "launchgame":
          result = await pragmaticPlayService.testLaunchGame();
          break;
        case "getbalance":
          result = await pragmaticPlayService.testGetBalance();
          break;
        case "gameinfo":
          result = await pragmaticPlayService.testGameInfo();
          break;
        case "wallet":
          result = await pragmaticPlayService.testWalletCallback();
          break;
        default:
          throw new Error(`Unknown endpoint: ${endpoint}`);
      }

      setTestResults(prev => [{
        success: result.success,
        message: result.message,
        data: result.data,
        timestamp: new Date().toISOString()
      }, ...prev.slice(0, 9)]);

      addLog(`API test ${result.success ? 'successful' : 'failed'}: ${result.message}`);
      
      if (result.success) {
        toast.success(`API endpoint test successful: ${endpoint}`);
      } else {
        toast.error(`API endpoint test failed: ${result.message}`);
      }
    } catch (error: any) {
      const errorMessage = `API test error: ${error.message}`;
      setTestResults(prev => [{
        success: false,
        message: errorMessage,
        timestamp: new Date().toISOString()
      }, ...prev.slice(0, 9)]);
      
      addLog(`ERROR: ${errorMessage}`);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getEndpointDescription = () => {
    switch (endpoint) {
      case "launchgame":
        return "Tests the game launch API to verify URL generation";
      case "getbalance":
        return "Tests the player balance retrieval endpoint";
      case "gameinfo":
        return "Tests retrieving information about available games";
      case "wallet":
        return "Tests wallet callback functionality for bets and wins";
      default:
        return "Select an endpoint to test";
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle>Pragmatic Play API Validator</CardTitle>
        <CardDescription>
          Validate API endpoints and responses
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="endpoint-select">Select API Endpoint</Label>
          <Select value={endpoint} onValueChange={setEndpoint}>
            <SelectTrigger id="endpoint-select" className="bg-slate-700 border-slate-600">
              <SelectValue placeholder="Select endpoint to test" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="launchgame">Launch Game API</SelectItem>
              <SelectItem value="getbalance">Get Balance API</SelectItem>
              <SelectItem value="gameinfo">Game Info API</SelectItem>
              <SelectItem value="wallet">Wallet Callback</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-slate-400">{getEndpointDescription()}</p>
        </div>

        <Button 
          onClick={testEndpoint} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing API...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Test API Endpoint
            </>
          )}
        </Button>

        <div className="space-y-2 mt-4">
          <Label>Test Results</Label>
          {testResults.length === 0 ? (
            <div className="bg-slate-900 rounded-md p-4 text-center text-slate-400 text-sm">
              No tests have been run yet
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {testResults.map((result, index) => (
                <div key={index} className="bg-slate-900 rounded-md p-3 border-l-4 text-sm overflow-hidden break-words"
                  style={{ borderLeftColor: result.success ? '#10b981' : '#ef4444' }}
                >
                  <div className="flex items-center">
                    {result.success ? (
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                    ) : (
                      <X className="h-4 w-4 text-red-500 mr-2" />
                    )}
                    <span className={result.success ? "text-green-400" : "text-red-400"}>
                      {result.success ? "Success" : "Failed"}
                    </span>
                    <span className="text-xs text-slate-500 ml-auto">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="mt-1 text-slate-300">{result.message}</div>
                  {result.data && (
                    <pre className="mt-2 p-2 bg-slate-950 rounded text-xs text-slate-300 font-mono overflow-x-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PPApiValidator;
