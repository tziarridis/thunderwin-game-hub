
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Check } from "lucide-react";

interface CardDepositProps {
  amount: string;
  setAmount: (value: string) => void;
  onSuccess?: () => void;
  onProcessing?: (isProcessing: boolean) => void;
}

const CardDeposit = ({ amount, setAmount, onSuccess, onProcessing }: CardDepositProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user, deposit } = useAuth();
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardholderName, setCardholderName] = useState("");

  const quickAmounts = [50, 100, 250, 500];
  
  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  const handleDeposit = async () => {
    if (!user?.id) {
      toast.error("User ID not found");
      return;
    }
    
    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    // Simple validation
    if (cardNumber.replace(/\s/g, '').length !== 16) {
      toast.error("Please enter a valid card number");
      return;
    }
    
    if (expiryDate.length !== 5) {
      toast.error("Please enter a valid expiry date (MM/YY)");
      return;
    }
    
    if (cvv.length !== 3) {
      toast.error("Please enter a valid CVV");
      return;
    }
    
    if (cardholderName.length < 3) {
      toast.error("Please enter the cardholder name");
      return;
    }
    
    setIsProcessing(true);
    if (onProcessing) onProcessing(true);
    
    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Call the deposit function from AuthContext
      await deposit(depositAmount);
      
      toast.success(`Successfully deposited $${depositAmount.toFixed(2)}`);
      
      // Clear form
      setCardNumber("");
      setExpiryDate("");
      setCvv("");
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Card deposit error:", error);
      toast.error("Failed to process credit card payment");
    } finally {
      setIsProcessing(false);
      if (onProcessing) onProcessing(false);
    }
  };
  
  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };
  
  // Format expiry date
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    
    return v;
  };

  return (
    <div className="space-y-4">
      {/* Amount Selection */}
      <div className="space-y-2">
        <Label htmlFor="amount" className="text-white font-medium">
          Select Amount
        </Label>
        <div className="grid grid-cols-4 gap-2">
          {quickAmounts.map((quickAmount) => (
            <Button 
              key={quickAmount}
              type="button"
              variant="outline" 
              onClick={() => handleQuickAmount(quickAmount)}
              className={`${
                amount === quickAmount.toString() 
                  ? 'bg-casino-thunder-green/20 border-casino-thunder-green text-white' 
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              } transition-all`}
            >
              ${quickAmount}
            </Button>
          ))}
        </div>
        
        <div className="relative mt-2">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70">$</span>
          <Input
            id="custom-amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
            min="10"
            step="5"
            placeholder="Enter amount"
            className="pl-8 bg-casino-thunder-gray/30 border-white/10 focus:border-casino-thunder-green"
          />
        </div>
      </div>
      
      {/* Card details */}
      <div className="space-y-3">
        <div>
          <Label htmlFor="cardNumber" className="text-white font-medium">Card Number</Label>
          <Input
            id="cardNumber"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            maxLength={19}
            placeholder="1234 5678 9012 3456"
            className="bg-casino-thunder-gray/30 border-white/10 focus:border-casino-thunder-green"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="expiryDate" className="text-white font-medium">Expiry Date</Label>
            <Input
              id="expiryDate"
              value={expiryDate}
              onChange={(e) => {
                if (e.target.value.length <= 5) {
                  setExpiryDate(formatExpiryDate(e.target.value));
                }
              }}
              maxLength={5}
              placeholder="MM/YY"
              className="bg-casino-thunder-gray/30 border-white/10 focus:border-casino-thunder-green"
            />
          </div>
          <div>
            <Label htmlFor="cvv" className="text-white font-medium">CVV</Label>
            <Input
              id="cvv"
              value={cvv}
              onChange={(e) => {
                if (/^\d*$/.test(e.target.value) && e.target.value.length <= 3) {
                  setCvv(e.target.value);
                }
              }}
              maxLength={3}
              placeholder="123"
              className="bg-casino-thunder-gray/30 border-white/10 focus:border-casino-thunder-green"
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="cardholderName" className="text-white font-medium">Cardholder Name</Label>
          <Input
            id="cardholderName"
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
            placeholder="John Doe"
            className="bg-casino-thunder-gray/30 border-white/10 focus:border-casino-thunder-green"
          />
        </div>
      </div>
      
      {/* Security note */}
      <div className="bg-white/5 p-3 rounded-md text-xs text-white/70 flex items-start">
        <span className="bg-green-500/20 p-1 rounded mr-2 mt-0.5">
          <Check className="h-3 w-3 text-green-500" />
        </span>
        <p>
          All transactions are secure and encrypted. Your financial information is never stored on our servers.
        </p>
      </div>
      
      {/* Submit button */}
      <Button 
        onClick={handleDeposit}
        disabled={isProcessing}
        className="w-full bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black font-medium py-5"
      >
        {isProcessing ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </>
        ) : (
          `Deposit ${parseFloat(amount) > 0 ? `$${parseFloat(amount).toFixed(2)}` : "$0.00"}`
        )}
      </Button>
    </div>
  );
};

export default CardDeposit;
