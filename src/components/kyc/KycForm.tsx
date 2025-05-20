
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
// Assuming kycService exports a default function or a named function that matches
import { kycService } from '@/services/kycService'; // If submitKyc is a named export or part of an object
// import submitKycDefaultFunction from '@/services/kycService'; // If it's a default export
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const kycFormSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  dateOfBirth: z.string().regex(/^\\d{4}-\\d{2}-\\d{2}$/, { message: "Date of birth must be in YYYY-MM-DD format." }),
  address: z.string().min(5, { message: "Address must be at least 5 characters." }),
  city: z.string().min(2, { message: "City must be at least 2 characters." }),
  postalCode: z.string().min(3, { message: "Postal code must be at least 3 characters." }),
  country: z.string().min(2, { message: "Country must be at least 2 characters." }),
  documentType: z.enum(['passport', 'id_card', 'drivers_license']),
  documentNumber: z.string().min(5, { message: "Document number must be at least 5 characters." }),
  documentExpiry: z.string().regex(/^\\d{4}-\\d{2}-\\d{2}$/, { message: "Expiry date must be in YYYY-MM-DD format." }).optional().or(z.literal('')),
  frontDocument: z.any().refine(file => file?.length > 0, "Front of document is required."),
  backDocument: z.any().optional(), // Optional for some document types
  selfieWithDocument: z.any().refine(file => file?.length > 0, "Selfie with document is required."),
}).refine(data => {
  if (data.documentType === 'id_card' || data.documentType === 'drivers_license') {
    return data.backDocument?.length > 0;
  }
  return true;
}, {
  message: "Back of document is required for ID Card and Driver's License.",
  path: ["backDocument"],
});

type KycFormValues = z.infer<typeof kycFormSchema>;

const KycForm: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<KycFormValues>({
    resolver: zodResolver(kycFormSchema),
    defaultValues: {
      fullName: '',
      dateOfBirth: '',
      address: '',
      city: '',
      postalCode: '',
      country: '',
      documentType: 'id_card',
      documentNumber: '',
      documentExpiry: '',
      frontDocument: undefined,
      backDocument: undefined,
      selfieWithDocument: undefined,
    },
  });

  const onSubmit = async (data: KycFormValues) => {
    if (!user) {
      toast.error("You must be logged in to submit KYC.");
      return;
    }
    setIsLoading(true);
    try {
      // Check if kycService has submitKyc or similar function
      if (kycService && typeof kycService.submitKyc === 'function') {
        // Adapt this call to the actual signature of submitKyc
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (key === 'frontDocument' || key === 'backDocument' || key === 'selfieWithDocument') {
            if (value && value[0]) formData.append(key, value[0]);
          } else {
            formData.append(key, value as string);
          }
        });
        
        const response = await kycService.submitKyc(user.id, formData); // Adjust if userId is not needed or structure differs
        if (response.success) { // Assuming response has a success flag
          toast.success("KYC information submitted successfully!");
          form.reset();
          if (onSuccess) onSuccess();
        } else {
          toast.error(response.message || "Failed to submit KYC information.");
        }
      } else {
        // Fallback if submitKyc is not directly on kycService, e.g. default export
        // await submitKycDefaultFunction(user.id, data);
        // For now, log error if function is not found
        toast.error("KYC submission service is not configured correctly.");
        console.error("submitKyc function not found on kycService", kycService);
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred during KYC submission.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-card p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Birth</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Address</FormLabel>
              <FormControl>
                <Input placeholder="123 Main St, Apt 4B" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="New York" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="postalCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Postal Code</FormLabel>
                <FormControl>
                  <Input placeholder="10001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Input placeholder="United States" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    <SelectItem value="drivers_license">Driver's License</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
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
                  <Input placeholder="X1234567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="documentExpiry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Document Expiry Date (if applicable)</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="frontDocument"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Front of Document</FormLabel>
              <FormControl>
                <Input 
                  type="file" 
                  accept="image/png, image/jpeg, image/webp, application/pdf"
                  onChange={(e) => field.onChange(e.target.files)}
                />
              </FormControl>
              <FormDescription>Upload the front side of your document (max 5MB).</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {(form.watch('documentType') === 'id_card' || form.watch('documentType') === 'drivers_license') && (
          <FormField
            control={form.control}
            name="backDocument"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Back of Document</FormLabel>
                <FormControl>
                   <Input 
                    type="file" 
                    accept="image/png, image/jpeg, image/webp, application/pdf"
                    onChange={(e) => field.onChange(e.target.files)}
                  />
                </FormControl>
                <FormDescription>Upload the back side of your document (max 5MB).</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="selfieWithDocument"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Selfie with Document</FormLabel>
              <FormControl>
                <Input 
                  type="file" 
                  accept="image/png, image/jpeg, image/webp"
                  onChange={(e) => field.onChange(e.target.files)}
                />
              </FormControl>
              <FormDescription>Upload a clear selfie holding your document (max 5MB).</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Submit KYC
        </Button>
      </form>
    </Form>
  );
};

export default KycForm;
