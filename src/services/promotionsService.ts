
import { Promotion } from '@/types/promotion'; // Ensure this path is correct

// Mock implementation for getActivePromotions
export const getActivePromotions = async (): Promise<Promotion[]> => {
  console.log('promotionsService: getActivePromotions called (mock)');
  // In a real scenario, this would fetch data from an API or Supabase
  // Returning an empty array or mock data for now
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
  return []; 
};

interface ClaimPromotionResult {
  success: boolean;
  message?: string;
  error?: string;
  // Potentially include updated user bonus/wallet info
}

// Mock implementation for claimPromotion
export const claimPromotion = async (userId: string, promotionId: string): Promise<ClaimPromotionResult> => {
  console.log(`promotionsService: claimPromotion called for user ${userId}, promo ${promotionId} (mock)`);
  // In a real scenario, this would make an API call to claim the promotion
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

  // Simulate success or failure
  const isSuccess = Math.random() > 0.2; // 80% chance of success for mock

  if (isSuccess) {
    return {
      success: true,
      message: `Promotion ${promotionId} claimed successfully (mock).`,
    };
  } else {
    return {
      success: false,
      error: `Failed to claim promotion ${promotionId} (mock). Insufficient funds or not eligible.`,
    };
  }
};

export const promotionsService = {
  getActivePromotions,
  claimPromotion,
};

export default promotionsService;
