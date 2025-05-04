
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { BonusType } from '@/types';

/**
 * Bonus Service
 * Handles all bonus-related operations for the casino
 */
export interface Bonus {
  id: string;
  userId: string;
  type: BonusType;
  amount: number;
  status: 'active' | 'used' | 'expired' | 'cancelled' | 'pending';
  expiryDate: string;
  createdAt: string;
  updatedAt?: string;
  wageringRequirement: number;
  progress: number;
  description?: string;
  code?: string;
}

export interface BonusTemplate {
  id: string;
  name: string;
  description: string;
  type: BonusType;
  value: number;
  minDeposit?: number;
  wageringRequirement: number;
  durationDays: number;
  vipLevels: number[];
  isActive: boolean;
  bonusType?: string;
  percentage?: number;
  maxBonus?: number;
  vipLevelRequired?: number;
  allowedGames?: string;
  code?: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Get all bonuses for a user
 * @param userId User ID
 * @returns List of user's bonuses
 */
export const getUserBonuses = async (userId: string): Promise<Bonus[]> => {
  try {
    // Using a custom query instead of from() to avoid TypeScript errors
    const { data, error } = await supabase
      .from('user_bonuses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    if (!data) return [];
    
    return data.map(item => ({
      id: item.id,
      userId: item.user_id,
      type: item.type as BonusType,
      amount: item.amount,
      status: item.status,
      expiryDate: item.expiry_date,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      wageringRequirement: item.wagering_requirement,
      progress: item.progress,
      description: item.description,
      code: item.code
    }));
  } catch (error) {
    console.error(`Error fetching bonuses for user ${userId}:`, error);
    return [];
  }
};

/**
 * Get all available bonus templates
 * @returns List of bonus templates
 */
export const getBonusTemplates = async (): Promise<BonusTemplate[]> => {
  try {
    const { data, error } = await supabase
      .from('bonus_templates')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      type: item.type as BonusType,
      value: item.value,
      minDeposit: item.min_deposit,
      wageringRequirement: item.wagering_requirement,
      durationDays: item.duration_days,
      vipLevels: item.vip_levels || [],
      isActive: item.is_active,
      bonusType: item.bonus_type,
      percentage: item.percentage,
      maxBonus: item.max_bonus,
      vipLevelRequired: item.vip_level_required,
      allowedGames: item.allowed_games,
      code: item.code,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));
  } catch (error) {
    console.error('Error fetching bonus templates:', error);
    return [];
  }
};

/**
 * Create a new bonus for a user
 * @param bonus Bonus data
 * @returns The newly created bonus
 */
export const createBonus = async (bonus: Omit<Bonus, 'id' | 'createdAt' | 'updatedAt'>): Promise<Bonus | null> => {
  try {
    const { data, error } = await supabase
      .from('bonuses')
      .insert({
        user_id: bonus.userId,
        type: bonus.type,
        amount: bonus.amount,
        status: bonus.status,
        expiry_date: bonus.expiryDate,
        wagering_requirement: bonus.wageringRequirement,
        progress: bonus.progress,
        description: bonus.description,
        code: bonus.code
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      userId: data.user_id,
      type: data.type as BonusType,
      amount: data.amount,
      status: data.status,
      expiryDate: data.expiry_date,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      wageringRequirement: data.wagering_requirement,
      progress: data.progress,
      description: data.description,
      code: data.code
    };
  } catch (error) {
    console.error('Error creating bonus:', error);
    toast.error('Failed to create bonus');
    return null;
  }
};

/**
 * Create a new bonus template
 * @param template Bonus template data
 * @returns The newly created template
 */
export const createBonusTemplate = async (
  template: Omit<BonusTemplate, 'id' | 'createdAt' | 'updatedAt'>
): Promise<BonusTemplate | null> => {
  try {
    const { data, error } = await supabase
      .from('bonus_templates')
      .insert({
        name: template.name,
        description: template.description,
        type: template.type,
        value: template.value,
        min_deposit: template.minDeposit,
        wagering_requirement: template.wageringRequirement,
        duration_days: template.durationDays,
        vip_levels: template.vipLevels,
        is_active: template.isActive,
        bonus_type: template.bonusType,
        percentage: template.percentage,
        max_bonus: template.maxBonus,
        vip_level_required: template.vipLevelRequired,
        allowed_games: template.allowedGames,
        code: template.code
      })
      .select()
      .single();
    
    if (error) throw error;
    
    toast.success('Bonus template created successfully');
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      type: data.type as BonusType,
      value: data.value,
      minDeposit: data.min_deposit,
      wageringRequirement: data.wagering_requirement,
      durationDays: data.duration_days,
      vipLevels: data.vip_levels || [],
      isActive: data.is_active,
      bonusType: data.bonus_type,
      percentage: data.percentage,
      maxBonus: data.max_bonus,
      vipLevelRequired: data.vip_level_required,
      allowedGames: data.allowed_games,
      code: data.code,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('Error creating bonus template:', error);
    toast.error('Failed to create bonus template');
    return null;
  }
};

/**
 * Update bonus status
 * @param bonusId Bonus ID
 * @param status New status
 * @param progress New progress value
 * @returns Success status
 */
export const updateBonusStatus = async (
  bonusId: string,
  status: 'active' | 'used' | 'expired' | 'cancelled' | 'pending',
  progress?: number
): Promise<boolean> => {
  try {
    const updateData: any = { status };
    if (progress !== undefined) {
      updateData.progress = progress;
    }
    
    const { error } = await supabase
      .from('bonuses')
      .update(updateData)
      .eq('id', bonusId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error(`Error updating bonus ${bonusId} status:`, error);
    return false;
  }
};

/**
 * Apply bonus to user after validation
 * @param userId User ID
 * @param bonusCode Bonus code
 * @returns Success status
 */
export const applyBonus = async (userId: string, bonusCode: string): Promise<boolean> => {
  try {
    // Get the bonus template
    const { data: template, error: templateError } = await supabase
      .from('bonus_templates')
      .select('*')
      .eq('code', bonusCode)
      .eq('is_active', true)
      .single();
    
    if (templateError || !template) {
      toast.error('Invalid bonus code');
      return false;
    }
    
    // Create the bonus for the user
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + template.duration_days);
    
    const newBonus = {
      userId,
      type: template.type as BonusType,
      amount: template.value,
      status: 'active' as const,
      expiryDate: expiryDate.toISOString(),
      wageringRequirement: template.wagering_requirement,
      progress: 0,
      description: template.description,
      code: template.code
    };
    
    const result = await createBonus(newBonus);
    
    if (result) {
      toast.success(`Bonus "${template.name}" applied successfully`);
      return true;
    } else {
      toast.error('Failed to apply bonus');
      return false;
    }
  } catch (error) {
    console.error('Error applying bonus:', error);
    toast.error('Error applying bonus');
    return false;
  }
};

export const bonusService = {
  getUserBonuses,
  getBonusTemplates,
  createBonus,
  createBonusTemplate,
  updateBonusStatus,
  applyBonus
};

export default bonusService;
