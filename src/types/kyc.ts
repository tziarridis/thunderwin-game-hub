
// src/types/kyc.ts

export enum KycStatusEnum {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  RESUBMIT = "resubmit", // A status to ask the user to resubmit documents
}
export type KycStatus = `${KycStatusEnum}`;

export enum KycDocumentTypeEnum {
  PASSPORT = "passport",
  NATIONAL_ID = "national_id",
  DRIVING_LICENSE = "driving_license",
  UTILITY_BILL = "utility_bill", // For Proof of Address
  BANK_STATEMENT = "bank_statement", // For Proof of Address
}
export type KycDocumentType = `${KycDocumentTypeEnum}`;


export interface KycRequest {
  id: string; // UUID
  user_id: string; // Foreign key to users table
  status: KycStatus;
  document_type: KycDocumentType | string; // Allow string for flexibility if new types added directly in DB
  document_front_url?: string | null;
  document_back_url?: string | null;
  selfie_url?: string | null;
  submitted_at: string; // ISO Date string
  reviewed_at?: string | null; // ISO Date string
  reviewed_by?: string | null; // User ID of admin/reviewer
  rejection_reason?: string | null;
  notes?: string | null; // Internal notes, formerly review_notes
  created_at?: string;
  updated_at?: string;
  // Optional user data if joined
  user?: {
    id: string;
    email?: string;
    full_name?: string;
  } | null;
}

export interface KycFormValues {
  document_type: KycDocumentType | '';
  document_front?: FileList | null;
  document_back?: FileList | null;
  selfie?: FileList | null;
}
