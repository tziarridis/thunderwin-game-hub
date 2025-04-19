
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Database, RefreshCcw, Loader2, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { gameAggregatorDbService } from "@/services/gameAggregatorDbService";
import { toast } from "sonner";

interface TableStatus {
  name: string;
  exists: boolean;
  records?: number;
  status: 'checking' | 'ok' | 'warning' | 'error';
  message?: string;
}

const DatabaseManager = () => {
  const [tables, setTables] = useState<TableStatus[]>([
    { name: 'games', exists: false, status: 'checking' },
    { name: 'providers', exists: false, status: 'checking' },
    { name: 'transactions', exists: false, status: 'checking' },
    { name: 'player_wallets', exists: false, status: 'checking' }
  ]);
  const [isChecking, setIsChecking] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    checkTables();
  }, []);

  const checkTables = async () => {
    setIsChecking(true);
    
    try {
      // For browser environment, we'll simulate table checks
      // In a real implementation, this would check the database structure
      
      setTables(prev => prev.map(table => ({
        ...table,
        status: 'checking'
      })));
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock table check results
      const mockResults = [
        { name: 'games', exists: true, records: 342, status: 'ok' as const },
        { name: 'providers', exists: true, records: 8, status: 'ok' as const },
        { name: 'transactions', exists: true, records: 156, status: 'ok' as const },
        { name: 'player_wallets', exists: true, records: 24, status: 'ok' as const }
      ];
      
      setTables(mockResults);
      toast.success("Database tables checked successfully");
    } catch (error: any) {
      console.error("Error checking tables:", error);
      toast.error(`Error checking tables: ${error.message}`);
      
      // Update tables with error status
      setTables(prev => prev.map(table => ({
        ...table,
        status: 'error' as const,
        message: 'Failed to check table status'
      })));
    } finally {
      setIsChecking(false);
    }
  };

  const createTables = async () => {
    setIsCreating(true);
    
    try {
      // Call the database service to create tables
      const result = await gameAggregatorDbService.ensureTables();
      
      if (result) {
        toast.success("Database tables created/updated successfully");
        checkTables(); // Refresh table status
      } else {
        toast.error("Failed to create/update tables");
      }
    } catch (error: any) {
      console.error("Error creating tables:", error);
      toast.error(`Error creating tables: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };
  
  const getStatusIcon = (status: TableStatus['status']) => {
    switch (status) {
      case 'checking':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-400" />;
      case 'ok':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-400" />;
    }
  };
  
  const getStatusBadge = (table: TableStatus) => {
    let badgeClass = "";
    let statusText = "";
    
    switch (table.status) {
      case 'checking':
        badgeClass = "bg-blue-500/20 text-blue-500";
        statusText = "Checking...";
        break;
      case 'ok':
        badgeClass = "bg-green-500/20 text-green-500";
        statusText = table.exists ? "OK" : "Not Found";
        break;
      case 'warning':
        badgeClass = "bg-yellow-500/20 text-yellow-500";
        statusText = "Warning";
        break;
      case 'error':
        badgeClass = "bg-red-500/20 text-red-500";
        statusText = "Error";
        break;
    }
    
    return (
      <Badge variant="outline" className={badgeClass}>
        <span className="flex items-center">
          {getStatusIcon(table.status)}
          <span className="ml-1">{statusText}</span>
        </span>
      </Badge>
    );
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Database Management</CardTitle>
            <CardDescription>
              Manage game aggregator database tables
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={checkTables}
              disabled={isChecking}
            >
              <RefreshCcw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
              Check Tables
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              onClick={createTables}
              disabled={isCreating}
            >
              <Database className="h-4 w-4 mr-2" />
              {isCreating ? 'Creating...' : 'Create/Update Tables'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4 bg-blue-500/10 text-blue-500 border-blue-500/50">
          <AlertDescription className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            This utility helps manage database tables for the game aggregator integration.
          </AlertDescription>
        </Alert>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Table Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Records</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tables.map((table) => (
                <TableRow key={table.name}>
                  <TableCell className="font-medium">{table.name}</TableCell>
                  <TableCell>{getStatusBadge(table)}</TableCell>
                  <TableCell>
                    {table.records !== undefined ? 
                      table.records.toLocaleString() : 
                      table.exists ? '0' : '-'}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-400">
                      {table.message || (table.exists ? 'Table exists in database' : 'Table not found in database')}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="mt-4 text-xs text-slate-400">
          <p>
            Note: In a production environment, database migrations would typically be handled 
            server-side using a proper migration framework.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DatabaseManager;
