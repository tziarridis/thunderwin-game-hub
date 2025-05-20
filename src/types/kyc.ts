
export type KycStatus = 'pending' | 'approved' | 'rejected' | 'resubmit_required' | 'cancelled';

export const KYC_STATUS_ARRAY: KycStatus[] = ['pending', 'approved', 'rejected', 'resubmit_required', 'cancelled'];

export interface KycRequest {
  id: string;
  user_id: string;
  document_type: string; // e.g., 'passport', 'driver_license', 'id_card'
  document_front_url: string;
  document_back_url?: string; // Optional, e.g., for ID cards
  selfie_url?: string; // Optional, for selfie verification
  status: KycStatus;
  rejection_reason?: string; // If status is 'rejected'
  admin_notes?: string; // Notes from the admin who reviewed
  submitted_at: string | Date;
  reviewed_at?: string | Date;
  reviewed_by?: string; // Admin user ID
  created_at: string | Date;
  updated_at: string | Date;
}

export interface KycSubmission {
  document_type: string;
  document_front: File;
  document_back?: File;
  selfie?: File;
}
