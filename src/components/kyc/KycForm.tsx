import React, { useState } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { kycService } from '@/services/kycService'; // Assuming kycService is correctly set up
import { toast } from 'sonner';
import { Loader2, UploadCloud } from 'lucide-react';
import { KycSubmission, KycDocument } from '@/types/kyc'; // Ensure types are correctly defined and imported

const kycFormSchema = z.object({
  document_type: z.enum(['id_card', 'passport', 'drivers_license', 'utility_bill'], {
    required_error: "Document type is required.",
  }),
  file_front: z.instanceof(FileList).refine(files => files?.length === 1, "Front document image is required."),
  file_back: z.instanceof(FileList).optional(),
}).refine(data => {
  if (data.document_type === 'id_card' && (!data.file_back || data.file_back.length === 0)) {
    return false; // Back image required for ID card
  }
  return true;
}, {
  message: "Back document image is required for ID card.",
  path: ['file_back'],
});

type KycFormValues = z.infer<typeof kycFormSchema>;


const KycForm = ({ onKycSubmitted }: { onKycSubmitted: (requestId: string) => void }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const { control, handleSubmit, watch, formState: { errors } } = useForm<KycFormValues>({
    resolver: zodResolver(kycFormSchema),
    defaultValues: {
      document_type: 'id_card',
    }
  });
  const documentType = watch('document_type');

  const onSubmit: SubmitHandler<KycFormValues> = async (data) => {
    if (!user?.id) {
      toast.error("User not authenticated. Please log in.");
      return;
    }
    setIsLoading(true);
    try {
      const submissionData: KycSubmission = {
        documents: [{
          document_type: data.document_type,
          file_front: data.file_front[0],
          file_back: data.file_back?.[0] || null,
        }]
      };
      // Corrected: kycService.submitKycRequest
      const kycRequest = await kycService.submitKycRequest(user.id, submissionData);
      if (kycRequest && kycRequest.id) {
        toast.success("KYC documents submitted successfully. We will review them shortly.");
        onKycSubmitted(kycRequest.id);
      } else {
        // This case might indicate an issue with submitKycRequest if it can return null/undefined without erroring
        toast.error("KYC submission failed. Please try again.");
      }
    } catch (error: any) {
      console.error("KYC Submission Error:", error);
      toast.error(`KYC submission failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-card p-6 rounded-lg shadow-md">
      <div>
        <Label htmlFor="document_type">Document Type</Label>
        <Controller
          name="document_type"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger id="document_type">
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="id_card">ID Card</SelectItem>
                <SelectItem value="passport">Passport</SelectItem>
                <SelectItem value="drivers_license">Driver's License</SelectItem>
                <SelectItem value="utility_bill">Utility Bill (Proof of Address)</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.document_type && <p className="text-sm text-destructive mt-1">{errors.document_type.message}</p>}
      </div>

      <div>
        <Label htmlFor="file_front">Document Front</Label>
        <Controller
          name="file_front"
          control={control}
          render={({ field: { onChange, onBlur, name, ref } }) => (
            <Input
              id="file_front"
              type="file"
              accept="image/jpeg, image/png, application/pdf"
              onChange={(e) => onChange(e.target.files)}
              onBlur={onBlur}
              name={name}
              ref={ref}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
          )}
        />
        {errors.file_front && <p className="text-sm text-destructive mt-1">{errors.file_front.message}</p>}
      </div>

      {(documentType === 'id_card') && (
        <div>
          <Label htmlFor="file_back">Document Back (for ID Card)</Label>
          <Controller
            name="file_back"
            control={control}
            render={({ field: { onChange, onBlur, name, ref } }) => (
              <Input
                id="file_back"
                type="file"
                accept="image/jpeg, image/png, application/pdf"
                onChange={(e) => onChange(e.target.files)}
                onBlur={onBlur}
                name={name}
                ref={ref}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
            )}
          />
          {errors.file_back && <p className="text-sm text-destructive mt-1">{errors.file_back.message}</p>}
        </div>
      )}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
          </>
        ) : (
          <>
            <UploadCloud className="mr-2 h-4 w-4" /> Submit Documents
          </>
        )}
      </Button>
    </form>
  );
};

export default KycForm;
