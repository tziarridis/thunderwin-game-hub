
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
import { Wallet, CreditCard, Landmark, Bitcoin, Banknote, Check, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { metamaskService } from "@/services/metamaskService";

interface DepositButtonProps {
  variant?: "default" | "small" | "icon" | "highlight";
  className?: string;
}

const DepositButton = ({ variant = "default", className = "" }: DepositButtonProps) => {
  const [amount, setAmount] = useState<string>("100");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const { isAuthenticated, user, deposit } = useAuth();
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

  const handleMetaMaskDeposit = async () => {
    if (!user?.id) {
      toast.error("User ID not found");
      return;
    }
    
    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsProcessing(true);
    
    try {
      // Check if MetaMask is installed
      if (!metamaskService.isMetaMaskInstalled()) {
        throw new Error("MetaMask is not installed. Please install MetaMask extension and try again.");
      }
      
      // Request account access
      const accounts = await metamaskService.requestAccounts();
      if (accounts.length === 0) {
        throw new Error("Please connect to MetaMask.");
      }
      
      // Switch to Ethereum Mainnet if needed
      await metamaskService.switchToEthereumMainnet();
      
      // Current ETH price in USD (in production, this should come from an API)
      const ethPriceInUsd = 2500; 
      
      // Convert USD to ETH
      const ethAmount = depositAmount / ethPriceInUsd;
      
      const confirmed = window.confirm(
        `You are about to deposit ${ethAmount.toFixed(6)} ETH (approximately $${depositAmount.toFixed(2)} USD). Do you want to continue?`
      );
      
      if (!confirmed) {
        setIsProcessing(false);
        return;
      }
      
      const success = await metamaskService.processDeposit(user.id, ethAmount);
      
      if (success) {
        setIsDialogOpen(false);
      }
    } catch (error: any) {
      console.error("MetaMask deposit error:", error);
      toast.error(error.message || "Failed to process MetaMask deposit");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeposit = async () => {
    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      if (selectedMethod === "metamask") {
        await handleMetaMaskDeposit();
        return;
      }
      
      // Handle other payment methods
      await deposit(depositAmount);
      toast.success(`Successfully deposited $${depositAmount.toFixed(2)}`);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Deposit error:", error);
      toast.error("Failed to process deposit");
    } finally {
      setIsProcessing(false);
    }
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
          isProcessing={isProcessing}
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
          isProcessing={isProcessing}
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
          isProcessing={isProcessing}
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
        isProcessing={isProcessing}
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
  isProcessing: boolean;
}

const DepositDialogContent = ({ 
  amount, 
  setAmount, 
  handleQuickAmount,
  handleDeposit,
  selectedMethod,
  setSelectedMethod,
  isProcessing
}: DepositDialogContentProps) => {
  const quickAmounts = [50, 100, 250, 500];
  
  const paymentMethods = [
    { id: "card", name: "Card", icon: <CreditCard className="h-4 w-4" /> },
    { id: "bank", name: "Bank", icon: <Landmark className="h-4 w-4" /> },
    { id: "crypto", name: "Crypto", icon: <Bitcoin className="h-4 w-4" /> },
    { id: "cash", name: "Cash", icon: <Banknote className="h-4 w-4" /> },
    { id: "metamask", name: "MetaMask", icon: <svg className="h-4 w-4" viewBox="0 0 35 33" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32.9582 1L19.8241 10.9179L22.2665 5.05039L32.9582 1Z" fill="#E2761B" stroke="#E2761B" strokeWidth="0.3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2.04184 1L15.0487 11.0179L12.7335 5.05039L2.04184 1Z" fill="#E4761B" stroke="#E4761B" strokeWidth="0.3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M28.2361 23.5776L24.7706 28.9874L32.2645 31.0648L34.4198 23.6948L28.2361 23.5776Z" fill="#E4761B" stroke="#E4761B" strokeWidth="0.3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M0.593262 23.6948L2.73547 31.0648L10.2294 28.9874L6.76384 23.5776L0.593262 23.6948Z" fill="#E4761B" stroke="#E4761B" strokeWidth="0.3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9.8188 14.6395L7.71553 17.8119L15.1553 18.1464L14.9024 10.1371L9.8188 14.6395Z" fill="#E4761B" stroke="#E4761B" strokeWidth="0.3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M25.1812 14.6395L20.0435 10.0371L19.8447 18.1464L27.2845 17.8119L25.1812 14.6395Z" fill="#E4761B" stroke="#E4761B" strokeWidth="0.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg> }
  ];
  
  const isMetaMaskAvailable = metamaskService.isMetaMaskInstalled();
  
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
              {paymentMethods.map((method) => {
                // Skip MetaMask option if not available
                if (method.id === "metamask" && !isMetaMaskAvailable) return null;
                
                return (
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
                );
              })}
            </div>
          </div>
          
          {/* MetaMask warning if needed */}
          {selectedMethod === "metamask" && !isMetaMaskAvailable && (
            <div className="bg-yellow-500/20 p-3 rounded-md text-sm flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 text-yellow-500 mt-0.5" />
              <p>MetaMask is not installed. Please install the MetaMask browser extension to use this payment method.</p>
            </div>
          )}
          
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
        </DialogFooter>
      </motion.div>
    </DialogContent>
  );
};

export default DepositButton;
