import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import kycService from '@/services/kycService'; // Assuming this service exists
import { toast } from 'sonner';
import { User } from '@/types'; // Import User type

const kycFormSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date'),
  addressLine1: z.string().min(5, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),
  documentType: z.enum(['passport', 'driver_license', 'national_id']),
  documentNumber: z.string().min(5, 'Document number is required'),
  documentExpiry: z.string().optional(), // Could be required based on doc type
  documentFront: z.any().refine(file => file?.length > 0, 'Front of document is required.'),
  documentBack: z.any().optional(), // May be required for ID cards / licenses
  selfieWithDocument: z.any().optional(), // May be required by some KYC providers
});

export type KycFormData = z.infer<typeof kycFormSchema>;

const KycForm = () => {
  const { user, updateUserProfile } = useAuth(); // Assuming updateUserProfile exists if KYC updates profile
  const [isLoading, setIsLoading] = useState(false);
  const [kycStatus, setKycStatus] = useState(user?.kycStatus || 'not_submitted');

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<KycFormData>({
    resolver: zodResolver(kycFormSchema),
    defaultValues: {
      fullName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
      dateOfBirth: user?.birthdate ? new Date(user.birthdate).toISOString().split('T')[0] : '',
      addressLine1: user?.address || '',
      city: user?.city || '',
      postalCode: user?.zipCode || '',
      country: user?.country || '',
      documentType: 'national_id',
    }
  });
  
  const documentType = watch('documentType');

  useEffect(() => {
    if (user) {
      setValue('fullName', `${user.firstName || ''} ${user.lastName || ''}`.trim());
      setValue('dateOfBirth', user.birthdate ? new Date(user.birthdate).toISOString().split('T')[0] : '');
      setValue('addressLine1', user.address || '');
      // ... set other fields if available on user object
      setKycStatus(user.kycStatus || 'not_submitted');
    }
  }, [user, setValue]);

  const onSubmit: SubmitHandler<KycFormData> = async (data) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      // Append all simple fields
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'documentFront' && key !== 'documentBack' && key !== 'selfieWithDocument' && value) {
          formData.append(key, String(value));
        }
      });
      
      // Append files
      if (data.documentFront && data.documentFront[0]) {
        formData.append('documentFront', data.documentFront[0]);
      }
      if (data.documentBack && data.documentBack[0]) {
        formData.append('documentBack', data.documentBack[0]);
      }
      if (data.selfieWithDocument && data.selfieWithDocument[0]) {
        formData.append('selfieWithDocument', data.selfieWithDocument[0]);
      }

      // Assuming kycService.submitKyc returns the new status or user object
      const response = await kycService.submitKyc(formData); 
      
      toast.success('KYC documents submitted successfully. We will review them shortly.');
      
      if (response && response.user) { // Assuming service might return updated user
         // @ts-ignore // Allow updateUserProfile to take partial User
        await updateUserProfile(response.user); 
        setKycStatus(response.user.kycStatus || 'pending');
      } else if (response && response.status) {
        setKycStatus(response.status);
         // @ts-ignore
        await updateUserProfile({ kycStatus: response.status });
      } else {
        setKycStatus('pending');
         // @ts-ignore
        await updateUserProfile({ kycStatus: 'pending' });
      }

    } catch (error: any) {
      toast.error(error.message || 'KYC submission failed. Please try again.');
      console.error("KYC Submission Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (kycStatus === 'verified') {
    return (
      <div className="p-6 bg-green-500/10 rounded-lg text-center">
        <h2 className="text-2xl font-semibold text-green-400 mb-2">KYC Verified</h2>
        <p className="text-white/80">Your identity has been successfully verified. Thank you!</p>
      </div>
    );
  }

  if (kycStatus === 'pending') {
    return (
      <div className="p-6 bg-yellow-500/10 rounded-lg text-center">
        <h2 className="text-2xl font-semibold text-yellow-400 mb-2">KYC Pending Review</h2>
        <p className="text-white/80">Your documents are under review. This usually takes 24-48 hours.</p>
      </div>
    );
  }
  
  if (kycStatus === 'rejected') {
     return (
      <div className="p-6 bg-red-500/10 rounded-lg text-center">
        <h2 className="text-2xl font-semibold text-red-400 mb-2">KYC Rejected</h2>
        <p className="text-white/80 mb-4">
          Unfortunately, your KYC submission was rejected. Please check your email for details or contact support.
        </p>
        <Button onClick={() => setKycStatus('not_submitted')}>Resubmit Documents</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-slate-800 p-6 rounded-lg">
      <h2 className="text-2xl font-semibold mb-6">Verify Your Identity (KYC)</h2>
      {/* Personal Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fullName">Full Name (as on document)</Label>
          <Input id="fullName" {...register('fullName')} />
          {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>}
        </div>
        <div>
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input id="dateOfBirth" type="date" {...register('dateOfBirth')} />
          {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth.message}</p>}
        </div>
      </div>

      {/* Address Information */}
      <div>
        <Label htmlFor="addressLine1">Address Line 1</Label>
        <Input id="addressLine1" {...register('addressLine1')} />
        {errors.addressLine1 && <p className="text-red-500 text-sm mt-1">{errors.addressLine1.message}</p>}
      </div>
      <div>
        <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
        <Input id="addressLine2" {...register('addressLine2')} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="city">City</Label>
          <Input id="city" {...register('city')} />
          {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
        </div>
        <div>
          <Label htmlFor="postalCode">Postal Code</Label>
          <Input id="postalCode" {...register('postalCode')} />
          {errors.postalCode && <p className="text-red-500 text-sm mt-1">{errors.postalCode.message}</p>}
        </div>
        <div>
          <Label htmlFor="country">Country</Label>
          {/* This should ideally be a Select with country codes/names */}
          <Input id="country" {...register('country')} placeholder="e.g., United States" />
          {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>}
        </div>
      </div>

      {/* Document Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="documentType">Document Type</Label>
          <Select onValueChange={(value) => setValue('documentType', value as any)} defaultValue="national_id">
            <SelectTrigger id="documentType">
              <SelectValue placeholder="Select document type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="passport">Passport</SelectItem>
              <SelectItem value="driver_license">Driver's License</SelectItem>
              <SelectItem value="national_id">National ID Card</SelectItem>
            </SelectContent>
          </Select>
          {errors.documentType && <p className="text-red-500 text-sm mt-1">{errors.documentType.message}</p>}
        </div>
        <div>
          <Label htmlFor="documentNumber">Document Number</Label>
          <Input id="documentNumber" {...register('documentNumber')} />
          {errors.documentNumber && <p className="text-red-500 text-sm mt-1">{errors.documentNumber.message}</p>}
        </div>
      </div>
      
      {(documentType === 'passport' || documentType === 'driver_license') && (
        <div>
          <Label htmlFor="documentExpiry">Document Expiry Date (Optional)</Label>
          <Input id="documentExpiry" type="date" {...register('documentExpiry')} />
          {errors.documentExpiry && <p className="text-red-500 text-sm mt-1">{errors.documentExpiry.message}</p>}
        </div>
      )}

      {/* File Uploads */}
      <div>
        <Label htmlFor="documentFront">Document Front</Label>
        <Input id="documentFront" type="file" {...register('documentFront')} accept="image/jpeg, image/png, application/pdf" />
        {errors.documentFront && <p className="text-red-500 text-sm mt-1">{errors.documentFront.message}</p>}
      </div>

      {(documentType === 'driver_license' || documentType === 'national_id') && (
         <div>
          <Label htmlFor="documentBack">Document Back (if applicable)</Label>
          <Input id="documentBack" type="file" {...register('documentBack')} accept="image/jpeg, image/png, application/pdf" />
          {errors.documentBack && <p className="text-red-500 text-sm mt-1">{errors.documentBack.message}</p>}
        </div>
      )}
      
      <div>
        <Label htmlFor="selfieWithDocument">Selfie with Document (Optional)</Label>
        <Input id="selfieWithDocument" type="file" {...register('selfieWithDocument')} accept="image/jpeg, image/png" />
        {errors.selfieWithDocument && <p className="text-red-500 text-sm mt-1">{errors.selfieWithDocument.message}</p>}
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Submitting...' : 'Submit KYC Documents'}
      </Button>
    </form>
  );
};

export default KycForm;
