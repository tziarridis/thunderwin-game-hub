// src/types/kyc.ts
export type KycStatus = 'not_started' | 'pending_review' | 'approved' | 'rejected' | 'resubmit_required' | 'verified' | 'failed';

export enum KycDocumentTypeEnum {
  ID_CARD_FRONT = 'id_card_front',
  ID_CARD_BACK = 'id_card_back',
  PASSPORT = 'passport',
  DRIVING_LICENSE_FRONT = 'driving_license_front',
  DRIVING_LICENSE_BACK = 'driving_license_back',
  UTILITY_BILL = 'utility_bill',
  BANK_STATEMENT = 'bank_statement',
  PROOF_OF_ADDRESS = 'proof_of_address', // Generic proof of address
  SELFIE = 'selfie', // Added Selfie
}

export interface KycDocument {
  id: string;
  user_id: string;
  document_type: KycDocumentTypeEnum;
  file_url: string;
  status: 'pending' | 'approved' | 'rejected';
  uploaded_at: string;
  reviewed_at?: string;
  rejection_reason?: string;
}

export interface KycAttempt {
  id: string;
  user_id: string;
  status: KycStatus;
  documents: KycDocument[];
  created_at: string;
  updated_at: string;
  notes?: string;
}

// Make sure this file is re-exported in src/types/index.d.ts
// e.g. export * from './kyc';
