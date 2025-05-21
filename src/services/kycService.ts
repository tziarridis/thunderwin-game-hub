import { supabase } from '@/integrations/supabase/client';
import { KycRequest, KycStatus, KycSubmission, KycDocumentType } from '@/types/kyc'; // Ensure correct import
import { PostgrestSingleResponse, PostgrestResponse } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Helper to upload a file and return its public URL
async function uploadKycFile(userId: string, file: File, type: string): Promise<string> {
  const fileName = `${userId}/${type}-${uuidv4()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from('kyc_documents') // Make sure this bucket exists and has correct policies
    .upload(fileName, file);

  if (error) {
    console.error(`Error uploading KYC ${type} file:`, error);
    throw error;
  }
  
  const { data: publicUrlData } = supabase.storage
    .from('kyc_documents')
    .getPublicUrl(data.path);
    
  return publicUrlData.publicUrl;
}

// Helper function to split full name
const splitFullName = (fullName: string): { firstName?: string, lastName?: string } => {
  if (!fullName) return { firstName: undefined, lastName: undefined };
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts.shift();
  const lastName = parts.join(' ') || undefined; // Handle single name case
  return { firstName, lastName };
};


export const kycService = {
  async submitKycRequest(userId: string, submission: KycSubmission): Promise<KycRequest> {
    const documentFrontUrl = await uploadKycFile(userId, submission.document_front, 'document_front');
    let documentBackUrl: string | undefined;
    if (submission.document_back) {
      documentBackUrl = await uploadKycFile(userId, submission.document_back, 'document_back');
    }
    let selfieUrl: string | undefined;
    if (submission.selfie) {
      selfieUrl = await uploadKycFile(userId, submission.selfie, 'selfie');
    }

    const { firstName, lastName } = splitFullName(submission.first_name); // Assuming submission.first_name is the full name for now. This should be submission.fullName from the form.
                                                                         // Correcting: KycSubmission has first_name and last_name already.

    const kycDataForInsert: Omit<KycRequest, 'id' | 'created_at' | 'updated_at' | 'reviewed_at' | 'reviewed_by' | 'rejection_reason' | 'notes' | 'documents'> = {
      user_id: userId,
      status: KycStatus.PENDING,
      submitted_at: new Date().toISOString(),
      
      first_name: submission.first_name,
      last_name: submission.last_name,
      date_of_birth: submission.date_of_birth,
      address_line1: submission.address_line1,
      address_line2: submission.address_line2,
      city: submission.city,
      state_province: submission.state_province,
      postal_code: submission.postal_code,
      country_code: submission.country_code, // Make sure this is an ISO code if your DB expects that

      document_type: submission.document_type, // This is the enum value
      document_front_url: documentFrontUrl,
      document_back_url: documentBackUrl,
      selfie_url: selfieUrl,
      // documentNumber is often part of the KycDocument, not KycRequest directly.
      // If it needs to be on KycRequest, add a field there and pass submission.documentNumber.
    };

    const { data, error } = await supabase
      .from('kyc_requests') 
      .insert(kycDataForInsert)
      .select()
      .single();

    if (error) {
      console.error('Error creating KYC request:', error);
      throw error;
    }
    return data as KycRequest;
  },

  async getUserKycRequests(userId: string): Promise<KycRequest[]> {
    const { data, error }: PostgrestResponse<KycRequest> = await supabase
      .from('kyc_requests')
      .select('*')
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching user KYC requests:', error);
      throw error;
    }
    return data || [];
  },

  async getKycRequestById(id: string): Promise<KycRequest | null> {
    const { data, error }: PostgrestSingleResponse<KycRequest> = await supabase
      .from('kyc_requests')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching KYC request by ID:', error);
      if (error.code === 'PGRST116') return null; // No rows found
      throw error;
    }
    return data;
  },

  // For Admin
  async getAllKycRequests(filters: { status?: KycStatus, userId?: string } = {}): Promise<KycRequest[]> {
    let query = supabase.from('kyc_requests').select('*, user:profiles (id, email, username, first_name, last_name)'); // Ensure join syntax if needed or rely on KycRequestWithUser type from direct query on admin page
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.userId) {
      query = query.eq('user_id', filters.userId);
    }
    query = query.order('submitted_at', { ascending: false });
    
    const { data, error }: PostgrestResponse<KycRequest> = await query;

    if (error) {
      console.error('Error fetching all KYC requests:', error);
      throw error;
    }
    return data || [];
  },

  async updateKycRequestStatus(
    id: string, 
    status: KycStatus, 
    adminId: string, 
    rejectionReason?: string, 
    adminNotes?: string // Changed from notes to adminNotes for clarity if schema has admin_notes
  ): Promise<KycRequest | null> {
    const updateData: Partial<KycRequest> = {
      status,
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
      rejection_reason: rejectionReason,
      notes: adminNotes, // Assuming 'notes' is the column for admin notes in kyc_requests
    };

    const { data, error }: PostgrestSingleResponse<KycRequest> = await supabase
      .from('kyc_requests')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating KYC request status:', error);
      throw error;
    }
    return data;
  },
};
