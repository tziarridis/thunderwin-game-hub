
import { KycRequest, KycStatus } from '@/types';

export const kycService = {
  getAllKycRequests: async (params?: any): Promise<{ requests: KycRequest[], totalCount: number }> => {
    console.log('kycService: Fetching all KYC requests with params', params);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { requests: [], totalCount: 0 };
    } catch (error: any) {
      console.error('Error fetching KYC requests:', error.message);
      throw error;
    }
  },

  updateKycRequestStatus: async (id: string, status: KycStatus, adminId?: string, rejectionReason?: string): Promise<KycRequest> => {
    console.log(`kycService: Updating KYC request ${id} status to ${status}`);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        id,
        status,
        updated_at: new Date().toISOString()
      } as KycRequest;
    } catch (error: any) {
      console.error('Error updating KYC status:', error.message);
      throw error;
    }
  }
};

export default kycService;
