
import { useState } from 'react';
import { adminService } from '@/services/adminService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface TransactionRollbackProps {
  transactionId: string;
  onSuccess?: () => void;
}

export function TransactionRollback({ transactionId, onSuccess }: TransactionRollbackProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRollback = async () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for the rollback');
      return;
    }

    try {
      setLoading(true);
      await adminService.rollbackTransaction(transactionId, reason);
      toast.success('Transaction successfully rolled back');
      setOpen(false);
      setReason('');
      onSuccess?.();
    } catch (error: any) {
      console.error('Error rolling back transaction:', error);
      toast.error(error.message || 'Failed to rollback transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <RotateCcw className="h-4 w-4 mr-2" />
          Rollback
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            Rollback Transaction
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Transaction ID</label>
            <Input value={transactionId} disabled />
          </div>
          
          <div>
            <label className="text-sm font-medium">Reason for Rollback *</label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this transaction needs to be rolled back..."
              className="mt-1"
            />
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <p className="text-sm text-red-800">
              <strong>Warning:</strong> This action will reverse the transaction and update the user's wallet balance. 
              This cannot be undone and will be logged in the audit trail.
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Button
              onClick={handleRollback}
              disabled={loading || !reason.trim()}
              variant="destructive"
              className="flex-1"
            >
              {loading ? 'Processing...' : 'Confirm Rollback'}
            </Button>
            <Button
              onClick={() => setOpen(false)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
