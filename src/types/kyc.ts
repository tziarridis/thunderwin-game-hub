
// Assuming this file exists or should be created.
// If it exists, I'll modify it. If not, I'll create it.

export type KycStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'resubmit_required' // Added this status
  | 'cancelled';

export interface KycDocument {
  id?: string;
  user_id: string;
  document_type: 'id_card' | 'passport' | 'drivers_license' | 'utility_bill';
  document_front_url?: string | null; // URL to the uploaded file
  document_back_url?: string | null; // URL to the uploaded file (for ID cards)
  uploaded_at: string;
}

export interface KycRequest {
  id: string;
  user_id: string;
  status: KycStatus;
  documents: KycDocument[]; // Simplified to array of KycDocument
  rejection_reason?: string | null;
  review_notes?: string | null; // Notes by admin
  created_at: string;
  updated_at: string;
  reviewed_by?: string | null; // Admin user ID
}

export interface KycSubmission {
  documents: Array<{
    document_type: 'id_card' | 'passport' | 'drivers_license' | 'utility_bill';
    file_front: File;
    file_back?: File | null;
  }>;
  // Any other submission data
}
