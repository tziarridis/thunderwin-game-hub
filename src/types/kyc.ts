export enum KycStatus {
  NOT_SUBMITTED = "NOT_SUBMITTED",
  SUBMITTED = "SUBMITTED", // Or IN_REVIEW, PENDING
  PENDING = "PENDING",
  VERIFIED = "VERIFIED",
  REJECTED = "REJECTED",
  ACTION_REQUIRED = "ACTION_REQUIRED", // e.g. resubmit document
}

export interface KycDocument {
  id?: string;
  kyc_request_id: string;
  document_type: 'id_card' | 'passport' | 'driver_license' | 'utility_bill' | 'bank_statement' | 'other';
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
  first_name?: string; // Often captured during KYC
  last_name?: string;
  date_of_birth?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state_province?: string;
  postal_code?: string;
  country_code?: string; // ISO 2-letter country code
  rejection_reason?: string; // Overall rejection reason for the request
  notes?: string; // Admin notes
  submitted_at?: string;
  reviewed_at?: string;
  reviewed_by?: string; // Admin user ID
  created_at: string;
  updated_at: string;
  documents?: KycDocument[]; // Associated documents
}

// For fetching KYC requests with user details for admin panel
export interface KycRequestWithUser extends KycRequest {
  user: {
    email?: string;
    username?: string;
    // other relevant user fields
    [key: string]: any;
  };
}

// Payload for updating a KYC request
export interface KycRequestUpdatePayload {
  status?: KycStatus;
  rejection_reason?: string | null;
  notes?: string | null;
  // any other fields an admin might update
}
