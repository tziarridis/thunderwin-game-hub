
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Check, X, AlertCircle, FileDown, RefreshCw } from 'lucide-react';
import { runProductionChecks, validateProductionEnvironment } from '@/utils/productionChecks';
import { toast } from 'sonner';

interface CheckItemProps {
  success: boolean;
  message: string;
  details?: string;
}

const CheckItem = ({ success, message, details }: CheckItemProps) => (
  <div className="flex items-start space-x-3 py-2">
    <div className={`mt-0.5 flex-shrink-0 ${success ? 'text-green-500' : 'text-red-500'}`}>
      {success ? <Check size={20} /> : <X size={20} />}
    </div>
    <div>
      <p className="font-medium">{message}</p>
      {details && <p className="text-sm text-white/70 mt-1">{details}</p>}
    </div>
  </div>
);

const ProductionReadinessCheck = () => {
  const [checkResults, setCheckResults] = useState<Array<{success: boolean; message: string; details?: string}>>([]);
  const [loading, setLoading] = useState(false);
  const [environmentValidation, setEnvironmentValidation] = useState<{valid: boolean; issues: string[]}>({ valid: true, issues: [] });
  
  const handleRunChecks = async () => {
    setLoading(true);
    
    try {
      // Run environment validation
      const envResult = validateProductionEnvironment();
      setEnvironmentValidation(envResult);
      
      // Run dynamic checks
      const results = await runProductionChecks();
      setCheckResults(results);
      
      toast.success("Production readiness checks completed");
    } catch (error: any) {
      toast.error("Error running checks: " + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const generateReport = () => {
    // Create a report from the check results
    const timestamp = new Date().toISOString();
    let reportContent = `# ThunderWin Casino Production Readiness Report\n`;
    reportContent += `Generated: ${timestamp}\n\n`;
    
    reportContent += `## Environment Validation\n`;
    reportContent += `Valid: ${environmentValidation.valid ? 'Yes' : 'No'}\n`;
    
    if (environmentValidation.issues.length > 0) {
      reportContent += `Issues:\n`;
      environmentValidation.issues.forEach(issue => {
        reportContent += `- ${issue}\n`;
      });
    }
    
    reportContent += `\n## Dynamic Checks\n`;
    checkResults.forEach(check => {
      reportContent += `- [${check.success ? 'PASS' : 'FAIL'}] ${check.message}\n`;
      if (check.details) {
        reportContent += `  Details: ${check.details}\n`;
      }
    });
    
    // Create download link
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `casino-production-readiness-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Production readiness report downloaded");
  };
  
  const checksSuccessCount = checkResults.filter(c => c.success).length;
  const checksTotal = checkResults.length;
  const allPassed = checksSuccessCount === checksTotal && environmentValidation.valid;
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Production Readiness Check</CardTitle>
        <CardDescription>
          Check if the casino is ready for production deployment
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Environment Validation Section */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Environment Validation</h3>
          
          {environmentValidation.issues.length > 0 ? (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Configuration Issues</AlertTitle>
              <AlertDescription>
                <ul className="list-disc pl-5 mt-2">
                  {environmentValidation.issues.map((issue, i) => (
                    <li key={i}>{issue}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          ) : environmentValidation.valid ? (
            <Alert className="bg-green-900/20 border-green-800 text-green-500 mb-4">
              <Check className="h-4 w-4" />
              <AlertTitle>Environment is properly configured</AlertTitle>
              <AlertDescription>
                All production configuration settings are valid
              </AlertDescription>
            </Alert>
          ) : null}
        </div>
        
        {/* Dynamic Checks Section */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Dynamic Checks</h3>
          
          {checkResults.length > 0 ? (
            <>
              <div className="mb-4">
                <p>
                  {checksSuccessCount} of {checksTotal} checks passed
                  {allPassed && " - All checks passed successfully!"}
                </p>
                
                <div className="w-full bg-white/10 rounded-full h-2.5 mt-2">
                  <div 
                    className={`h-2.5 rounded-full ${allPassed ? 'bg-green-500' : 'bg-amber-500'}`}
                    style={{ width: `${(checksSuccessCount / checksTotal) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {checkResults.map((result, index) => (
                  <CheckItem
                    key={index}
                    success={result.success}
                    message={result.message}
                    details={result.details}
                  />
                ))}
              </div>
            </>
          ) : (
            <p className="text-white/70">Run the checks to see results</p>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button
          onClick={handleRunChecks}
          disabled={loading}
          className="w-32"
        >
          {loading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Running...
            </>
          ) : (
            'Run Checks'
          )}
        </Button>
        
        <Button
          variant="outline"
          onClick={generateReport}
          disabled={checkResults.length === 0}
          className="w-36"
        >
          <FileDown className="mr-2 h-4 w-4" />
          Save Report
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductionReadinessCheck;
