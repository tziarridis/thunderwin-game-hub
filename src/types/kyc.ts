
export interface KycDocument {
  document_type: 'id_card' | 'passport' | 'drivers_license' | 'utility_bill';
  file_front: File;
  file_back?: File | null;
  // Any other relevant fields for a document
}

export interface KycSubmission {
  documents: KycDocument[];
  // Any other relevant fields for a submission
  notes?: string;
}

export type KycStatus = 'pending' | 'approved' | 'rejected' | 'resubmit' | 'resubmit_required'; // Added 'resubmit_required'

// Define KycRequest if it's used elsewhere and represents the DB structure for a KYC request
export interface KycRequest {
  id: string; // Request ID
  user_id: string;
  status: KycStatus; // Use the renamed KycStatus
  documents_submitted: KycDocumentInfo[]; // Store info about files, not files themselves
  submitted_at: string;
  reviewed_at?: string;
  notes?: string; // Admin notes
  review_notes?: string; // Added for compatibility with read-only KycStatusDisplay
  rejection_reason?: string;
}

export interface KycDocumentInfo {
  document_type: string;
  file_front_url: string;
  file_back_url?: string;
}
