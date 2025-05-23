
export type KycDocumentType = 'passport' | 'driver_license' | 'national_id' | 'other';

export type KycStatus = 'not_started' | 'pending' | 'approved' | 'rejected' | 'resubmit_required' | 'verified' | 'not_submitted';

export const KycStatusEnum = {
  NOT_STARTED: 'not_started' as const,
  PENDING: 'pending' as const,
  APPROVED: 'approved' as const,
  REJECTED: 'rejected' as const,
  RESUBMIT_REQUIRED: 'resubmit_required' as const,
  VERIFIED: 'verified' as const,
  NOT_SUBMITTED: 'not_submitted' as const,
};

export interface KycDocument {
  id: string;
  type: KycDocumentType;
  front_url: string;
  back_url?: string;
  status: KycStatus;
  rejection_reason?: string;
  document_type?: KycDocumentType;
}

export interface KycRequest {
  id: string;
  user_id: string;
  status: KycStatus;
  documents: KycDocument[];
  document_type?: KycDocumentType;
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
  title?: string;
}
