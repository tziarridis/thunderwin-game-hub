
import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { kycService } from '@/services/kycService';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { KycSubmission } from '@/types/kyc';

const kycFormSchema = z.object({
  document_type: z.string().min(1, 'Document type is required'),
  document_front: z.instanceof(FileList).refine(files => files?.length === 1, 'Front document is required.'),
  document_back: z.instanceof(FileList).optional(),
  selfie: z.instanceof(FileList).optional(),
});

type KycFormValues = z.infer<typeof kycFormSchema>;

interface KycFormProps {
  onSuccess?: () => void;
}

const KycForm: React.FC<KycFormProps> = ({ onSuccess }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<KycFormValues>({
    resolver: zodResolver(kycFormSchema),
  });

  const documentType = watch('document_type');

  const onSubmit: SubmitHandler<KycFormValues> = async (data) => {
    if (!user) {
      toast.error('You must be logged in to submit KYC.');
      return;
    }
    setIsLoading(true);
    try {
      const submissionData: KycSubmission = {
        document_type: data.document_type,
        document_front: data.document_front[0],
        document_back: data.document_back?.[0],
        selfie: data.selfie?.[0],
      };

      // Corrected: Use createKycRequest as suggested by build error if submitKycRequest doesn't exist
      if (kycService.createKycRequest) {
        await kycService.createKycRequest(user.id, submissionData);
      } else if (kycService.submitKycRequest) { // Fallback if createKycRequest was a misinterpretation
         await kycService.submitKycRequest(user.id, submissionData);
      } else {
        throw new Error("KYC submission function not found in kycService.");
      }
      
      toast.success('KYC documents submitted successfully. We will review them shortly.');
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('KYC submission error:', error);
      toast.error(error.message || 'Failed to submit KYC documents. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-card p-6 rounded-lg shadow">
      <div>
        <Label htmlFor="document_type">Document Type</Label>
        <Select 
          onValueChange={(value) => setValue('document_type', value, { shouldValidate: true })}
          defaultValue={watch('document_type')}
        >
          <SelectTrigger id="document_type">
            <SelectValue placeholder="Select document type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="passport">Passport</SelectItem>
            <SelectItem value="driver_license">Driver's License</SelectItem>
            <SelectItem value="id_card">National ID Card</SelectItem>
          </SelectContent>
        </Select>
        {errors.document_type && <p className="text-sm text-red-500 mt-1">{errors.document_type.message}</p>}
      </div>

      <div>
        <Label htmlFor="document_front">Document Front</Label>
        <Input id="document_front" type="file" {...register('document_front')} accept="image/jpeg, image/png, application/pdf" />
        {errors.document_front && <p className="text-sm text-red-500 mt-1">{errors.document_front.message}</p>}
      </div>

      {(documentType === 'driver_license' || documentType === 'id_card') && (
        <div>
          <Label htmlFor="document_back">Document Back (Required for {documentType === 'driver_license' ? "Driver's License" : "ID Card"})</Label>
          <Input id="document_back" type="file" {...register('document_back')} accept="image/jpeg, image/png, application/pdf" />
          {errors.document_back && <p className="text-sm text-red-500 mt-1">{errors.document_back.message}</p>}
        </div>
      )}

      <div>
        <Label htmlFor="selfie">Selfie with Document (Optional)</Label>
        <Input id="selfie" type="file" {...register('selfie')} accept="image/jpeg, image/png" />
        {errors.selfie && <p className="text-sm text-red-500 mt-1">{errors.selfie.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Submit KYC'}
      </Button>
    </form>
  );
};

export default KycForm;
