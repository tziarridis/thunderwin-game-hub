
export type KycDocumentType = 'passport' | 'driver_license' | 'national_id' | 'other';

export type KycStatus = 'not_started' | 'pending' | 'approved' | 'rejected' | 'resubmit_required' | 'verified' | 'not_submitted';

export interface KycDocument {
  id: string;
  type: KycDocumentType;
  front_url: string;
  back_url?: string;
  status: KycStatus;
  rejection_reason?: string;
}

export interface KycRequest {
  id: string;
  user_id: string;
  status: KycStatus;
  documents: KycDocument[];
  created_at: string;
  updated_at: string;
  rejection_reason?: string;
}

export interface KycAttempt {
  id: string;
  user_id: string;
  status: KycStatus;
  documents?: KycDocument[];
  notes?: string;
  created_at: string;
}

export interface KycFormProps {
  onKycSubmitted?: (requestId: string) => void;
  onSuccess?: () => void;
  onError?: (errorMessage: string) => void;
  userId?: string;
  existingDocuments?: KycDocument[];
}

export interface KycStatusDisplayProps {
  status?: KycStatus;
  kycStatus?: KycStatus;
  kycRequest?: KycRequest;
  onResubmit?: () => void;
}
