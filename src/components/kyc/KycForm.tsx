import React from 'react';
import { Button } from '@/components/ui/button';
import { KycFormProps } from '@/types/kyc';

const KycForm: React.FC<KycFormProps> = ({ 
  onKycSubmitted,
  onSuccess,
  onError,
  userId,
  existingDocuments
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock successful submission
    try {
      const mockRequestId = 'kyc-' + Math.random().toString(36).substr(2, 9);
      
      if (onKycSubmitted) {
        onKycSubmitted(mockRequestId);
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      if (onError) {
        onError("Failed to submit KYC documents");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p>Upload your identity documents here</p>
        {/* Document upload fields would go here */}
      </div>
      <Button type="submit">Submit Documents</Button>
    </form>
  );
};

export default KycForm;
