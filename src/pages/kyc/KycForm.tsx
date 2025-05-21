
import React from 'react';
import { useForm, SubmitHandler, FieldValues, UseFormRegister } from 'react-hook-form'; // Ensure FieldValues is imported
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea'; // Assuming Textarea might be used
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { KycDocumentType } from '@/types/kyc'; // Assuming this type exists for document types

// Define the Zod schema for KYC form validation
const kycFormSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date of birth must be YYYY-MM-DD"),
  addressLine1: z.string().min(5, "Address is too short"),
  city: z.string().min(2, "City name is too short"),
  postalCode: z.string().min(3, "Postal code is too short"),
  country: z.string().min(2, "Country name is too short"),
  documentType: z.nativeEnum(KycDocumentType), // Use nativeEnum for string enums
  documentNumber: z.string().min(5, "Document number is too short"),
  documentFile: z.custom<FileList>().refine(files => files && files.length > 0, "Document file is required."),
  // Add more fields as necessary
});

export type KycFormValues = z.infer<typeof kycFormSchema>; // This will extend FieldValues by default if schema is complex enough

interface KycFormProps {
  onSubmit: (data: KycFormValues, documentFile: File) => Promise<void>;
  isLoading: boolean;
  initialData?: Partial<KycFormValues>;
}

const KycForm: React.FC<KycFormProps> = ({ onSubmit, isLoading, initialData }) => {
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<KycFormValues>({
    resolver: zodResolver(kycFormSchema),
    defaultValues: initialData || { documentType: KycDocumentType.ID_CARD }, // Set a default document type
  });

  const selectedFile = watch("documentFile");

  const handleFormSubmit: SubmitHandler<KycFormValues> = async (data) => {
    if (data.documentFile && data.documentFile.length > 0) {
      await onSubmit(data, data.documentFile[0]);
    } else {
      toast.error("Please select a document file to upload.");
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Personal Details Section */}
      <fieldset className="space-y-4 p-4 border rounded-md">
        <legend className="text-lg font-semibold px-1">Personal Details</legend>
        <div>
          <Label htmlFor="fullName">Full Name</Label>
          <Input id="fullName" {...register("fullName")} className="bg-input" />
          {errors.fullName && <p className="text-sm text-destructive mt-1">{errors.fullName.message}</p>}
        </div>
        <div>
          <Label htmlFor="dateOfBirth">Date of Birth (YYYY-MM-DD)</Label>
          <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} className="bg-input" />
          {errors.dateOfBirth && <p className="text-sm text-destructive mt-1">{errors.dateOfBirth.message}</p>}
        </div>
      </fieldset>

      {/* Address Section */}
      <fieldset className="space-y-4 p-4 border rounded-md">
        <legend className="text-lg font-semibold px-1">Address</legend>
        <div>
          <Label htmlFor="addressLine1">Address Line 1</Label>
          <Input id="addressLine1" {...register("addressLine1")} className="bg-input" />
          {errors.addressLine1 && <p className="text-sm text-destructive mt-1">{errors.addressLine1.message}</p>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" {...register("city")} className="bg-input" />
                {errors.city && <p className="text-sm text-destructive mt-1">{errors.city.message}</p>}
            </div>
            <div>
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input id="postalCode" {...register("postalCode")} className="bg-input" />
                {errors.postalCode && <p className="text-sm text-destructive mt-1">{errors.postalCode.message}</p>}
            </div>
            <div>
                <Label htmlFor="country">Country</Label>
                <Input id="country" {...register("country")} className="bg-input" />
                {errors.country && <p className="text-sm text-destructive mt-1">{errors.country.message}</p>}
            </div>
        </div>
      </fieldset>
      
      {/* Document Upload Section */}
      <fieldset className="space-y-4 p-4 border rounded-md">
        <legend className="text-lg font-semibold px-1">Document Upload</legend>
        <div>
          <Label htmlFor="documentType">Document Type</Label>
          <Select
            onValueChange={(value) => setValue("documentType", value as KycDocumentType)}
            defaultValue={initialData?.documentType || KycDocumentType.ID_CARD}
          >
            <SelectTrigger className="bg-input">
              <SelectValue placeholder="Select document type" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(KycDocumentType).map(type => (
                <SelectItem key={type} value={type}>{type.replace('_', ' ')}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.documentType && <p className="text-sm text-destructive mt-1">{errors.documentType.message}</p>}
        </div>
        <div>
          <Label htmlFor="documentNumber">Document Number</Label>
          <Input id="documentNumber" {...register("documentNumber")} className="bg-input" />
          {errors.documentNumber && <p className="text-sm text-destructive mt-1">{errors.documentNumber.message}</p>}
        </div>
        <div>
          <Label htmlFor="documentFile">Upload Document</Label>
          <Input id="documentFile" type="file" {...register("documentFile")} className="bg-input file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90" />
          {selectedFile && selectedFile.length > 0 && <p className="text-xs text-muted-foreground mt-1">Selected: {selectedFile[0].name}</p>}
          {errors.documentFile && <p className="text-sm text-destructive mt-1">{errors.documentFile.message}</p>}
        </div>
      </fieldset>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Submit KYC Information
      </Button>
    </form>
  );
};

export default KycForm;
