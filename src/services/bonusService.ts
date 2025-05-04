
import { supabase } from '@/integrations/supabase/client';
import { BonusTemplate, BonusType, UserBonus } from '@/types';

interface CreateBonusTemplateParams {
  name: string;
  type: BonusType;
  value: number;
  isPercentage: boolean;
  minDepositAmount?: number;
  maxBonusAmount?: number;
  wageringRequirements: number;
  validityDays: number;
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
    isPercentage: true,
    minDepositAmount: 10,
    maxBonusAmount: 200,
    wageringRequirements: 35,
    validityDays: 30,
    description: "100% bonus on your first deposit up to $200",
    isActive: true
  },
  {
    id: "2",
    name: "Free Spins",
    type: BonusType.FREE_SPINS,
    value: 50,
    isPercentage: false,
    wageringRequirements: 40,
    validityDays: 7,
    description: "50 free spins on selected slots",
    isActive: true
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
      isActive: true
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
      wageringRequired: template.wageringRequirements * (value || template.value),
      wageringCompleted: 0,
      expiresAt: new Date(Date.now() + template.validityDays * 24 * 60 * 60 * 1000).toISOString(),
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

export default {
  getBonusTemplates,
  getUserBonuses,
  createBonusTemplate,
  assignBonusToUser,
  updateUserBonusWagering
};
