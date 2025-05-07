
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { CreditCard, Check } from "lucide-react";
import { motion } from "framer-motion";

interface CardDepositProps {
  amount: string;
  setAmount: (value: string) => void;
  onSuccess: () => void;
  onProcessing: (isProcessing: boolean) => void;
}

const CardDeposit = ({ amount, setAmount, onSuccess, onProcessing }: CardDepositProps) => {
  const { deposit, user } = useAuth();
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [nameOnCard, setNameOnCard] = useState("");
  const [saveCard, setSaveCard] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Predefined deposit amounts
  const depositAmounts = ["50", "100", "200", "500", "1000"];
  
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };
  
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    
    return v;
  };
  
  const handleAmountSelect = (selectedAmount: string) => {
    setAmount(selectedAmount);
  };
  
  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and one decimal point
    if (/^\d*\.?\d*$/.test(value) || value === '') {
      setAmount(value);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    if (!cardNumber || cardNumber.length < 16) {
      toast.error("Please enter a valid card number");
      return;
    }
    
    if (!expiryDate || expiryDate.length < 5) {
      toast.error("Please enter a valid expiry date");
      return;
    }
    
    if (!cvv || cvv.length < 3) {
      toast.error("Please enter a valid CVV");
      return;
    }
    
    if (!nameOnCard) {
      toast.error("Please enter the name on your card");
      return;
    }

    try {
      setIsProcessing(true);
      onProcessing(true);
      
      // Use the deposit function from auth context
      const result = await deposit(parseFloat(amount), "card");
      
      if (result.success) {
        setIsSuccess(true);
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else {
        throw new Error(result.error || "Transaction failed");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to process payment");
    } finally {
      setIsProcessing(false);
      onProcessing(false);
    }
  };
  
  if (isSuccess) {
    return (
      <motion.div 
        className="flex flex-col items-center justify-center py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
          <Check className="h-8 w-8 text-green-500" />
        </div>
        <h3 className="text-xl font-medium mb-2">Payment Successful!</h3>
        <p className="text-white/60 text-center mb-6">
          ${parseFloat(amount).toFixed(2)} has been added to your account.
        </p>
      </motion.div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="mb-4">
          <Label className="mb-2 block">Select Amount</Label>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {depositAmounts.map(amt => (
              <Button
                key={amt}
                type="button"
                variant={amount === amt ? "default" : "outline"}
                onClick={() => handleAmountSelect(amt)}
                className={amount === amt ? "bg-casino-thunder-green text-black" : ""}
              >
                ${amt}
              </Button>
            ))}
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50">$</span>
            <Input
              type="text"
              value={amount}
              onChange={handleCustomAmountChange}
              className="pl-7"
              placeholder="Custom amount"
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="cardNumber">Card Number</Label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4" />
            <Input
              id="cardNumber"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              className="pl-9"
              placeholder="1234 5678 9012 3456"
              maxLength={19}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="expiryDate">Expiry Date</Label>
            <Input
              id="expiryDate"
              value={expiryDate}
              onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
              placeholder="MM/YY"
              maxLength={5}
            />
          </div>
          <div>
            <Label htmlFor="cvv">CVV</Label>
            <Input
              id="cvv"
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="123"
              maxLength={4}
              type="password"
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="nameOnCard">Name on Card</Label>
          <Input
            id="nameOnCard"
            value={nameOnCard}
            onChange={(e) => setNameOnCard(e.target.value)}
            placeholder="John Doe"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="saveCard"
            checked={saveCard}
            onCheckedChange={setSaveCard}
          />
          <Label htmlFor="saveCard" className="text-sm">Save this card for future payments</Label>
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <div className="mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              Processing...
            </>
          ) : (
            `Deposit $${parseFloat(amount || "0").toFixed(2)}`
          )}
        </Button>
      </div>
    </form>
  );
};

export default CardDeposit;
