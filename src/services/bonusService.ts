
import { supabase } from '@/integrations/supabase/client';
import { BonusTemplate, BonusType, UserBonus } from '@/types';

interface CreateBonusTemplateParams {
  name: string;
  type: BonusType;
  value: number;
  percentage: boolean; // Changed from isPercentage
  minDepositAmount?: number;
  maxBonusAmount?: number;
  wageringRequirement: number;
  durationDays: number;  // Changed from validityDays
  description: string;
}

interface AssignBonusParams {
  userId: string;
  templateId: string;
  value?: number;
}

// Mock data for demonstration
const mockBonusTemplates: BonusTemplate[] = [
  {
    id: "1",
    name: "Welcome Bonus 100%",
    type: BonusType.WELCOME,
    value: 100,
    percentage: true,  // Changed from isPercentage
    minDepositAmount: 10,
    maxBonusAmount: 200,
    wageringRequirement: 35,
    durationDays: 30,
    description: "100% bonus on your first deposit up to $200",
    isActive: true,
    forVipLevels: [1, 2, 3]
  },
  {
    id: "2",
    name: "Free Spins",
    type: BonusType.FREE_SPINS,
    value: 50,
    percentage: false,  // Changed from isPercentage
    wageringRequirement: 40,
    durationDays: 7,
    description: "50 free spins on selected slots",
    isActive: true,
    forVipLevels: [1, 2, 3, 4, 5]
  }
];

const mockUserBonuses: UserBonus[] = [];

export const getBonusTemplates = async (): Promise<BonusTemplate[]> => {
  try {
    // Normally this would be a database call
    return mockBonusTemplates;
  } catch (error) {
    console.error('Error fetching bonus templates:', error);
    return [];
  }
};

export const getUserBonuses = async (userId: string): Promise<UserBonus[]> => {
  try {
    // Normally this would be a database call
    return mockUserBonuses.filter(bonus => bonus.userId === userId);
  } catch (error) {
    console.error('Error fetching user bonuses:', error);
    return [];
  }
};

export const createBonusTemplate = async (params: CreateBonusTemplateParams): Promise<BonusTemplate | null> => {
  try {
    const newTemplate: BonusTemplate = {
      id: `template-${Date.now()}`,
      ...params,
      isActive: true,
      forVipLevels: [1, 2, 3] // Default VIP levels if not provided
    };
    
    mockBonusTemplates.push(newTemplate);
    return newTemplate;
  } catch (error) {
    console.error('Error creating bonus template:', error);
    return null;
  }
};

export const assignBonusToUser = async (params: AssignBonusParams): Promise<UserBonus | null> => {
  try {
    const { userId, templateId, value } = params;
    
    // Find the template
    const template = mockBonusTemplates.find(t => t.id === templateId);
    if (!template) {
      throw new Error('Bonus template not found');
    }
    
    // Create a new user bonus
    const userBonus: UserBonus = {
      id: `bonus-${Date.now()}`,
      userId,
      templateId,
      type: template.type,
      value: value || template.value,
      wageringRequired: template.wageringRequirement * (value || template.value),
      wageringCompleted: 0,
      expiresAt: new Date(Date.now() + template.durationDays * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      status: 'ACTIVE',
      balance: value || template.value
    };
    
    mockUserBonuses.push(userBonus);
    return userBonus;
  } catch (error) {
    console.error('Error assigning bonus to user:', error);
    return null;
  }
};

export const updateUserBonusWagering = async (
  bonusId: string, 
  wageringAmount: number
): Promise<UserBonus | null> => {
  try {
    // Find the user bonus
    const index = mockUserBonuses.findIndex(b => b.id === bonusId);
    if (index === -1) {
      throw new Error('User bonus not found');
    }
    
    // Update the wagering completed
    mockUserBonuses[index].wageringCompleted += wageringAmount;
    
    // Check if wagering is completed
    if (mockUserBonuses[index].wageringCompleted >= mockUserBonuses[index].wageringRequired) {
      mockUserBonuses[index].status = 'COMPLETED';
    }
    
    return mockUserBonuses[index];
  } catch (error) {
    console.error('Error updating user bonus wagering:', error);
    return null;
  }
};

// Mock function for BonusManagement.tsx
export const updateBonusStatus = async (bonusId: string, status: string): Promise<boolean> => {
  try {
    const index = mockUserBonuses.findIndex(b => b.id === bonusId);
    if (index !== -1) {
      mockUserBonuses[index].status = status as 'ACTIVE' | 'COMPLETED' | 'EXPIRED' | 'CANCELED';
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating bonus status:', error);
    return false;
  }
};

// Export as bonusService object for BonusManagement.tsx
export const bonusService = {
  getBonusTemplates,
  getUserBonuses,
  createBonusTemplate,
  assignBonusToUser,
  updateUserBonusWagering,
  updateBonusStatus
};

export default bonusService;
