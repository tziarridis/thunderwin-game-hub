
export enum KycStatusEnum {
  PENDING = "pending",
  UNDER_REVIEW = "under_review",
  APPROVED = "approved",
  REJECTED = "rejected",
  EXPIRED = "expired",
  RESUBMIT_REQUIRED = "resubmit_required"
}

export enum KycDocumentTypeEnum {
  PASSPORT = "passport",
  DRIVERS_LICENSE = "drivers_license",
  NATIONAL_ID = "national_id",
  UTILITY_BILL = "utility_bill",
  BANK_STATEMENT = "bank_statement"
}

export type KycStatus = `${KycStatusEnum}`;
export type KycDocumentType = `${KycDocumentTypeEnum}`;

export interface KycDocument {
  id: string;
  type: KycDocumentType;
  file_url: string;
  status: KycStatus;
  uploaded_at: string;
}

export interface KycData {
  id: string;
  user_id: string;
  status: KycStatus;
  documents: KycDocument[];
  submitted_at?: string;
  reviewed_at?: string;
  notes?: string;
}

export interface KycRequest {
  id: string;
  user_id: string;
  document_type: string;
  document_front_url?: string | null;
  document_back_url?: string | null;
  status: KycStatus;
  created_at: string;
  updated_at: string;
}
