
// Updating the import at the top of the file
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Check, X, AlertTriangle } from "lucide-react";
import { pragmaticPlayService } from "@/services/pragmaticPlayService";
import { SUPPORTED_CURRENCIES, SUPPORTED_LANGUAGES } from "@/constants/integrationsData";
import CurrencyLanguageSelector from "./CurrencyLanguageSelector";

interface PPApiValidatorProps {
  addLog?: (message: string) => void;
}

const PPApiValidator = ({ addLog = () => {} }: PPApiValidatorProps) => {
  const [isValidating, setIsValidating] = useState(false);
  const [results, setResults] = useState<{ test: string; success: boolean; message: string; }[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  const runAllTests = async () => {
    setIsValidating(true);
    addLog("Starting API validation tests...");
    setResults([]);
    
    try {
      // Test API configuration
      const configTest = await pragmaticPlayService.validateConfig();
      setResults(prev => [...prev, { 
        test: "API Configuration", 
        success: configTest.success, 
        message: configTest.message 
      }]);
      addLog(`API Configuration test: ${configTest.success ? 'Pass' : 'Fail'} - ${configTest.message}`);
      
      // Test API connectivity
      const connectivityTest = await pragmaticPlayService.testApiConnection();
      setResults(prev => [...prev, { 
        test: "API Connectivity", 
        success: connectivityTest.success, 
        message: connectivityTest.message 
      }]);
      addLog(`API Connectivity test: ${connectivityTest.success ? 'Pass' : 'Fail'} - ${connectivityTest.message}`);
      
      // Test game launching
      const launchTest = await pragmaticPlayService.testLaunchGame();
      setResults(prev => [...prev, { 
        test: "Game Launch", 
        success: launchTest.success, 
        message: launchTest.message 
      }]);
      addLog(`Game Launch test: ${launchTest.success ? 'Pass' : 'Fail'} - ${launchTest.message}`);
      
      // Test wallet callback
      const walletTest = await pragmaticPlayService.testWalletCallback();
      setResults(prev => [...prev, { 
        test: "Wallet Callback", 
        success: walletTest.success, 
        message: walletTest.message 
      }]);
      addLog(`Wallet Callback test: ${walletTest.success ? 'Pass' : 'Fail'} - ${walletTest.message}`);
      
      // Test callback URL
      const callbackTest = await pragmaticPlayService.validateCallbackUrl();
      setResults(prev => [...prev, { 
        test: "Callback URL", 
        success: callbackTest.success, 
        message: callbackTest.message 
      }]);
      addLog(`Callback URL test: ${callbackTest.success ? 'Pass' : 'Fail'} - ${callbackTest.message}`);
      
      // Test idempotency
      const idempotencyTest = await pragmaticPlayService.testIdempotency();
      setResults(prev => [...prev, { 
        test: "Idempotency", 
        success: idempotencyTest.success, 
        message: idempotencyTest.message 
      }]);
      addLog(`Idempotency test: ${idempotencyTest.success ? 'Pass' : 'Fail'} - ${idempotencyTest.message}`);
      
      // Test currencies support
      const currenciesTestResult = {
        success: SUPPORTED_CURRENCIES.length > 0,
        message: `${SUPPORTED_CURRENCIES.length} currencies supported`
      };
      setResults(prev => [...prev, {
        test: "Currencies Support",
        success: currenciesTestResult.success,
        message: currenciesTestResult.message
      }]);
      addLog(`Currencies Support test: ${currenciesTestResult.success ? 'Pass' : 'Fail'} - ${currenciesTestResult.message}`);
      
      // Test languages support
      const languagesTestResult = {
        success: SUPPORTED_LANGUAGES.length > 0,
        message: `${SUPPORTED_LANGUAGES.length} languages supported`
      };
      setResults(prev => [...prev, {
        test: "Languages Support",
        success: languagesTestResult.success,
        message: languagesTestResult.message
      }]);
      addLog(`Languages Support test: ${languagesTestResult.success ? 'Pass' : 'Fail'} - ${languagesTestResult.message}`);
      
    } catch (error: any) {
      addLog(`Error during API validation: ${error.message}`);
    } finally {
      setIsValidating(false);
      addLog("API validation tests completed");
    }
  };

  const getOverallStatus = () => {
    if (results.length === 0) return null;
    
    const failedTests = results.filter(r => !r.success);
    
    if (failedTests.length === 0) {
      return { status: 'success', message: 'All tests passed' };
    } else if (failedTests.length <= 2) {
      return { status: 'warning', message: `${failedTests.length} tests failed` };
    } else {
      return { status: 'error', message: `${failedTests.length} tests failed` };
    }
  };

  const overallStatus = getOverallStatus();

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle>Pragmatic Play API Validator</CardTitle>
        <CardDescription>
          Validate your Pragmatic Play API integration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-md font-medium">API Tests</h3>
            <Button 
              onClick={runAllTests} 
              disabled={isValidating}
              variant="outline"
              size="sm"
            >
              {isValidating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running Tests...
                </>
              ) : 'Run All Tests'}
            </Button>
          </div>
          
          <CurrencyLanguageSelector
            selectedCurrency={selectedCurrency}
            onCurrencyChange={setSelectedCurrency}
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
          />
          
          {results.length > 0 && (
            <div className="mt-4 border-t border-slate-700 pt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-md font-medium">Test Results</h3>
                {overallStatus && (
                  <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${
                    overallStatus.status === 'success' ? 'bg-green-500/20 text-green-500' :
                    overallStatus.status === 'warning' ? 'bg-yellow-500/20 text-yellow-500' :
                    'bg-red-500/20 text-red-500'
                  }`}>
                    {overallStatus.status === 'success' ? (
                      <Check className="h-3 w-3 mr-1" />
                    ) : overallStatus.status === 'warning' ? (
                      <AlertTriangle className="h-3 w-3 mr-1" />
                    ) : (
                      <X className="h-3 w-3 mr-1" />
                    )}
                    {overallStatus.message}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                {results.map((result, index) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded flex justify-between items-center ${
                      result.success ? 'bg-green-500/10' : 'bg-red-500/10'
                    }`}
                  >
                    <div>
                      <div className="font-medium">{result.test}</div>
                      <div className="text-xs text-slate-400">{result.message}</div>
                    </div>
                    <div>
                      {result.success ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <X className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PPApiValidator;
