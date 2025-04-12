
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
import { Wallet, CreditCard, Landmark } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface DepositButtonProps {
  variant?: "default" | "small" | "icon" | "highlight";
  className?: string;
}

const DepositButton = ({ variant = "default", className = "" }: DepositButtonProps) => {
  const [amount, setAmount] = useState<string>("100");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
      />
    </Dialog>
  );
};

interface DepositDialogContentProps {
  amount: string;
  setAmount: (value: string) => void;
  handleQuickAmount: (value: number) => void;
  handleDeposit: () => void;
}

const DepositDialogContent = ({ 
  amount, 
  setAmount, 
  handleQuickAmount,
  handleDeposit
}: DepositDialogContentProps) => {
  return (
    <DialogContent className="sm:max-w-[425px] bg-casino-thunder-dark text-white border-casino-thunder-green/50">
      <DialogHeader>
        <DialogTitle>Deposit Funds</DialogTitle>
        <DialogDescription>
          Add funds to your account to start playing.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 gap-2">
          <Button 
            variant="outline" 
            onClick={() => handleQuickAmount(50)} 
            className={amount === "50" ? "border-casino-thunder-green" : ""}
          >
            $50
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleQuickAmount(100)} 
            className={amount === "100" ? "border-casino-thunder-green" : ""}
          >
            $100
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleQuickAmount(250)} 
            className={amount === "250" ? "border-casino-thunder-green" : ""}
          >
            $250
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleQuickAmount(500)} 
            className={amount === "500" ? "border-casino-thunder-green" : ""}
          >
            $500
          </Button>
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Custom Amount</Label>
          <Input
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
            min="10"
            placeholder="Enter amount"
            className="bg-casino-thunder-gray/30"
          />
        </div>
        <div className="space-y-2">
          <Label>Payment Method</Label>
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" className="justify-start">
              <CreditCard className="mr-2 h-4 w-4" />
              Card
            </Button>
            <Button variant="outline" className="justify-start">
              <Landmark className="mr-2 h-4 w-4" />
              Bank
            </Button>
            <Button variant="outline" className="justify-start">
              <Wallet className="mr-2 h-4 w-4" />
              Crypto
            </Button>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button 
          onClick={handleDeposit}
          className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
        >
          Deposit Now
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default DepositButton;
