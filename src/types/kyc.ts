
export enum KycStatus {
  NOT_STARTED = 'not_started',
  PENDING = 'pending',
  PENDING_REVIEW = 'pending_review',
  APPROVED = 'approved',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  RESUBMIT_REQUIRED = 'resubmit_required'
}

export enum KycDocumentType {
  PASSPORT = 'passport',
  DRIVER_LICENSE = 'driver_license',
  NATIONAL_ID = 'national_id',
  OTHER = 'other'
}

export interface KycRequest {
  id: string;
  user_id: string;
  document_type: KycDocumentType;
  document_front_url?: string | null;
  document_back_url?: string | null;
  status: KycStatus;
  rejection_reason?: string | null;
  created_at: string;
  updated_at: string;
  admin_id?: string | null;
}

export interface KycFormData {
  documentType: KycDocumentType;
  frontImage: File | null;
  backImage: File | null;
}
