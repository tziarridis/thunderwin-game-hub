
import { supabase } from '@/integrations/supabase/client';

export interface KycRequest {
  id: string;
  user_id: string; // ID from your public 'users' table, not auth.users.id directly
  document_type: 'passport' | 'id_card' | 'drivers_license' | string; // Allow string for flexibility
  document_front_url?: string; // URL to the uploaded document (front)
  document_back_url?: string; // URL to the uploaded document (back, if applicable)
  selfie_url?: string; // URL to the selfie image
  status: 'pending' | 'approved' | 'rejected' | 'resubmit_required';
  rejection_reason?: string;
  notes?: string; // Admin notes
  created_at: string | Date;
  updated_at: string | Date;
  user_details?: { // Optional: To join and display user email/name
    email?: string;
    username?: string;
  };
}

export const kycService = {
  // Get all KYC requests (admin)
  async getAllKycRequests(filters?: { status?: KycRequest['status'], userId?: string }): Promise<KycRequest[]> {
    let query = supabase
      .from('kyc_requests') // Ensure you have this table
      .select(`
        *,
        user_details:users (email, username) 
      `) // Example join if user_id in kyc_requests fkeys users.id
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching KYC requests:', error);
      throw error;
    }
    return data || [];
  },

  // Get KYC requests for a specific user
  async getUserKycRequests(userId: string): Promise<KycRequest[]> {
    const { data, error } = await supabase
      .from('kyc_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Error fetching KYC requests for user ${userId}:`, error);
      throw error;
    }
    return data || [];
  },
  
  // Create a new KYC request (user submitting documents)
  async createKycRequest(
    userId: string, 
    documentType: KycRequest['document_type'],
    // file uploads would be handled separately, then URLs passed here
    documentFrontUrl: string, 
    documentBackUrl?: string,
    selfieUrl?: string
  ): Promise<KycRequest> {
    const { data, error } = await supabase
      .from('kyc_requests')
      .insert({ 
        user_id: userId, 
        document_type: documentType,
        document_front_url: documentFrontUrl,
        document_back_url: documentBackUrl,
        selfie_url: selfieUrl,
        status: 'pending' 
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating KYC request:', error);
      throw error;
    }
    return data;
  },

  // Update KYC request status (admin action)
  async updateKycRequestStatus(
    id: string, 
    status: KycRequest['status'], 
    rejectionReason?: string,
    notes?: string
  ): Promise<KycRequest> {
    const updatePayload: Partial<KycRequest> = { status, updated_at: new Date().toISOString() };
    if (rejectionReason) updatePayload.rejection_reason = rejectionReason;
    if (notes) updatePayload.notes = notes;

    const { data, error } = await supabase
      .from('kyc_requests')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error(`Error updating KYC request ${id}:`, error);
      throw error;
    }
    return data;
  }
};

export default kycService;
