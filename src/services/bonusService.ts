
import { supabase } from "@/integrations/supabase/client";
import { BonusType, BonusTemplate, UserBonus } from "@/types";
import { toast } from "sonner";

// Get all bonus templates
export const getBonusTemplates = async (): Promise<BonusTemplate[]> => {
  try {
    const { data, error } = await supabase
      .from('bonus_templates')
      .select('*');

    if (error) throw error;
    return data as BonusTemplate[];
  } catch (error) {
    console.error("Error fetching bonus templates:", error);
    return [];
  }
};

// Create a new bonus template
export const createBonusTemplate = async (template: Omit<BonusTemplate, 'id'>): Promise<BonusTemplate | null> => {
  try {
    const { data, error } = await supabase
      .from('bonus_templates')
      .insert({
        name: template.name,
        description: template.description,
        type: template.type,
        value: template.value,
        minDeposit: template.minDeposit,
        wageringRequirement: template.wageringRequirement,
        durationDays: template.durationDays,
        forVipLevels: template.forVipLevels,
        isActive: template.isActive ? 1 : 0, // Convert boolean to number
      })
      .select()
      .single();

    if (error) throw error;
    toast.success("Bonus template created successfully");
    return data as BonusTemplate;
  } catch (error) {
    console.error("Error creating bonus template:", error);
    toast.error("Failed to create bonus template");
    return null;
  }
};

// Update an existing bonus template
export const updateBonusTemplate = async (id: string, updates: Partial<BonusTemplate>): Promise<BonusTemplate | null> => {
  try {
    // Convert boolean to number for database storage
    const dbUpdates = {
      ...updates,
      isActive: updates.isActive !== undefined ? (updates.isActive ? 1 : 0) : undefined
    };
    
    const { data, error } = await supabase
      .from('bonus_templates')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    toast.success("Bonus template updated successfully");
    return data as BonusTemplate;
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
    const { data: template, error: templateError } = await supabase
      .from('bonus_templates')
      .select('*')
      .eq('id', bonusTemplateId)
      .single();

    if (templateError) throw templateError;
    if (!template) throw new Error("Bonus template not found");

    // Calculate expiry date
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + template.durationDays);

    // Create user bonus record
    const bonusData = {
      userId: userId,
      bonusId: template.id,
      type: template.type,
      amount: template.value,
      status: 'active',
      dateIssued: new Date().toISOString(),
      expiryDate: expiryDate.toISOString(),
      wageringRequirement: template.wageringRequirement,
      wageringCompleted: 0
    };

    const { error: insertError } = await supabase
      .from('user_bonuses')
      .insert(bonusData);

    if (insertError) throw insertError;
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
    const { data, error } = await supabase
      .from('user_bonuses')
      .select('*')
      .eq('userId', userId);

    if (error) throw error;
    return data as UserBonus[];
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
