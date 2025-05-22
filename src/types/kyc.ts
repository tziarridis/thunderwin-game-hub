
export enum KycStatusEnum {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  RESUBMIT = "resubmit",
  NOT_SUBMITTED = "not_submitted",
}
export type KycStatus = `${KycStatusEnum}`; // This export was likely the issue if it was missing or incorrect

export enum KycDocumentTypeEnum {
  PASSPORT = "passport",
  NATIONAL_ID = "national_id",
  DRIVING_LICENSE = "driving_license",
  UTILITY_BILL = "utility_bill",
  BANK_STATEMENT = "bank_statement",
}
export type KycDocumentType = `${KycDocumentTypeEnum}`;


export interface KycRequest {
  id: string; 
  user_id: string; 
  status: KycStatus;
  document_type: KycDocumentType | string; 
  document_front_url?: string | null;
  document_back_url?: string | null;
  selfie_url?: string | null;
  submitted_at: string; 
  reviewed_at?: string | null; 
  reviewed_by?: string | null; 
  rejection_reason?: string | null;
  notes?: string | null; 
  created_at?: string;
  updated_at?: string;
  user?: { // Optional user data if joined
    id: string;
    email?: string;
    full_name?: string; // Ensure this matches your users table structure or profile data
  } | null;
}

export interface KycFormValues {
  document_type: KycDocumentType | '';
  document_front?: FileList | null;
  document_back?: FileList | null;
  selfie?: FileList | null;
}
