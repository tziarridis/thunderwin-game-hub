
// Updating the import at the top of the file
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, X, AlertTriangle, Download, RefreshCcw, Globe, Coins, Languages } from "lucide-react";
import { pragmaticPlayService } from "@/services/pragmaticPlayService";
import { SUPPORTED_CURRENCIES, SUPPORTED_LANGUAGES } from "@/constants/integrationsData";

interface PPIntegrationReportProps {
  status: 'success' | 'warning' | 'error' | 'pending';
}

interface IntegrationTestResult {
  name: string;
  success: boolean;
  message: string;
  details?: string;
}

const PPIntegrationReport = ({ status }: PPIntegrationReportProps) => {
  const [testResults, setTestResults] = useState<IntegrationTestResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  useEffect(() => {
    // Generate report on initial load
    generateReport();
  }, []);
  
  const generateReport = async () => {
    setIsGenerating(true);
    
    try {
      const results: IntegrationTestResult[] = [];
      
      // API configuration
      const configTest = await pragmaticPlayService.validateConfig();
      results.push({
        name: "API Configuration",
        success: configTest.success,
        message: configTest.message,
        details: configTest.details
      });
      
      // API connectivity
      const apiTest = await pragmaticPlayService.testApiConnection();
      results.push({
        name: "API Connectivity",
        success: apiTest.success,
        message: apiTest.message,
        details: apiTest.details
      });
      
      // Callback URL
      const callbackTest = await pragmaticPlayService.validateCallbackUrl();
      results.push({
        name: "Callback URL",
        success: callbackTest.success,
        message: callbackTest.message,
        details: callbackTest.details
      });
      
      // Game launch
      const launchTest = await pragmaticPlayService.testLaunchGame();
      results.push({
        name: "Game Launch",
        success: launchTest.success,
        message: launchTest.message
      });
      
      // Wallet integration
      const walletTest = await pragmaticPlayService.testWalletCallback();
      results.push({
        name: "Wallet Integration",
        success: walletTest.success,
        message: walletTest.message
      });
      
      // Idempotency
      const idempotencyTest = await pragmaticPlayService.testIdempotency();
      results.push({
        name: "Transaction Idempotency",
        success: idempotencyTest.success,
        message: idempotencyTest.message
      });
      
      // Currencies support
      results.push({
        name: "Currencies Support",
        success: SUPPORTED_CURRENCIES.length > 0,
        message: `${SUPPORTED_CURRENCIES.length} currencies supported`,
        details: SUPPORTED_CURRENCIES.slice(0, 5).map(c => c.code).join(', ') + (SUPPORTED_CURRENCIES.length > 5 ? ', ...' : '')
      });
      
      // Languages support
      results.push({
        name: "Languages Support",
        success: SUPPORTED_LANGUAGES.length > 0,
        message: `${SUPPORTED_LANGUAGES.length} languages supported`,
        details: SUPPORTED_LANGUAGES.slice(0, 5).map(l => l.code).join(', ') + (SUPPORTED_LANGUAGES.length > 5 ? ', ...' : '')
      });
      
      // Set the test results
      setTestResults(results);
      
      // Update timestamp
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const downloadReport = () => {
    // Create report content
    const reportDate = new Date().toLocaleString();
    let content = `# Pragmatic Play Integration Report\n`;
    content += `Generated: ${reportDate}\n\n`;
    
    content += `## Overall Status: ${status.toUpperCase()}\n\n`;
    
    content += `## Test Results:\n\n`;
    testResults.forEach(test => {
      content += `### ${test.name}\n`;
      content += `Status: ${test.success ? 'SUCCESS' : 'FAILED'}\n`;
      content += `Message: ${test.message}\n`;
      if (test.details) {
        content += `Details: ${test.details}\n`;
      }
      content += `\n`;
    });
    
    // Create and download the file
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pp-integration-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const getStatusIcon = (isSuccess: boolean) => {
    return isSuccess ? (
      <Check className="h-5 w-5 text-green-500" />
    ) : (
      <X className="h-5 w-5 text-red-500" />
    );
  };
  
  const getOverallSummary = () => {
    const passedTests = testResults.filter(t => t.success).length;
    const totalTests = testResults.length;
    
    let statusText = '';
    let statusIcon = null;
    let alertColor = '';
    
    if (totalTests === 0) {
      return null;
    }
    
    if (passedTests === totalTests) {
      statusText = `All tests passed (${passedTests}/${totalTests})`;
      statusIcon = <Check className="h-5 w-5" />;
      alertColor = 'bg-green-500/10 text-green-500 border-green-500/50';
    } else if (passedTests >= totalTests * 0.7) {
      statusText = `${passedTests}/${totalTests} tests passed, minor issues detected`;
      statusIcon = <AlertTriangle className="h-5 w-5" />;
      alertColor = 'bg-yellow-500/10 text-yellow-500 border-yellow-500/50';
    } else {
      statusText = `Only ${passedTests}/${totalTests} tests passed, critical issues detected`;
      statusIcon = <X className="h-5 w-5" />;
      alertColor = 'bg-red-500/10 text-red-500 border-red-500/50';
    }
    
    return (
      <Alert className={`mb-4 ${alertColor}`}>
        <AlertDescription className="flex items-center">
          {statusIcon}
          <span className="ml-2">{statusText}</span>
        </AlertDescription>
      </Alert>
    );
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
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={generateReport}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <RefreshCcw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="h-4 w-4" />
              )}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={downloadReport}
              disabled={testResults.length === 0}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {lastUpdated && (
          <p className="text-xs text-slate-400 mb-3">
            Last updated: {lastUpdated.toLocaleString()}
          </p>
        )}
        
        {getOverallSummary()}
        
        {isGenerating ? (
          <div className="py-8 text-center">
            <RefreshCcw className="h-8 w-8 animate-spin mx-auto mb-4 text-slate-400" />
            <p className="text-slate-400">Generating integration report...</p>
          </div>
        ) : testResults.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead>Test</TableHead>
                  <TableHead>Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testResults.map((test, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex justify-center">
                        {getStatusIcon(test.success)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        {test.name === "API Configuration" && <Globe className="h-4 w-4 mr-2 text-blue-400" />}
                        {test.name === "Currencies Support" && <Coins className="h-4 w-4 mr-2 text-yellow-400" />}
                        {test.name === "Languages Support" && <Languages className="h-4 w-4 mr-2 text-green-400" />}
                        {test.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs">
                        <div className={test.success ? 'text-green-400' : 'text-red-400'}>
                          {test.message}
                        </div>
                        {test.details && (
                          <div className="text-slate-400 mt-1">
                            {test.details}
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="py-8 text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-slate-400" />
            <p className="text-slate-400">No report data available. Click the refresh button to generate a report.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PPIntegrationReport;
