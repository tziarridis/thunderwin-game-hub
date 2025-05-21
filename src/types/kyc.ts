
// src/types/kyc.ts

export enum KycStatus {
  NOT_SUBMITTED = "not_submitted",
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  RESUBMIT_REQUIRED = "resubmit_required",
  EXPIRED = "expired", // e.g. document expired
}

export enum KycDocumentType {
  ID_CARD = "id_card",
  PASSPORT = "passport",
  DRIVING_LICENSE = "driving_license",
  UTILITY_BILL = "utility_bill", // For Proof of Address (POA)
  BANK_STATEMENT = "bank_statement", // For POA or Proof of Funds (POF)
  SELFIE_WITH_ID = "selfie_with_id",
  OTHER = "other",
}

export interface KycDocument {
  id?: string; // uuid, if stored separately
  document_type: KycDocumentType | string; // Allow string for flexibility if new types added
  file_name: string;
  file_url: string; // URL to the stored document in Supabase Storage or S3
  uploaded_at?: string; // ISO date string
  expires_at?: string | null; // ISO date string, for documents like passports
  status?: 'verified' | 'rejected' | 'pending_review'; // Status of individual document
  rejection_reason?: string | null; // If this specific document was rejected
}

export interface KycRequest {
  id: string; // uuid, primary key of the KYC request
  user_id: string; // uuid, foreign key to users table
  status: KycStatus | string; // Current status of the KYC request
  documents?: KycDocument[]; // Array of submitted documents
  user_details?: Record<string, any>; // JSONB field for submitted form data (name, DOB, address etc.)
  rejection_reason?: string | null; // Overall rejection reason if status is 'rejected'
  review_notes?: string | null; // Internal notes from admin/reviewer
  submitted_at: string; // ISO date string
  reviewed_at?: string | null; // ISO date string
  reviewed_by?: string | null; // uuid of admin user who reviewed
  created_at: string; // ISO date string for record creation
  updated_at: string; // ISO date string for record update
  // Additional fields like IP address, device info, etc. might be useful
}

// For updating a KYC request
export interface KycRequestUpdatePayload {
  status: KycStatus | string;
  rejection_reason?: string | null; // Ensure consistency, using snake_case from DB
  review_notes?: string | null;
  reviewed_by?: string; // Admin user ID
  reviewed_at?: string; // ISO Date
}

// For creating a new KYC submission (from user form)
export interface KycSubmissionPayload {
  user_details: {
    fullName: string;
    dateOfBirth: string; // YYYY-MM-DD
    addressLine1: string;
    city: string;
    postalCode: string;
    country: string;
    // ... any other form fields
  };
  documentsToUpload: Array<{
    documentType: KycDocumentType | string;
    file: File; // The actual file object to be uploaded
  }>;
}
