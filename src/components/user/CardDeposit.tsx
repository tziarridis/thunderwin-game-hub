
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, DollarSign } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { z } from 'zod';

interface CardDepositProps {
  onComplete?: () => void;
  className?: string;
}

// Define deposit form validation schema
const depositSchema = z.object({
  amount: z.number().min(10).max(10000),
  cardNumber: z.string().regex(/^\d{16}$/, "Card number must be 16 digits"),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Expiry must be in MM/YY format"),
  cvv: z.string().regex(/^\d{3}$/, "CVV must be 3 digits")
});

type DepositFormData = z.infer<typeof depositSchema>;

const CardDeposit: React.FC<CardDepositProps> = ({ onComplete, className }) => {
  const { user, refreshWalletBalance } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<DepositFormData>>({
    amount: 100,
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [depositSuccess, setDepositSuccess] = useState(false);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Format card number with spaces
    if (name === 'cardNumber') {
      const formatted = value.replace(/\s/g, '').substr(0, 16);
      setFormData({ ...formData, [name]: formatted });
      return;
    }
    
    // Format expiry date with /
    if (name === 'expiryDate') {
      // Allow only digits and format as MM/YY
      const formatted = value
        .replace(/\D/g, '')
        .replace(/^(\d{2})(\d)/, '$1/$2')
        .substr(0, 5);
      setFormData({ ...formData, [name]: formatted });
      return;
    }
    
    // Handle amount special case
    if (name === 'amount') {
      // Convert to number for amount
      const numValue = parseFloat(value);
      setFormData({ ...formData, [name]: isNaN(numValue) ? undefined : numValue });
      return;
    }
    
    // Default handling for other fields
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    try {
      depositSchema.parse({
        amount: formData.amount || 0,
        cardNumber: formData.cardNumber || '',
        expiryDate: formData.expiryDate || '',
        cvv: formData.cvv || ''
      });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Simulate API call with a 1.5 second delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful deposit
      // In a real implementation, this would be a call to your deposit API
      // For example: const result = await depositService.processDeposit(formData);
      const mockResult = { 
        success: true, 
        message: "Deposit successful",
        transaction: {
          id: `tx-${Date.now()}`,
          amount: formData.amount,
          currency: user?.currency || 'USD',
          date: new Date().toISOString(),
        }
      };
      
      if (mockResult.success) {
        // Refresh wallet balance
        await refreshWalletBalance();
        
        toast.success("Deposit successful!", {
          description: `$${formData.amount} has been added to your wallet.`
        });
        
        setDepositSuccess(true);
        
        // Clear form
        setFormData({
          amount: 100,
          cardNumber: '',
          expiryDate: '',
          cvv: ''
        });
        
        // Call onComplete callback if provided
        if (onComplete) {
          onComplete();
        }
      } else {
        toast.error("Deposit failed", {
          description: mockResult.message || "Please try again later."
        });
      }
    } catch (error) {
      console.error("Deposit error:", error);
      toast.error("Deposit failed", { 
        description: "An error occurred while processing your deposit."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Card Deposit
        </CardTitle>
        <CardDescription>Add funds to your casino wallet using your credit or debit card.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="amount">Amount ({user?.currency || 'USD'})</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                id="amount"
                name="amount"
                type="number"
                placeholder="100"
                className="pl-9"
                value={formData.amount || ''}
                onChange={handleInputChange}
                min={10}
                max={10000}
              />
            </div>
            {errors.amount && <p className="text-xs text-destructive mt-1">{errors.amount}</p>}
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input 
              id="cardNumber"
              name="cardNumber"
              placeholder="0000 0000 0000 0000"
              value={formData.cardNumber}
              onChange={handleInputChange}
            />
            {errors.cardNumber && <p className="text-xs text-destructive mt-1">{errors.cardNumber}</p>}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input 
                id="expiryDate"
                name="expiryDate"
                placeholder="MM/YY"
                value={formData.expiryDate}
                onChange={handleInputChange}
              />
              {errors.expiryDate && <p className="text-xs text-destructive mt-1">{errors.expiryDate}</p>}
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="cvv">CVV</Label>
              <Input 
                id="cvv"
                name="cvv"
                type="password" 
                placeholder="123"
                maxLength={3}
                value={formData.cvv}
                onChange={handleInputChange}
              />
              {errors.cvv && <p className="text-xs text-destructive mt-1">{errors.cvv}</p>}
            </div>
          </div>
        
          <div className="pt-2">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Deposit Funds"}
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-xs text-muted-foreground">
          Your payment information is processed securely. We do not store your card details.
        </div>
      </CardFooter>
    </Card>
  );
};

export default CardDeposit;
