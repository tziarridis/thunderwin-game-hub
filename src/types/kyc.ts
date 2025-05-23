
// src/types/kyc.ts

export enum KycStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  RESUBMIT_REQUIRED = 'resubmit_required',
  // Add other statuses as needed
}

export enum KycDocumentTypeEnum {
  PASSPORT = 'passport',
  DRIVERS_LICENSE = 'drivers_license',
  NATIONAL_ID = 'national_id',
  UTILITY_BILL = 'utility_bill',
  // Add other document types as needed
}

export interface KycRequest {
  id: string;
  user_id: string; // Ensure this field exists
  status: KycStatus;
  document_type?: KycDocumentTypeEnum | string; // Make it flexible
  documents: Array<{ url: string; type: string }>; // Example structure
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  // Add any other relevant fields for a KYC request
  admin_notes?: string;
  reviewed_by?: string; // Admin user ID
}

// Represents the data structure for submitting a KYC request
export interface KycSubmission {
  document_type: KycDocumentTypeEnum | string;
  // This would typically include file uploads, which are complex.
  // For now, let's assume file URLs or identifiers are passed.
  document_urls: string[]; 
  additional_info?: string;
}
