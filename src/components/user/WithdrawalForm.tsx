
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, DollarSign, AlertCircle } from "lucide-react";
import { paymentService } from "@/services/paymentService";

const WithdrawalForm = () => {
  const [amount, setAmount] = useState<string>("");
  const [withdrawalMethod, setWithdrawalMethod] = useState<string>("bank");
  const [address, setAddress] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to withdraw");
      return;
    }
    
    const withdrawalAmount = parseFloat(amount);
    if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    if (withdrawalAmount > (user.balance || 0)) {
      toast.error("Insufficient balance");
      return;
    }
    
    if (withdrawalMethod === "crypto" && !address) {
      toast.error("Please enter a valid crypto address");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const success = await paymentService.processWithdrawal({
        userId: user.id,
        amount: withdrawalAmount,
        method: withdrawalMethod,
        address: address,
      });
      
      if (success) {
        toast.success("Withdrawal request submitted successfully");
        setAmount("");
        setAddress("");
      } else {
        toast.error("Failed to process withdrawal");
      }
    } catch (error) {
      console.error("Withdrawal error:", error);
      toast.error(`Withdrawal failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <DollarSign className="mr-2 h-5 w-5 text-casino-thunder-green" />
          Withdraw Funds
        </CardTitle>
        <CardDescription>
          Request a withdrawal from your account balance
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="balance">Available Balance</Label>
            <div className="p-2 bg-casino-thunder-darker rounded border border-white/10 flex justify-between items-center">
              <span>${user?.balance?.toFixed(2) || "0.00"}</span>
              <span className="text-xs text-green-400">Available</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Withdrawal Amount</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-9"
                placeholder="0.00"
                min="10"
                step="0.01"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="method">Withdrawal Method</Label>
            <Select value={withdrawalMethod} onValueChange={setWithdrawalMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank">Bank Transfer</SelectItem>
                <SelectItem value="card">Credit Card</SelectItem>
                <SelectItem value="crypto">Cryptocurrency</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {withdrawalMethod === "crypto" && (
            <div className="space-y-2">
              <Label htmlFor="address">Crypto Address</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your wallet address"
                required
              />
            </div>
          )}
          
          <div className="bg-yellow-500/10 p-3 rounded-md text-yellow-400 text-sm flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Important</p>
              <p className="text-xs mt-1">
                Withdrawal requests are typically processed within 24-48 hours. Minimum withdrawal amount is $10.
              </p>
            </div>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black" 
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Request Withdrawal"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default WithdrawalForm;
