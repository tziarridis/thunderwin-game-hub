
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, CreditCard, Landmark, Bitcoin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import MetaMaskDeposit from "@/components/payment/MetaMaskDeposit";
import CardDeposit from "./CardDeposit";

interface DepositButtonProps {
  variant?: "default" | "small" | "icon" | "highlight";
  className?: string;
}

const DepositButton = ({ variant = "default", className = "" }: DepositButtonProps) => {
  const [amount, setAmount] = useState<string>("100");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const handleDepositClick = () => {
    if (!isAuthenticated) {
      toast("Please log in to make a deposit");
      navigate("/login");
      return;
    }
  };

  const handleDepositSuccess = () => {
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
          onSuccess={handleDepositSuccess}
          onProcessingChange={setIsProcessing}
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
          onSuccess={handleDepositSuccess}
          onProcessingChange={setIsProcessing}
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
          onSuccess={handleDepositSuccess}
          onProcessingChange={setIsProcessing}
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
        onSuccess={handleDepositSuccess}
        onProcessingChange={setIsProcessing}
        isProcessing={isProcessing}
      />
    </Dialog>
  );
};

interface DepositDialogContentProps {
  amount: string;
  setAmount: (value: string) => void;
  onSuccess: () => void;
  onProcessingChange: (isProcessing: boolean) => void;
  isProcessing: boolean;
}

const DepositDialogContent = ({ 
  amount, 
  setAmount,
  onSuccess,
  onProcessingChange,
  isProcessing
}: DepositDialogContentProps) => {
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
        </DialogHeader>
        
        <div className="mt-4">
          <Tabs defaultValue="card" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="card" disabled={isProcessing} className="data-[state=active]:bg-casino-thunder-green data-[state=active]:text-black">
                <CreditCard className="h-4 w-4 mr-2" />
                Card
              </TabsTrigger>
              <TabsTrigger value="bank" disabled={isProcessing} className="data-[state=active]:bg-casino-thunder-green data-[state=active]:text-black">
                <Landmark className="h-4 w-4 mr-2" />
                Bank
              </TabsTrigger>
              <TabsTrigger value="crypto" disabled={isProcessing} className="data-[state=active]:bg-casino-thunder-green data-[state=active]:text-black">
                <Bitcoin className="h-4 w-4 mr-2" />
                Crypto
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="card" className="focus:outline-none">
              <CardDeposit 
                amount={amount} 
                setAmount={setAmount} 
                onSuccess={onSuccess}
                onProcessing={onProcessingChange}
              />
            </TabsContent>
            
            <TabsContent value="bank" className="focus:outline-none">
              <div className="p-4 bg-white/5 rounded-md text-center">
                <p className="text-white/70">Bank deposit coming soon!</p>
                <p className="text-xs text-white/50 mt-1">Try another payment method</p>
              </div>
            </TabsContent>
            
            <TabsContent value="crypto" className="space-y-4 focus:outline-none">
              <MetaMaskDeposit 
                amount={amount} 
                setAmount={setAmount} 
                onSuccess={onSuccess}
                onProcessing={onProcessingChange}
              />
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </DialogContent>
  );
};

export default DepositButton;
