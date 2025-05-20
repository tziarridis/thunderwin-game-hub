
import { supabase } from '@/integrations/supabase/client';
import { KycRequest, KycStatus, KycSubmission } from '@/types/kyc'; // Ensure correct import
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

    const kycData: Omit<KycRequest, 'id' | 'submitted_at' | 'created_at' | 'updated_at' | 'status' | 'reviewed_at' | 'reviewed_by' | 'rejection_reason' | 'admin_notes'> = {
      user_id: userId,
      document_type: submission.document_type,
      document_front_url: documentFrontUrl,
      document_back_url: documentBackUrl,
      selfie_url: selfieUrl,
    };

    const { data, error }: PostgrestSingleResponse<KycRequest> = await supabase
      .from('kyc_requests') // Ensure this table name is correct
      .insert({ ...kycData, status: 'pending' as KycStatus, submitted_at: new Date().toISOString() })
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
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  // For Admin
  async getAllKycRequests(filters: { status?: KycStatus, userId?: string } = {}): Promise<KycRequest[]> {
    let query = supabase.from('kyc_requests').select('*');
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
    adminNotes?: string
  ): Promise<KycRequest | null> {
    const updateData: Partial<KycRequest> = {
      status,
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
      rejection_reason: rejectionReason,
      admin_notes: adminNotes,
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

// Ensure you have a 'kyc_documents' bucket in Supabase Storage with appropriate policies.
// Example policies for kyc_documents bucket:
// For select: (bucket_id = 'kyc_documents' AND (storage.foldername(name))[1] = uid()::text) OR (select true from profiles where id = uid() and role = 'admin')
// For insert: (bucket_id = 'kyc_documents' AND (storage.foldername(name))[1] = uid()::text)
// For update: (bucket_id = 'kyc_documents' AND (storage.foldername(name))[1] = uid()::text) OR (select true from profiles where id = uid() and role = 'admin')
// For delete: (bucket_id = 'kyc_documents' AND (storage.foldername(name))[1] = uid()::text) OR (select true from profiles where id = uid() and role = 'admin')
// Replace 'profiles' and 'role' with your actual user table and role column if different.
