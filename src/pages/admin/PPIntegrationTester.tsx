
// Updating the import at the top of the file
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { pragmaticPlayService } from "@/services/pragmaticPlayService";

interface TestResult {
  success: boolean;
  message: string;
  details?: string;
  loading?: boolean;
}

const PPIntegrationTester = () => {
  const [apiResults, setApiResults] = useState<TestResult[]>([]);
  const [transactionResults, setTransactionResults] = useState<TestResult[]>([]);
  const [gameResults, setGameResults] = useState<TestResult[]>([]);
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [isTestingTransactions, setIsTestingTransactions] = useState(false);
  const [isTestingGames, setIsTestingGames] = useState(false);

  const runApiTests = async () => {
    setIsTestingApi(true);
    setApiResults([{ loading: true, success: false, message: "Running API tests..." }]);
    
    try {
      // Test 1: API Configuration validation
      const configTest = await pragmaticPlayService.validateConfig();
      setApiResults(prev => [configTest]);
      
      // Test 2: API Connection
      const connectionTest = await pragmaticPlayService.testApiConnection();
      setApiResults(prev => [...prev, connectionTest]);
      
      // Test 3: Callback URL validation
      const callbackTest = await pragmaticPlayService.validateCallbackUrl();
      setApiResults(prev => [...prev, callbackTest]);
      
      toast.success("API tests completed");
    } catch (error) {
      console.error("Error running API tests:", error);
      setApiResults(prev => [...prev.filter(r => !r.loading), { 
        success: false, 
        message: "Error running tests",
        details: error instanceof Error ? error.message : "Unknown error"
      }]);
      toast.error("Error running API tests");
    } finally {
      setIsTestingApi(false);
    }
  };

  const runTransactionTests = async () => {
    setIsTestingTransactions(true);
    setTransactionResults([{ loading: true, success: false, message: "Running transaction tests..." }]);
    
    try {
      // Test 1: Transaction verification
      const verifyTest = await pragmaticPlayService.testTransactionVerification();
      setTransactionResults(prev => [verifyTest]);
      
      // Test 2: Hash validation
      const hashTest = await pragmaticPlayService.testHashValidation();
      setTransactionResults(prev => [...prev, hashTest]);
      
      // Test 3: Test idempotency
      const idempotencyTest = await pragmaticPlayService.testIdempotency();
      setTransactionResults(prev => [...prev, idempotencyTest]);
      
      toast.success("Transaction tests completed");
    } catch (error) {
      console.error("Error running transaction tests:", error);
      setTransactionResults(prev => [...prev.filter(r => !r.loading), { 
        success: false, 
        message: "Error running tests",
        details: error instanceof Error ? error.message : "Unknown error"
      }]);
      toast.error("Error running transaction tests");
    } finally {
      setIsTestingTransactions(false);
    }
  };

  const runGameTests = async () => {
    setIsTestingGames(true);
    setGameResults([{ loading: true, success: false, message: "Running game tests..." }]);
    
    try {
      // Test 1: Launch game test
      const launchTest = await pragmaticPlayService.testLaunchGame();
      setGameResults(prev => [launchTest]);
      
      // Test 2: Wallet callback test
      const walletTest = await pragmaticPlayService.testWalletCallback();
      setGameResults(prev => [...prev, walletTest]);
      
      // Test 3: Session management test
      const sessionTest = await pragmaticPlayService.testSessionManagement();
      setGameResults(prev => [...prev, sessionTest]);
      
      // Test 4: Round management test
      const roundTest = await pragmaticPlayService.testRoundManagement();
      setGameResults(prev => [...prev, roundTest]);
      
      toast.success("Game tests completed");
    } catch (error) {
      console.error("Error running game tests:", error);
      setGameResults(prev => [...prev.filter(r => !r.loading), { 
        success: false, 
        message: "Error running tests",
        details: error instanceof Error ? error.message : "Unknown error"
      }]);
      toast.error("Error running game tests");
    } finally {
      setIsTestingGames(false);
    }
  };

  const renderResults = (results: TestResult[]) => {
    if (results.length === 0) {
      return (
        <Alert className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No tests run</AlertTitle>
          <AlertDescription>
            Click the test button to run tests.
          </AlertDescription>
        </Alert>
      );
    }

    return results.map((result, index) => {
      if (result.loading) {
        return (
          <Alert key={`loading-${index}`} className="mb-2 border-blue-200 bg-blue-50">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <AlertTitle className="text-blue-800">Running tests...</AlertTitle>
            <AlertDescription className="text-blue-600">
              {result.message}
            </AlertDescription>
          </Alert>
        );
      }

      return (
        <Alert 
          key={`result-${index}`} 
          className={`mb-2 ${result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
        >
          {result.success ? 
            <CheckCircle2 className="h-4 w-4 text-green-600" /> : 
            <XCircle className="h-4 w-4 text-red-600" />
          }
          <AlertTitle className={result.success ? "text-green-800" : "text-red-800"}>
            {result.success ? "Success" : "Failed"}
          </AlertTitle>
          <AlertDescription className={result.success ? "text-green-600" : "text-red-600"}>
            {result.message}
            {result.details && (
              <div className="mt-2 text-sm text-gray-600">
                {result.details}
              </div>
            )}
          </AlertDescription>
        </Alert>
      );
    });
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-white">Pragmatic Play Integration Tester</h1>
        <p className="text-slate-300">
          Use this tool to test and verify the integration with Pragmatic Play.
        </p>
        
        <Card className="bg-slate-800 text-white border-slate-700">
          <CardHeader>
            <CardTitle>Integration Status</CardTitle>
            <CardDescription className="text-slate-300">
              Current status of the Pragmatic Play integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-800/20 text-green-400 hover:bg-green-800/30 border-green-700">
                    Active
                  </Badge>
                  <span className="text-sm font-medium text-slate-300">Status</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-800/20 text-blue-400 hover:bg-blue-800/30 border-blue-700">
                    testpartner
                  </Badge>
                  <span className="text-sm font-medium text-slate-300">Agent ID</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-purple-800/20 text-purple-400 hover:bg-purple-800/30 border-purple-700">
                    demo.pragmaticplay.net
                  </Badge>
                  <span className="text-sm font-medium text-slate-300">API Endpoint</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="api" className="w-full">
          <TabsList className="bg-slate-700">
            <TabsTrigger value="api" className="data-[state=active]:bg-slate-600">API Tests</TabsTrigger>
            <TabsTrigger value="transactions" className="data-[state=active]:bg-slate-600">Transaction Tests</TabsTrigger>
            <TabsTrigger value="games" className="data-[state=active]:bg-slate-600">Game Tests</TabsTrigger>
          </TabsList>
          
          <TabsContent value="api" className="mt-4">
            <Card className="bg-slate-800 text-white border-slate-700">
              <CardHeader>
                <CardTitle>API Tests</CardTitle>
                <CardDescription className="text-slate-300">
                  Test Pragmatic Play API configuration and connections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-slate-300">
                    These tests verify that your API configuration is correct and that you can connect to the Pragmatic Play API.
                  </p>
                  
                  <Separator className="bg-slate-700" />
                  
                  {renderResults(apiResults)}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={runApiTests} 
                  disabled={isTestingApi}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isTestingApi && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Run API Tests
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="transactions" className="mt-4">
            <Card className="bg-slate-800 text-white border-slate-700">
              <CardHeader>
                <CardTitle>Transaction Tests</CardTitle>
                <CardDescription className="text-slate-300">
                  Test wallet transactions and callbacks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-slate-300">
                    These tests verify that transaction callbacks, hash validation, and idempotency work correctly.
                  </p>
                  
                  <Separator className="bg-slate-700" />
                  
                  {renderResults(transactionResults)}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={runTransactionTests} 
                  disabled={isTestingTransactions}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isTestingTransactions && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Run Transaction Tests
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="games" className="mt-4">
            <Card className="bg-slate-800 text-white border-slate-700">
              <CardHeader>
                <CardTitle>Game Tests</CardTitle>
                <CardDescription className="text-slate-300">
                  Test game launches, session management, and round tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-slate-300">
                    These tests verify that you can launch games, manage sessions, track rounds, and process wallet callbacks.
                  </p>
                  
                  <Separator className="bg-slate-700" />
                  
                  {renderResults(gameResults)}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={runGameTests} 
                  disabled={isTestingGames}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isTestingGames && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Run Game Tests
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PPIntegrationTester;
