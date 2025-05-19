import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Wallet } from 'lucide-react';
import { toast } from 'sonner';

interface DepositButtonProps extends ButtonProps {
  // Add any specific props if needed
}

const DepositButton: React.FC<DepositButtonProps> = (props) => {
  const { isAuthenticated, deposit, user } = useAuth();
  const navigate = useNavigate();

  const handleDepositClick = () => {
    if (!isAuthenticated) {
      toast.error("Please log in to make a deposit.");
      navigate('/auth/login'); // Redirect to login if not authenticated
      return;
    }
    
    if (deposit) {
      deposit(); // Call the deposit function from context
    } else {
        // Fallback if deposit function isn't implemented in context yet,
        // or navigate to a deposit page.
        navigate('/wallet/deposit'); // Example navigation
    }
  };

  return (
    <Button onClick={handleDepositClick} {...props}>
      <Wallet className="mr-2 h-4 w-4" /> {/* Example Icon */}
      {props.children || 'Deposit'}
    </Button>
  );
};

export default DepositButton;
