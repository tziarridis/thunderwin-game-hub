
import { supabase } from "@/integrations/supabase/client";
import { BonusType, UserBonus } from "@/types/bonus";
import { BonusTemplate } from "@/types";
import { toast } from "sonner";

// Mock data for bonus templates (since the Supabase table doesn't exist yet)
const mockBonusTemplates: BonusTemplate[] = [
  {
    id: "1",
    name: "Welcome Bonus",
    description: "100% match on your first deposit",
    type: "deposit",
    value: 100,
    minDeposit: 20,
    wageringRequirement: 30,
    durationDays: 7,
    forVipLevels: [0, 1, 2],
    isActive: true
  },
  {
    id: "2",
    name: "Free Spins",
    description: "50 free spins on Starburst",
    type: "free_spins",
    value: 50,
    minDeposit: 0,
    wageringRequirement: 20,
    durationDays: 3,
    forVipLevels: [0, 1, 2, 3],
    isActive: true
  }
];

// Get all bonus templates
export const getBonusTemplates = async (): Promise<BonusTemplate[]> => {
  try {
    // Since the bonus_templates table doesn't exist yet, we use mock data
    // Later this would be replaced with the Supabase query
    return mockBonusTemplates;
  } catch (error) {
    console.error("Error fetching bonus templates:", error);
    return [];
  }
};

// Create a new bonus template
export const createBonusTemplate = async (template: Omit<BonusTemplate, 'id'>): Promise<BonusTemplate | null> => {
  try {
    // In production, this would insert into the database
    // For now, mock the response
    const newTemplate: BonusTemplate = {
      ...template,
      id: `bonus_${Date.now()}`
    };
    
    toast.success("Bonus template created successfully");
    return newTemplate;
  } catch (error) {
    console.error("Error creating bonus template:", error);
    toast.error("Failed to create bonus template");
    return null;
  }
};

// Update an existing bonus template
export const updateBonusTemplate = async (id: string, updates: Partial<BonusTemplate>): Promise<BonusTemplate | null> => {
  try {
    // In production, this would update the database
    // For now, mock the response
    const updatedTemplate = mockBonusTemplates.find(template => template.id === id);
    
    if (!updatedTemplate) {
      throw new Error("Bonus template not found");
    }
    
    const updated: BonusTemplate = {
      ...updatedTemplate,
      ...updates
    };
    
    toast.success("Bonus template updated successfully");
    return updated;
  } catch (error) {
    console.error(`Error updating bonus template ${id}:`, error);
    toast.error("Failed to update bonus template");
    return null;
  }
};

// Issue a bonus to a user
export const issueBonusToUser = async (userId: string, bonusTemplateId: string): Promise<boolean> => {
  try {
    // Get the bonus template
    const template = mockBonusTemplates.find(t => t.id === bonusTemplateId);

    if (!template) throw new Error("Bonus template not found");

    // Calculate expiry date
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + template.durationDays);

    // Create user bonus record (mock)
    const bonusData = {
      userId: userId,
      bonusId: template.id,
      type: template.type as BonusType,
      amount: template.value,
      status: 'active' as const,
      dateIssued: new Date().toISOString(),
      expiryDate: expiryDate.toISOString(),
      wageringRequirement: template.wageringRequirement,
      wageringCompleted: 0
    };

    console.log("New bonus issued:", bonusData);
    toast.success("Bonus issued to user successfully");
    return true;
  } catch (error) {
    console.error(`Error issuing bonus to user ${userId}:`, error);
    toast.error("Failed to issue bonus");
    return false;
  }
};

// Get all bonuses for a specific user
export const getUserBonuses = async (userId: string): Promise<UserBonus[]> => {
  try {
    // Mock data for user bonuses
    const mockUserBonuses: UserBonus[] = [
      {
        id: "bonus1",
        userId: userId,
        bonusId: "1",
        type: "welcome",
        amount: 100,
        status: 'active',
        dateIssued: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        wageringRequirement: 30,
        wageringCompleted: 10
      }
    ];
    
    return mockUserBonuses;
  } catch (error) {
    console.error(`Error fetching bonuses for user ${userId}:`, error);
    return [];
  }
};

// Apply a specific bonus to a user's bet or deposit
export const applyBonus = async (bonusId: string, amount: number): Promise<boolean> => {
  try {
    // In a real implementation, this would apply the bonus to a user's account
    // and update the wagering progress
    console.log(`Applying bonus ${bonusId} with amount ${amount}`);
    return true;
  } catch (error) {
    console.error(`Error applying bonus ${bonusId}:`, error);
    return false;
  }
};

export const bonusService = {
  getBonusTemplates,
  createBonusTemplate,
  updateBonusTemplate,
  issueBonusToUser,
  getUserBonuses,
  applyBonus
};

export default bonusService;
