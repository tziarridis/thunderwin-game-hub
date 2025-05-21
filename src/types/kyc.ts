
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

// Define KycRequest if it's used elsewhere and represents the DB structure for a KYC request
export interface KycRequest {
  id: string; // Request ID
  user_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'resubmit';
  documents_submitted: KycDocumentInfo[]; // Store info about files, not files themselves
  submitted_at: string;
  reviewed_at?: string;
  notes?: string; // Admin notes
}

export interface KycDocumentInfo {
  document_type: string;
  file_front_url: string;
  file_back_url?: string;
}
