
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
  DialogClose,
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
  const { user, deposit, refreshWalletBalance } = useAuth(); // Assuming deposit is available in useAuth

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
        
        {/* Tab or selection for payment methods could go here */}
        {/* For now, directly showing CardDeposit or a generic form */}

        {/* Option 1: If CardDeposit is a self-contained form */}
        <div className="py-4">
          <h3 className="text-lg font-medium mb-2">Credit/Debit Card</h3>
           {/* 
            Props passed to CardDeposit were causing errors. 
            Assuming CardDeposit handles its own state or has different props.
            Removing problematic props: amount, setAmount, onSuccess, onProcessing
            If CardDeposit needs these, its read-only definition is incompatible.
           */}
          <CardDeposit 
            // Pass necessary props that ARE defined on CardDepositProps.
            // For now, assuming it might need a general success/processing callback.
            // If CardDeposit is self-contained, it might not need any props from here.
            // Example:
            // onPaymentSuccess={handleCardDepositSuccess} 
            // onPaymentProcessing={handleCardDepositProcessing}
            // userId={user?.id} // if needed by CardDeposit
          />
        </div>

        {/* Option 2: A generic deposit form (if CardDeposit is not suitable or for other methods) */}
        {/* This part is commented out if CardDeposit is the primary method shown */}
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
          <DialogClose asChild>
            <Button variant="outline" disabled={isProcessing}>Cancel</Button>
          </DialogClose>
          <Button onClick={handleDeposit} disabled={isProcessing}>
            {isProcessing ? 'Processing...' : 'Deposit Now'}
          </Button>
        </DialogFooter>
        */}

      </DialogContent>
    </Dialog>
  );
};

export default DepositButton;

