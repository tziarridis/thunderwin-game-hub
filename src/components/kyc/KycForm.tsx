import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { submitKyc } from '@/services/kycService'; // Changed to named import
import { DatePicker } from '@/components/ui/date-picker';

// KYC Form schema
const kycFormSchema = z.object({
  documentType: z.string().min(1, { message: 'Document type is required' }),
  documentNumber: z.string().min(3, { message: 'Document number is required' }),
  issueDate: z.date().optional(),
  expiryDate: z.date().optional(),
  countryOfIssue: z.string().min(1, { message: 'Country of issue is required' }),
});

type KycFormValues = z.infer<typeof kycFormSchema>;

interface KycFormProps {
  userId: string;
  onSuccess?: () => void;
}

const KycForm = ({ userId, onSuccess }: KycFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<KycFormValues>({
    resolver: zodResolver(kycFormSchema),
    defaultValues: {
      documentType: '',
      documentNumber: '',
      countryOfIssue: '',
    },
  });
  
  const onSubmit = async (data: KycFormValues) => {
    setIsSubmitting(true);
    try {
      // Format dates for the API
      const formattedData = {
        ...data,
        issueDate: data.issueDate ? data.issueDate.toISOString().split('T')[0] : undefined,
        expiryDate: data.expiryDate ? data.expiryDate.toISOString().split('T')[0] : undefined,
      };
      
      const result = await submitKyc(formattedData, userId);
      
      if (result.success) {
        toast.success('KYC information submitted successfully!');
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast.error(result.message || 'Failed to submit KYC information.');
      }
    } catch (error) {
      console.error('Error submitting KYC data:', error);
      toast.error('An error occurred while submitting your KYC information.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="documentType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Document Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="passport">Passport</SelectItem>
                    <SelectItem value="id_card">ID Card</SelectItem>
                    <SelectItem value="driver_license">Driver's License</SelectItem>
                    <SelectItem value="residence_permit">Residence Permit</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage>{form.formState.errors.documentType?.message?.toString() || ''}</FormMessage>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="documentNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Document Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter document number" {...field} />
                </FormControl>
                <FormMessage>{form.formState.errors.documentNumber?.message?.toString() || ''}</FormMessage>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="countryOfIssue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country of Issue</FormLabel>
                <FormControl>
                  <Input placeholder="Country of issue" {...field} />
                </FormControl>
                <FormMessage>{form.formState.errors.countryOfIssue?.message?.toString() || ''}</FormMessage>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="issueDate"
            render={({ field }) => (
              <FormItem className="flex flex-col space-y-1.5">
                <FormLabel>Issue Date</FormLabel>
                <FormControl>
                  <DatePicker
                    onSelect={field.onChange}
                    selected={field.value}
                    mode="single"
                  />
                </FormControl>
                <FormMessage>{form.formState.errors.issueDate?.message}</FormMessage>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expiryDate"
            render={({ field }) => (
              <FormItem className="flex flex-col space-y-1.5">
                <FormLabel>Expiry Date</FormLabel>
                <FormControl>
                  <DatePicker
                    onSelect={field.onChange}
                    selected={field.value}
                    mode="single"
                  />
                </FormControl>
                <FormMessage>{form.formState.errors.expiryDate?.message}</FormMessage>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end mt-6">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit KYC Information'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default KycForm;
