
export enum KycDocumentType {
  PASSPORT = 'passport',
  NATIONAL_ID = 'national_id',
  DRIVER_LICENSE = 'driver_license',
  OTHER = 'other'
}

export enum KycDocumentTypeEnum {
  PASSPORT = 'passport',
  NATIONAL_ID = 'national_id',
  DRIVER_LICENSE = 'driver_license',
  OTHER = 'other'
}

export enum KycStatus {
  NOT_STARTED = 'not_started',
  PENDING = 'pending',
  PENDING_REVIEW = 'pending_review',
  APPROVED = 'approved',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  RESUBMIT_REQUIRED = 'resubmit_required'
}

export interface KycDocument {
  id: string;
  type: KycDocumentType;
  front_url: string;
  back_url?: string;
  status: KycStatus;
}

export interface KycAttempt {
  id: string;
  user_id: string;
  status: string;
  documents?: KycDocument[];
  notes?: string;
  created_at: string;
}

export interface KycRequest {
  id: string;
  user_id: string;
  document_type: KycDocumentType;
  document_front_url?: string | null;
  document_back_url?: string | null;
  status: KycStatus;
  documents?: KycDocument[];
  created_at: string;
  updated_at: string;
  rejection_reason?: string | null;
}
