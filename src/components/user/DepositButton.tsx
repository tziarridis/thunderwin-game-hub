
import React from 'react';
import { Button } from '@/components/ui/button';
import { DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DepositButton = () => {
  const navigate = useNavigate();
  
  const handleDeposit = () => {
    navigate('/profile/deposit');
  };

  return (
    <Button 
      onClick={handleDeposit}
      variant="outline" 
      className="flex items-center gap-1 text-sm"
    >
      <DollarSign className="h-4 w-4" />
      Deposit
    </Button>
  );
};

export default DepositButton;
