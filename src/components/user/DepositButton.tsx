import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  // DialogClose, // Not exported or not needed if using button to close
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import CardDeposit from './CardDeposit'; // This component is read-only
import { Wallet } from 'lucide-react';

// Assuming CardDepositProps is defined in the read-only CardDeposit.tsx
// We cannot see it, so we define what DepositButton needs or remove problematic props
interface DepositButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | null | undefined;
  size?: "default" | "sm" | "lg" | "icon" | null | undefined;
  className?: string;
  onDepositSuccess?: () => void;
}

const DepositButton: React.FC<DepositButtonProps> = ({ variant = "default", size="sm", className, onDepositSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { user, deposit, refreshWalletBalance } = useAuth();

  const handleDeposit = async () => {
    if (!user) {
      toast.error("You must be logged in to deposit.");
      return;
    }
    if (!deposit) {
      toast.error("Deposit functionality is not available.");
      console.error("Deposit function is missing from AuthContext");
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    setIsProcessing(true);
    toast.info("Processing deposit...");

    try {
      // This is a generic deposit call, CardDeposit component might handle specifics
      // For now, we assume a general deposit function exists in auth context.
      // If CardDeposit is meant to handle the entire flow, this logic might be different.
      const success = await deposit(numericAmount, user.currency || 'USD', 'card'); // 'card' is a placeholder
      
      if (success) {
        toast.success("Deposit successful!");
        setAmount('');
        setIsOpen(false);
        if (onDepositSuccess) {
          onDepositSuccess();
        }
        await refreshWalletBalance();
      } else {
        toast.error("Deposit failed. Please try again.");
      }
    } catch (error: any) {
      console.error("Deposit error:", error);
      toast.error(error.message || "An unexpected error occurred during deposit.");
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleCardDepositSuccess = async () => {
    toast.success("Card deposit successful!");
    setAmount(''); // Clear amount if CardDeposit handles its own amount input
    setIsOpen(false);
    if (onDepositSuccess) {
      onDepositSuccess();
    }
    await refreshWalletBalance();
  };

  const handleCardDepositProcessing = (processing: boolean) => {
    setIsProcessing(processing);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Wallet className="mr-2 h-4 w-4" />
          Deposit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Deposit Funds</DialogTitle>
          <DialogDescription>
            Choose your deposit method. Your current balance will be updated upon successful deposit.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <h3 className="text-lg font-medium mb-2">Credit/Debit Card</h3>
          <CardDeposit 
            // Pass necessary props that ARE defined on CardDepositProps.
            // Example:
            // onPaymentSuccess={handleCardDepositSuccess} 
            // onPaymentProcessing={handleCardDepositProcessing}
            // userId={user?.id} 
          />
        </div>
        
        {/* Fallback generic deposit form if CardDeposit is not fully handling it, or for other methods */}
        {/* This part can be enabled if needed. For now, CardDeposit is primary. */}
        {/* 
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount
            </Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="col-span-3"
              placeholder={user?.currency ? `Amount in ${user.currency}` : "Amount"}
              disabled={isProcessing}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" disabled={isProcessing} onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button onClick={handleDeposit} disabled={isProcessing}>
            {isProcessing ? 'Processing...' : 'Deposit Now'}
          </Button>
        </DialogFooter>
        */}
         <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isProcessing}>
            Cancel
          </Button>
          {/* If CardDeposit has its own submit button, this might not be needed */}
           {/* <Button onClick={handleDeposit} disabled={isProcessing}>
            {isProcessing ? 'Processing...' : 'Deposit Now'}
          </Button>  */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DepositButton;
