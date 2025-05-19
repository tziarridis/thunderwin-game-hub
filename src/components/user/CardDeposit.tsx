
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

const formSchema = z.object({
  amount: z.string().min(1, { message: 'Amount is required' }),
  cardNumber: z.string().min(16, { message: 'Valid card number is required' }).max(19),
  expiry: z.string().min(5, { message: 'Valid expiry date is required' }),
  cvv: z.string().min(3, { message: 'Valid CVV is required' }).max(4),
  cardholderName: z.string().min(1, { message: 'Cardholder name is required' }),
});

const CardDeposit = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: '',
      cardNumber: '',
      expiry: '',
      cvv: '',
      cardholderName: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast.error("You must be logged in to make a deposit");
      return;
    }
    
    setIsLoading(true);
    try {
      // Simulate API call for demo purposes
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const amount = parseFloat(values.amount);
      
      // In a real app, this would be handled by a secure payment processor
      // and server-side code would update the wallet after successful payment
      const { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user.id)
        .single();
        
      if (walletError) throw walletError;
      
      const newBalance = (walletData.balance || 0) + amount;
      
      const { error: updateError } = await supabase
        .from('wallets')
        .update({ balance: newBalance })
        .eq('user_id', user.id);
        
      if (updateError) throw updateError;
      
      // Create transaction record
      await supabase.from('transactions').insert({
        player_id: user.id,
        provider: 'card',
        type: 'deposit',
        amount: amount,
        status: 'completed',
        currency: 'USD', // This should match your wallet currency
      });
      
      // Success message
      toast.success(`Successfully deposited $${amount}`);
      
      // Refresh page to update balance display - in a real app you'd use a context or state
      navigate('/profile');
    } catch (error: any) {
      console.error('Deposit error:', error);
      toast.error(error.message || 'Failed to process deposit');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Card Deposit</CardTitle>
        <CardDescription>Make a deposit using your credit or debit card.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="100.00"
                      type="number"
                      step="0.01"
                      min="10"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cardNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Card Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="4111 1111 1111 1111"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="expiry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry Date</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="MM/YY"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cvv"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CVV</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="123"
                        type="password"
                        maxLength={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="cardholderName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cardholder Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Smith"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Deposit Now'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default CardDeposit;
