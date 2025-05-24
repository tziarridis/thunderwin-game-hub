
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KycDocumentType } from '@/types/kyc';

interface KycFormProps {
  userId: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

const KycForm: React.FC<KycFormProps> = ({ userId, onSuccess, onError }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const documentTypes = Object.values(KycDocumentType);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Mock submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSuccess();
    } catch (error) {
      onError('Failed to submit KYC documents');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Documents</CardTitle>
        <CardDescription>Please upload the required documents for verification</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {documentTypes.map((docType) => (
          <div key={docType} className="space-y-2">
            <label className="text-sm font-medium capitalize">
              {docType.replace('_', ' ')}
            </label>
            <input type="file" accept="image/*,.pdf" className="w-full" />
          </div>
        ))}
        <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Submitting...' : 'Submit Documents'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default KycForm;
