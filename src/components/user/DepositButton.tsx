import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, CreditCard, Landmark, Bitcoin, Banknote, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface DepositButtonProps {
  variant?: "default" | "small" | "icon" | "highlight";
  className?: string;
}

const DepositButton = ({ variant = "default", className = "" }: DepositButtonProps) => {
  const [amount, setAmount] = useState<string>("100");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>("card");
  const { isAuthenticated, deposit } = useAuth();
  const navigate = useNavigate();

  const handleDepositClick = () => {
    if (!isAuthenticated) {
      toast("Please log in to make a deposit");
      navigate("/login");
      return;
    }
  };

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  const handleDeposit = async () => {
    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    await deposit(depositAmount);
    toast.success(`Successfully deposited $${depositAmount.toFixed(2)}`);
    setIsDialogOpen(false);
  };

  if (variant === "small") {
    return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button size="sm" onClick={handleDepositClick} className={`bg-green-600 hover:bg-green-700 text-white ${className}`}>
            Deposit
          </Button>
        </DialogTrigger>
        <DepositDialogContent 
          amount={amount} 
          setAmount={setAmount} 
          handleQuickAmount={handleQuickAmount}
          handleDeposit={handleDeposit}
          selectedMethod={selectedMethod}
          setSelectedMethod={setSelectedMethod}
        />
      </Dialog>
    );
  }

  if (variant === "icon") {
    return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button size="icon" onClick={handleDepositClick} className={`bg-green-600 hover:bg-green-700 text-white rounded-full ${className}`}>
            <Wallet className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DepositDialogContent 
          amount={amount} 
          setAmount={setAmount} 
          handleQuickAmount={handleQuickAmount}
          handleDeposit={handleDeposit}
          selectedMethod={selectedMethod}
          setSelectedMethod={setSelectedMethod}
        />
      </Dialog>
    );
  }

  if (variant === "highlight") {
    return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button onClick={handleDepositClick} className={`bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black ${className}`}>
            Deposit Now
          </Button>
        </DialogTrigger>
        <DepositDialogContent 
          amount={amount} 
          setAmount={setAmount} 
          handleQuickAmount={handleQuickAmount}
          handleDeposit={handleDeposit}
          selectedMethod={selectedMethod}
          setSelectedMethod={setSelectedMethod}
        />
      </Dialog>
    );
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button onClick={handleDepositClick} className={`bg-green-600 hover:bg-green-700 text-white ${className}`}>
          Deposit
        </Button>
      </DialogTrigger>
      <DepositDialogContent 
        amount={amount} 
        setAmount={setAmount} 
        handleQuickAmount={handleQuickAmount}
        handleDeposit={handleDeposit}
        selectedMethod={selectedMethod}
        setSelectedMethod={setSelectedMethod}
      />
    </Dialog>
  );
};

interface DepositDialogContentProps {
  amount: string;
  setAmount: (value: string) => void;
  handleQuickAmount: (value: number) => void;
  handleDeposit: () => void;
  selectedMethod: string;
  setSelectedMethod: (method: string) => void;
}

const DepositDialogContent = ({ 
  amount, 
  setAmount, 
  handleQuickAmount,
  handleDeposit,
  selectedMethod,
  setSelectedMethod
}: DepositDialogContentProps) => {
  const quickAmounts = [50, 100, 250, 500];
  
  const paymentMethods = [
    { id: "card", name: "Card", icon: <CreditCard className="h-4 w-4" /> },
    { id: "bank", name: "Bank", icon: <Landmark className="h-4 w-4" /> },
    { id: "crypto", name: "Crypto", icon: <Bitcoin className="h-4 w-4" /> },
    { id: "cash", name: "Cash", icon: <Banknote className="h-4 w-4" /> }
  ];
  
  return (
    <DialogContent className="sm:max-w-[425px] bg-casino-thunder-dark text-white border-casino-thunder-green/50 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center">
            <Wallet className="mr-2 h-5 w-5 text-casino-thunder-green" />
            Deposit Funds
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Add funds to your account to start playing.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {/* Amount Selection */}
          <div className="space-y-4">
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
              <Label htmlFor="custom-amount" className="text-sm text-white/70">
                Custom Amount
              </Label>
              <div className="relative mt-1">
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
          </div>
          
          {/* Payment Method */}
          <div className="space-y-3">
            <Label className="text-white font-medium">Payment Method</Label>
            <div className="grid grid-cols-2 gap-3">
              {paymentMethods.map((method) => (
                <Button
                  key={method.id}
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedMethod(method.id)}
                  className={`justify-start h-14 ${
                    selectedMethod === method.id
                      ? 'bg-casino-thunder-green/20 border-casino-thunder-green text-white'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  } transition-all`}
                >
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      selectedMethod === method.id ? 'bg-casino-thunder-green text-black' : 'bg-white/10'
                    }`}>
                      {method.icon}
                    </div>
                    <span className="ml-2">{method.name}</span>
                  </div>
                  {selectedMethod === method.id && (
                    <Check className="ml-auto h-4 w-4 text-casino-thunder-green" />
                  )}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Security Note */}
          <div className="bg-white/5 p-3 rounded-md text-xs text-white/70 flex items-start">
            <span className="bg-green-500/20 p-1 rounded mr-2 mt-0.5">
              <Check className="h-3 w-3 text-green-500" />
            </span>
            <p>
              All transactions are secure and encrypted. Your financial information is never stored on our servers.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            onClick={handleDeposit}
            className="w-full bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black font-medium py-5"
          >
            Deposit ${parseFloat(amount) > 0 ? parseFloat(amount).toFixed(2) : "0.00"}
          </Button>
        </DialogFooter>
      </motion.div>
    </DialogContent>
  );
};

export default DepositButton;
