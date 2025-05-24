
import { useState, useEffect } from 'react';
import { adminService } from '@/services/adminService';
import { AuditLog } from '@/types/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, RefreshCw } from 'lucide-react';

export function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    resourceType: '',
    action: '',
    userId: '',
    limit: 50
  });

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAuditLogs({
        resourceType: filters.resourceType || undefined,
        action: filters.action || undefined,
        userId: filters.userId || undefined,
        limit: filters.limit
      });
      setLogs(data);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getActionBadgeVariant = (action: string) => {
    switch (action.toLowerCase()) {
      case 'insert': return 'default';
      case 'update': return 'secondary';
      case 'delete': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Audit Logs</span>
          <Button onClick={fetchLogs} disabled={loading} size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Select onValueChange={(value) => handleFilterChange('resourceType', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Resource Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="users">Users</SelectItem>
              <SelectItem value="wallets">Wallets</SelectItem>
              <SelectItem value="transactions">Transactions</SelectItem>
              <SelectItem value="games">Games</SelectItem>
              <SelectItem value="providers">Providers</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={(value) => handleFilterChange('action', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Actions</SelectItem>
              <SelectItem value="INSERT">Insert</SelectItem>
              <SelectItem value="UPDATE">Update</SelectItem>
              <SelectItem value="DELETE">Delete</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="User ID"
            value={filters.userId}
            onChange={(e) => handleFilterChange('userId', e.target.value)}
          />

          <Button onClick={fetchLogs} className="w-full">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant={getActionBadgeVariant(log.action)}>
                      {log.action}
                    </Badge>
                    <span className="font-medium">{log.resource_type}</span>
                    {log.resource_id && (
                      <span className="text-sm text-gray-500">ID: {log.resource_id.substring(0, 8)}...</span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>

                {log.user_id && (
                  <div className="text-sm text-gray-600">
                    User: {log.user_id.substring(0, 8)}...
                  </div>
                )}

                {(log.old_values || log.new_values) && (
                  <details className="text-sm">
                    <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                      View Details
                    </summary>
                    <div className="mt-2 bg-gray-50 p-2 rounded">
                      {log.old_values && (
                        <div>
                          <strong>Before:</strong>
                          <pre className="text-xs mt-1 overflow-x-auto">
                            {JSON.stringify(log.old_values, null, 2)}
                          </pre>
                        </div>
                      )}
                      {log.new_values && (
                        <div className="mt-2">
                          <strong>After:</strong>
                          <pre className="text-xs mt-1 overflow-x-auto">
                            {JSON.stringify(log.new_values, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                )}
              </div>
            ))}

            {logs.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No audit logs found
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
