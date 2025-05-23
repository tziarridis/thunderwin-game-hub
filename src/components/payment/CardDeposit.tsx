
import React from 'react';
import { Button } from '@/components/ui/button';

interface CardDepositProps {
  amount: string;
  setAmount: React.Dispatch<React.SetStateAction<string>>;
  onSuccess: () => Promise<void>;
  onProcessing: (isProcessing: boolean) => void;
}

const CardDeposit: React.FC<CardDepositProps> = ({ 
  amount, 
  setAmount, 
  onSuccess, 
  onProcessing 
}) => {
  const handleDeposit = async () => {
    onProcessing(true);
    try {
      // Mock deposit logic
      await new Promise(resolve => setTimeout(resolve, 2000));
      await onSuccess();
    } catch (error) {
      console.error('Deposit failed:', error);
    } finally {
      onProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Enter amount"
        />
      </div>
      <Button onClick={handleDeposit} className="w-full">
        Deposit
      </Button>
    </div>
  );
};

export default CardDeposit;
