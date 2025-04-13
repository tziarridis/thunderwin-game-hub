
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, AlertTriangle, CheckCircle, XCircle, Download } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { pragmaticPlayService } from "@/services/pragmaticPlayService";

interface TestResult {
  name: string;
  status: 'success' | 'warning' | 'error' | 'pending';
  message: string;
  details?: string;
}

interface PPIntegrationReportProps {
  status: 'success' | 'warning' | 'error' | 'pending';
}

const PPIntegrationReport: React.FC<PPIntegrationReportProps> = ({ status }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([
    { name: "API Configuration", status: "pending", message: "Waiting to run test" },
    { name: "API Connectivity", status: "pending", message: "Waiting to run test" },
    { name: "Game Launch", status: "pending", message: "Waiting to run test" },
    { name: "Seamless Wallet", status: "pending", message: "Waiting to run test" },
    { name: "Idempotency", status: "pending", message: "Waiting to run test" },
    { name: "Transaction Verification", status: "pending", message: "Waiting to run test" },
  ]);

  const [scoreMatrix, setScoreMatrix] = useState({
    success: 0,
    warning: 0,
    error: 0,
    pending: 6,
    total: 6
  });

  useEffect(() => {
    if (status !== 'pending') {
      runTests();
    }
  }, [status]);

  useEffect(() => {
    // Update score matrix when test results change
    const success = testResults.filter(r => r.status === 'success').length;
    const warning = testResults.filter(r => r.status === 'warning').length;
    const error = testResults.filter(r => r.status === 'error').length;
    const pending = testResults.filter(r => r.status === 'pending').length;
    
    setScoreMatrix({
      success,
      warning,
      error,
      pending,
      total: testResults.length
    });
  }, [testResults]);

  const runTests = async () => {
    setIsLoading(true);
    
    // Reset test status to pending
    setTestResults(prev => prev.map(test => ({
      ...test,
      status: 'pending',
      message: 'Test in progress...'
    })));
    
    try {
      // Run API Configuration test
      updateTestResult(0, "pending", "Running API configuration test...");
      const configTest = await pragmaticPlayService.validateConfig();
      updateTestResult(0, 
        configTest.valid ? "success" : "error",
        configTest.valid ? "API configuration is valid" : "Invalid API configuration",
        configTest.details
      );
      
      // Short delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Run API Connectivity test
      updateTestResult(1, "pending", "Testing API connectivity...");
      const apiTest = await pragmaticPlayService.testApiConnection();
      updateTestResult(1, 
        apiTest.success ? "success" : "error",
        apiTest.message,
        apiTest.details
      );
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Run Game Launch test
      updateTestResult(2, "pending", "Testing game launch functionality...");
      const launchTest = await pragmaticPlayService.testLaunchGame();
      updateTestResult(2, 
        launchTest.success ? "success" : launchTest.message.includes("demo") ? "warning" : "error",
        launchTest.message,
        launchTest.details
      );
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Run Seamless Wallet test
      updateTestResult(3, "pending", "Testing seamless wallet integration...");
      const walletTest = await pragmaticPlayService.testWalletCallback();
      updateTestResult(3, 
        walletTest.success ? "success" : "error",
        walletTest.message,
        walletTest.details
      );
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Run Idempotency test
      updateTestResult(4, "pending", "Testing transaction idempotency...");
      const idempotencyTest = await pragmaticPlayService.testIdempotency();
      updateTestResult(4, 
        idempotencyTest.success ? "success" : idempotencyTest.message.includes("partial") ? "warning" : "error",
        idempotencyTest.message,
        idempotencyTest.details
      );
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Run Transaction Verification test
      updateTestResult(5, "pending", "Testing transaction verification...");
      const verificationTest = await pragmaticPlayService.testTransactionVerification();
      updateTestResult(5, 
        verificationTest.success ? "success" : "error",
        verificationTest.message,
        verificationTest.details
      );
      
      setLastUpdated(new Date());
      toast.success("Integration tests completed");
    } catch (error: any) {
      console.error("Error running tests:", error);
      toast.error(`Error running tests: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTestResult = (index: number, status: 'success' | 'warning' | 'error' | 'pending', message: string, details?: string) => {
    setTestResults(prev => {
      const newResults = [...prev];
      newResults[index] = {
        ...newResults[index],
        status,
        message,
        details
      };
      return newResults;
    });
  };

  const generateReport = () => {
    const reportText = `
Pragmatic Play Integration Test Report
Generated: ${new Date().toLocaleString()}

Overall Status: ${scoreMatrix.success === scoreMatrix.total ? 'SUCCESS' : scoreMatrix.error > 0 ? 'ERROR' : 'WARNING'}
Success Rate: ${Math.round((scoreMatrix.success / scoreMatrix.total) * 100)}%

Test Results:
${testResults.map(test => `
${test.name}: ${test.status.toUpperCase()}
Message: ${test.message}
${test.details ? `Details: ${test.details}` : ''}
`).join('\n')}
    `;

    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `pp-integration-report-${new Date().toISOString().split("T")[0]}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Integration report downloaded");
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Integration Report</CardTitle>
            <CardDescription>
              Comprehensive report of your Pragmatic Play integration
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={runTests}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-1" />
              )}
              {isLoading ? "Running Tests..." : "Run Tests"}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={generateReport}
              disabled={scoreMatrix.pending > 0 || isLoading}
            >
              <Download className="h-4 w-4 mr-1" />
              Download Report
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6 bg-slate-900 p-4 rounded-md">
          <div className="flex justify-between mb-2">
            <h3 className="text-sm font-medium">Integration Health</h3>
            <span className="text-xs text-slate-400">
              {lastUpdated ? `Last updated: ${lastUpdated.toLocaleString()}` : 'Not tested yet'}
            </span>
          </div>
          
          <Progress 
            value={(scoreMatrix.success / scoreMatrix.total) * 100} 
            className="h-2 mb-3"
          />
          
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-slate-800 rounded p-2">
              <div className="text-green-400 font-medium">{scoreMatrix.success}</div>
              <div className="text-xs text-slate-400">Passed</div>
            </div>
            <div className="bg-slate-800 rounded p-2">
              <div className="text-yellow-400 font-medium">{scoreMatrix.warning}</div>
              <div className="text-xs text-slate-400">Warnings</div>
            </div>
            <div className="bg-slate-800 rounded p-2">
              <div className="text-red-400 font-medium">{scoreMatrix.error}</div>
              <div className="text-xs text-slate-400">Errors</div>
            </div>
            <div className="bg-slate-800 rounded p-2">
              <div className="text-slate-400 font-medium">{scoreMatrix.pending}</div>
              <div className="text-xs text-slate-400">Pending</div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          {testResults.map((test, index) => (
            <div 
              key={index} 
              className="bg-slate-900 p-3 rounded-md border-l-4"
              style={{ 
                borderLeftColor: 
                  test.status === 'success' ? '#10b981' : 
                  test.status === 'warning' ? '#f59e0b' : 
                  test.status === 'error' ? '#ef4444' : 
                  '#6b7280'
              }}
            >
              <div className="flex items-center mb-1">
                {test.status === 'success' && <CheckCircle className="h-4 w-4 text-green-500 mr-2" />}
                {test.status === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />}
                {test.status === 'error' && <XCircle className="h-4 w-4 text-red-500 mr-2" />}
                {test.status === 'pending' && <Loader2 className="h-4 w-4 text-slate-500 mr-2 animate-spin" />}
                
                <h3 className="font-medium">{test.name}</h3>
                
                <Badge 
                  className={`ml-auto ${
                    test.status === 'success' ? 'bg-green-600 hover:bg-green-700' :
                    test.status === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700' :
                    test.status === 'error' ? 'bg-red-600 hover:bg-red-700' :
                    'bg-slate-600 hover:bg-slate-700'
                  }`}
                >
                  {test.status}
                </Badge>
              </div>
              
              <p className="text-sm text-slate-300">{test.message}</p>
              
              {test.details && (
                <div className="mt-2 p-2 bg-slate-950 rounded text-xs overflow-hidden">
                  <pre className="font-mono whitespace-pre-wrap text-slate-300">{test.details}</pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PPIntegrationReport;
