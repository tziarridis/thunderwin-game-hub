
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { clientGamesApi } from '@/services/gamesService';
import { useToast } from '@/components/ui/use-toast';
import { availableProviders } from '@/config/gameProviders';

const GameAggregatorPage = () => {
  const [importing, setImporting] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<{
    providerId: string;
    success: boolean;
    count: number;
    message: string;
  } | null>(null);
  
  const { toast } = useToast();
  
  const handleImportGames = async (providerId: string) => {
    setImporting(providerId);
    setImportResult(null);
    
    try {
      // Call the importGames function from the service
      const importedCount = await clientGamesApi.importGames(providerId);
      
      // Set success result
      setImportResult({
        providerId,
        success: true,
        count: importedCount,
        message: `Successfully imported ${importedCount} games from provider`
      });
      
      toast({
        title: "Import Successful",
        description: `Imported ${importedCount} games from provider`,
      });
    } catch (error) {
      console.error("Import failed:", error);
      
      // Set error result
      setImportResult({
        providerId,
        success: false,
        count: 0,
        message: error instanceof Error ? error.message : "Unknown error occurred"
      });
      
      toast({
        title: "Import Failed",
        description: "Failed to import games. See console for details.",
        variant: "destructive"
      });
    } finally {
      setImporting(null);
    }
  };
  
  return (
    <div className="container p-6">
      <h1 className="text-3xl font-bold mb-6">Game Aggregator</h1>
      
      <Tabs defaultValue="import">
        <TabsList className="mb-4">
          <TabsTrigger value="import">Import Games</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="import">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableProviders.map((provider) => (
              <Card key={provider.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle>{provider.name}</CardTitle>
                  <CardDescription>Provider ID: {provider.id}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <Button 
                      variant="default" 
                      onClick={() => handleImportGames(provider.id)}
                      disabled={importing !== null}
                    >
                      {importing === provider.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Importing...
                        </>
                      ) : "Import Games"}
                    </Button>
                    
                    {importResult && importResult.providerId === provider.id && (
                      <div className="flex items-center ml-4">
                        {importResult.success ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                        )}
                        <span className="text-sm">
                          {importResult.success 
                            ? `Imported ${importResult.count} games` 
                            : "Import failed"}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Game Aggregator Settings</CardTitle>
              <CardDescription>Configure connections to game providers</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Settings content will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GameAggregatorPage;
