
import { supabase } from "@/integrations/supabase/client";
import { BonusType, UserBonus, BonusTemplate } from "@/types/bonus";
import { toast } from "sonner";

// Get all bonus templates from the database
export const getBonusTemplates = async (): Promise<BonusTemplate[]> => {
  try {
    const { data, error } = await supabase
      .from('bonus_types')
      .select('*')
      .eq('status', 'active');
      
    if (error) throw error;
    
    // Map database records to BonusTemplate type
    return (data || []).map(item => ({
      id: item.id,
      name: item.name,
      description: item.description || '',
      type: item.name.toLowerCase().replace(' ', '_') as string,
      value: item.bonus_percentage || 0,
      minDeposit: item.max_amount || 0,
      wageringRequirement: item.wagering_requirement || 0,
      durationDays: item.duration_days || 7,
      forVipLevels: [0, 1, 2, 3, 4, 5], // Default to all VIP levels
      isActive: item.status === 'active'
    }));
  } catch (error) {
    console.error("Error fetching bonus templates:", error);
    return [];
  }
};

// Create a new bonus template
export const createBonusTemplate = async (template: Omit<BonusTemplate, 'id'>): Promise<BonusTemplate | null> => {
  try {
    // Convert BonusTemplate to database format
    const dbBonusType = {
      name: template.name,
      description: template.description,
      bonus_percentage: template.value,
      max_amount: template.minDeposit,
      wagering_requirement: template.wageringRequirement,
      duration_days: template.durationDays,
      status: template.isActive ? 'active' : 'inactive'
    };
    
    // Insert into database
    const { data, error } = await supabase
      .from('bonus_types')
      .insert(dbBonusType)
      .select()
      .single();
      
    if (error) throw error;
    
    // Convert back to BonusTemplate format
    const newTemplate: BonusTemplate = {
      id: data.id,
      name: data.name,
      description: data.description || '',
      type: data.name.toLowerCase().replace(' ', '_') as string,
      value: data.bonus_percentage || 0,
      minDeposit: data.max_amount || 0,
      wageringRequirement: data.wagering_requirement || 0,
      durationDays: data.duration_days || 7,
      forVipLevels: [0, 1, 2, 3, 4, 5], // Default to all VIP levels
      isActive: data.status === 'active'
    };
    
    toast.success("Bonus template created successfully");
    return newTemplate;
  } catch (error: any) {
    console.error("Error creating bonus template:", error);
    toast.error("Failed to create bonus template");
    return null;
  }
};

// Update an existing bonus template
export const updateBonusTemplate = async (id: string, updates: Partial<BonusTemplate>): Promise<BonusTemplate | null> => {
  try {
    // Convert updates to database format
    const dbUpdates: any = {};
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.value !== undefined) dbUpdates.bonus_percentage = updates.value;
    if (updates.minDeposit !== undefined) dbUpdates.max_amount = updates.minDeposit;
    if (updates.wageringRequirement !== undefined) dbUpdates.wagering_requirement = updates.wageringRequirement;
    if (updates.durationDays !== undefined) dbUpdates.duration_days = updates.durationDays;
    if (updates.isActive !== undefined) dbUpdates.status = updates.isActive ? 'active' : 'inactive';
    
    // Update in database
    const { data, error } = await supabase
      .from('bonus_types')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    
    // Convert back to BonusTemplate format
    const updated: BonusTemplate = {
      id: data.id,
      name: data.name,
      description: data.description || '',
      type: data.name.toLowerCase().replace(' ', '_') as string,
      value: data.bonus_percentage || 0,
      minDeposit: data.max_amount || 0,
      wageringRequirement: data.wagering_requirement || 0,
      durationDays: data.duration_days || 7,
      forVipLevels: [0, 1, 2, 3, 4, 5], // Default to all VIP levels
      isActive: data.status === 'active'
    };
    
    toast.success("Bonus template updated successfully");
    return updated;
  } catch (error: any) {
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
      .from('bonus_types')
      .select('*')
      .eq('id', bonusTemplateId)
      .single();
      
    if (templateError) throw templateError;
    if (!template) throw new Error("Bonus template not found");

    // Calculate expiry date
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + template.duration_days);

    // Create user bonus record
    const bonusData = {
      user_id: userId,
      bonus_type_id: template.id,
      amount: template.bonus_percentage || 0,
      wagering_requirement_amount: (template.bonus_percentage || 0) * (template.wagering_requirement || 1),
      wagering_completed_amount: 0,
      status: 'active',
      expires_at: expiryDate.toISOString()
    };

    const { error } = await supabase
      .from('user_bonuses')
      .insert(bonusData);
      
    if (error) throw error;
    
    toast.success("Bonus issued to user successfully");
    return true;
  } catch (error: any) {
    console.error(`Error issuing bonus to user ${userId}:`, error);
    toast.error("Failed to issue bonus");
    return false;
  }
};

// Get all bonuses for a specific user
export const getUserBonuses = async (userId: string): Promise<UserBonus[]> => {
  try {
    // Get user bonuses from database
    const { data, error } = await supabase
      .from('user_bonuses')
      .select(`
        id,
        amount,
        status,
        created_at,
        expires_at,
        wagering_requirement_amount,
        wagering_completed_amount,
        bonus_types (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    // Map to UserBonus type
    return (data || []).map((item: any) => ({
      id: item.id,
      userId: userId,
      bonusId: item.bonus_types?.id || '',
      type: (item.bonus_types?.name || 'deposit').toLowerCase().replace(' ', '_') as BonusType,
      amount: item.amount,
      status: item.status,
      dateIssued: item.created_at,
      expiryDate: item.expires_at,
      wageringRequirement: item.wagering_requirement_amount,
      wageringCompleted: item.wagering_completed_amount
    }));
  } catch (error: any) {
    console.error(`Error fetching bonuses for user ${userId}:`, error);
    return [];
  }
};

// Apply a bonus to a bet (update wagering)
export const updateBonusWagering = async (bonusId: string, amount: number): Promise<boolean> => {
  try {
    // Update the wagering completed amount
    const { data: bonus, error: getError } = await supabase
      .from('user_bonuses')
      .select('wagering_completed_amount, wagering_requirement_amount, status')
      .eq('id', bonusId)
      .single();
      
    if (getError) throw getError;
    if (!bonus || bonus.status !== 'active') return false;
    
    // Calculate new wagering completed
    const newWageringCompleted = (bonus.wagering_completed_amount || 0) + amount;
    
    // Check if wagering is complete
    let status = bonus.status;
    if (newWageringCompleted >= bonus.wagering_requirement_amount) {
      status = 'completed';
    }
    
    // Update bonus record
    const { error: updateError } = await supabase
      .from('user_bonuses')
      .update({
        wagering_completed_amount: newWageringCompleted,
        status: status
      })
      .eq('id', bonusId);
      
    if (updateError) throw updateError;
    
    return true;
  } catch (error: any) {
    console.error(`Error updating bonus wagering ${bonusId}:`, error);
    return false;
  }
};

export const bonusService = {
  getBonusTemplates,
  createBonusTemplate,
  updateBonusTemplate,
  issueBonusToUser,
  getUserBonuses,
  updateBonusWagering
};

export default bonusService;
