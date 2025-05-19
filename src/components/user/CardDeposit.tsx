import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { paymentService } from '@/services/paymentService';
import { useAuth } from '@/contexts/AuthContext';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Define schema for form validation
const cardFormSchema = z.object({
  amount: z.string().min(1, { message: "Amount is required" })
    .refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Amount must be a positive number",
    }),
  cardName: z.string().min(3, { message: "Name on card is required" }),
  saveCard: z.boolean().optional(),
});

type CardFormValues = z.infer<typeof cardFormSchema>;

interface CardDepositProps {
  onSuccess?: (data: any) => void;
  onFail?: (error: any) => void;
}

const CardDeposit: React.FC<CardDepositProps> = ({ onSuccess, onFail }) => {
  const { user, wallet, refreshWalletBalance } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [stripeReady, setStripeReady] = useState(true); // Set to true for now, would be set by Stripe initialization

  const form = useForm<CardFormValues>({
    resolver: zodResolver(cardFormSchema),
    defaultValues: {
      amount: "",
      cardName: user?.user_metadata?.full_name || "",
      saveCard: false,
    },
  });

  const onSubmit = async (data: CardFormValues) => {
    setIsLoading(true);
    
    try {
      // Example parameters for depositWithCard
      const depositAmount = parseFloat(data.amount);
      const paymentMethodId = 'pm_card_visa'; // This would come from Stripe Elements

      if (!user || !wallet) {
        toast.error("User or wallet information is missing.");
        setIsLoading(false);
        return;
      }
      
      // Call the deposit service
      // const response = await paymentService.depositWithCard({
      //   userId: user.id,
      //   amount: depositAmount,
      //   currency: wallet.currency,
      //   paymentMethodId: paymentMethodId, 
      //   description: `Deposit of ${depositAmount} ${wallet.currency}`,
      //   customerName: data.cardName,
      //   customerEmail: user.email || "not@available.com"
      // });

      // MOCK SUCCESS for now
      const response = { success: true, data: { transactionId: "mock_tx_id", status: "succeeded", amount: depositAmount } };
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      if (response.success) {
        toast.success(`Successfully deposited ${depositAmount} ${wallet.currency}`);
        await refreshWalletBalance(); // Refresh wallet balance after successful deposit
        if (onSuccess) onSuccess(response.data);
      } else {
        toast.error("Deposit failed. Please try again.");
        if (onFail) onFail(new Error("Deposit failed"));
      }
    } catch (error) {
      console.error("Deposit error:", error);
      toast.error("An error occurred during deposit. Please try again.");
      if (onFail) onFail(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <p>Please log in to make a deposit.</p>;
  }
  
  if (!wallet) {
     return <p>Loading wallet information...</p>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Amount Field */}
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount {wallet && `(${wallet.currency})`}</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 50.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Card Name Field */}
        <FormField
          control={form.control}
          name="cardName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name on Card</FormLabel>
              <FormControl>
                <Input placeholder="John M. Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Placeholder for Stripe Card Element */}
        <div className="form-group">
            <Label htmlFor="card-element">Credit or debit card</Label>
            {/* 
              This is where Stripe's CardElement would be mounted.
              For now, it's a placeholder. You'd need to integrate Stripe.js and React Stripe.js.
              <div id="card-element" className="p-3 border border-input rounded-md"></div> 
            */}
            <div className="p-3 border border-input rounded-md bg-gray-50 text-sm text-gray-500">
              Stripe Card Element placeholder
            </div>
            <div id="card-errors" role="alert" className="text-sm text-destructive mt-1"></div>
        </div>


        {/* Save Card Checkbox - Optional */}
        {/* <FormField
          control={form.control}
          name="saveCard"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Save card for future payments
                </FormLabel>
              </div>
            </FormItem>
          )}
        /> */}

        <Button type="submit" className="w-full" disabled={isLoading || !stripeReady}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {`Pay ${form.getValues('amount') || '0.00'} ${wallet?.currency || ''}`}
        </Button>
      </form>
    </Form>
  );
};

export default CardDeposit;
