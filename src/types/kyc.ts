
export enum KycStatus {
  NOT_SUBMITTED = "NOT_SUBMITTED",
  SUBMITTED = "SUBMITTED", // Or IN_REVIEW, PENDING
  PENDING = "PENDING",
  VERIFIED = "VERIFIED",
  REJECTED = "REJECTED",
  ACTION_REQUIRED = "ACTION_REQUIRED", // e.g. resubmit document
}

export enum KycDocumentType {
  ID_CARD = 'id_card',
  PASSPORT = 'passport',
  DRIVER_LICENSE = 'driver_license',
  UTILITY_BILL = 'utility_bill',
  BANK_STATEMENT = 'bank_statement',
  OTHER = 'other',
}

export interface KycDocument {
  id?: string;
  kyc_request_id: string;
  document_type: KycDocumentType; // Use the enum
  file_url: string;
  file_name?: string;
  uploaded_at: string;
  status?: 'pending' | 'approved' | 'rejected'; // Status per document
  rejection_reason?: string;
}

export interface KycRequest {
  id: string;
  user_id: string;
  status: KycStatus;
  first_name?: string; 
  last_name?: string;
  date_of_birth?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state_province?: string;
  postal_code?: string;
  country_code?: string; 
  rejection_reason?: string; 
  notes?: string; 
  submitted_at?: string;
  reviewed_at?: string;
  reviewed_by?: string; 
  created_at: string;
  updated_at: string;
  documents?: KycDocument[]; 
  // Fields that were in kycService's Omit type, potentially representing form data for submission
  // These are usually part of the KycRequest table itself, filled on submission.
  document_type?: KycDocumentType; // This is often a primary field of the request if one main doc type is focused on
  document_front_url?: string;    // URL of the uploaded front document
  document_back_url?: string;     // URL of the uploaded back document
  selfie_url?: string;            // URL of the uploaded selfie
}

// For fetching KYC requests with user details for admin panel
export interface KycRequestWithUser extends KycRequest {
  user: {
    id?: string; // Add user ID for consistency, often needed.
    email?: string;
    username?: string;
    first_name?: string; // Denormalized from profiles for convenience
    last_name?: string;  // Denormalized from profiles for convenience
    [key: string]: any;
  };
}

// Payload for updating a KYC request
export interface KycRequestUpdatePayload {
  status?: KycStatus;
  rejection_reason?: string | null;
  notes?: string | null;
}

// Defines the data structure expected by the kycService.submitKycRequest
export interface KycSubmission {
  // User-provided data (typically from a form)
  first_name: string;
  last_name: string;
  date_of_birth: string; // ISO Date string
  address_line1: string;
  address_line2?: string;
  city: string;
  state_province?: string;
  postal_code: string;
  country_code: string; // ISO 2-letter country code
  
  document_type: KycDocumentType; // The type of the primary document being submitted

  // Files to be uploaded
  document_front: File;
  document_back?: File;
  selfie?: File;
  // Any other specific fields needed for initial submission not directly on KycRequest but used to create it
}
