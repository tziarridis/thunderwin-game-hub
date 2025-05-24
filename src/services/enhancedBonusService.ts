
import { supabase } from '@/integrations/supabase/client';

export interface BonusTemplate {
  id: string;
  name: string;
  type: 'deposit' | 'freespins' | 'cashback' | 'reload' | 'welcome';
  value: number;
  percentage?: number;
  minDeposit: number;
  maxBonus?: number;
  wageringRequirement: number;
  expiryDays: number;
  gameRestrictions?: string[];
  countryRestrictions?: string[];
  vipLevels: number[];
  isActive: boolean;
  abusePreventionRules: AbusePreventionRule[];
}

export interface AbusePreventionRule {
  type: 'max_claims_per_day' | 'max_claims_per_user' | 'min_deposit_history' | 'account_age_days';
  value: number;
}

export interface UserBonus {
  id: string;
  userId: string;
  bonusTemplateId: string;
  amount: number;
  wageringRequired: number;
  wageringCompleted: number;
  status: 'active' | 'completed' | 'expired' | 'forfeited';
  expiresAt: string;
  createdAt: string;
  template: BonusTemplate;
}

export interface WageringProgress {
  totalRequired: number;
  completed: number;
  remaining: number;
  percentage: number;
  eligibleGames: string[];
}

class EnhancedBonusService {
  
  async getBonusTemplates(vipLevel: number = 0): Promise<BonusTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('bonus_templates')
        .select('*')
        .eq('is_active', true)
        .contains('vip_levels', [vipLevel]);
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching bonus templates:', error);
      return [];
    }
  }
  
  async validateBonusEligibility(userId: string, bonusTemplateId: string): Promise<{ eligible: boolean; reason?: string }> {
    try {
      const { data: template, error: templateError } = await supabase
        .from('bonus_templates')
        .select('*')
        .eq('id', bonusTemplateId)
        .single();
      
      if (templateError || !template) {
        return { eligible: false, reason: 'Bonus template not found' };
      }
      
      // Check user's VIP level
      const { data: wallet, error: walletError } = await supabase
        .from('wallets')
        .select('vip_level')
        .eq('user_id', userId)
        .single();
      
      if (walletError || !wallet) {
        return { eligible: false, reason: 'User wallet not found' };
      }
      
      if (!template.vip_levels.includes(wallet.vip_level || 0)) {
        return { eligible: false, reason: 'VIP level not eligible' };
      }
      
      // Check abuse prevention rules
      for (const rule of template.abuse_prevention_rules || []) {
        const isValid = await this.validateAbusePreventionRule(userId, rule);
        if (!isValid) {
          return { eligible: false, reason: `Abuse prevention rule violated: ${rule.type}` };
        }
      }
      
      // Check if user already has an active bonus of this type
      const { data: activeBonus, error: activeBonusError } = await supabase
        .from('user_bonuses')
        .select('*')
        .eq('user_id', userId)
        .eq('bonus_template_id', bonusTemplateId)
        .eq('status', 'active')
        .single();
      
      if (activeBonus) {
        return { eligible: false, reason: 'User already has an active bonus of this type' };
      }
      
      return { eligible: true };
    } catch (error) {
      console.error('Error validating bonus eligibility:', error);
      return { eligible: false, reason: 'Validation error' };
    }
  }
  
  private async validateAbusePreventionRule(userId: string, rule: AbusePreventionRule): Promise<boolean> {
    try {
      switch (rule.type) {
        case 'max_claims_per_day':
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const { data: todayClaims, error } = await supabase
            .from('user_bonuses')
            .select('id')
            .eq('user_id', userId)
            .gte('created_at', today.toISOString());
          
          if (error) throw error;
          return (todayClaims || []).length < rule.value;
          
        case 'max_claims_per_user':
          const { data: totalClaims, error: totalError } = await supabase
            .from('user_bonuses')
            .select('id')
            .eq('user_id', userId);
          
          if (totalError) throw totalError;
          return (totalClaims || []).length < rule.value;
          
        case 'account_age_days':
          const { data: user, error: userError } = await supabase
            .from('users')
            .select('created_at')
            .eq('id', userId)
            .single();
          
          if (userError || !user) throw userError;
          
          const accountAge = (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24);
          return accountAge >= rule.value;
          
        default:
          return true;
      }
    } catch (error) {
      console.error('Error validating abuse prevention rule:', error);
      return false;
    }
  }
  
  async claimBonus(userId: string, bonusTemplateId: string, depositAmount?: number): Promise<UserBonus | null> {
    try {
      // Validate eligibility
      const eligibility = await this.validateBonusEligibility(userId, bonusTemplateId);
      if (!eligibility.eligible) {
        throw new Error(eligibility.reason);
      }
      
      const { data: template, error: templateError } = await supabase
        .from('bonus_templates')
        .select('*')
        .eq('id', bonusTemplateId)
        .single();
      
      if (templateError || !template) {
        throw new Error('Bonus template not found');
      }
      
      // Calculate bonus amount
      let bonusAmount = template.value;
      
      if (template.type === 'deposit' && template.percentage && depositAmount) {
        bonusAmount = (depositAmount * template.percentage) / 100;
        if (template.max_bonus && bonusAmount > template.max_bonus) {
          bonusAmount = template.max_bonus;
        }
      }
      
      const wageringRequired = bonusAmount * template.wagering_requirement;
      const expiresAt = new Date(Date.now() + template.expiry_days * 24 * 60 * 60 * 1000);
      
      // Create user bonus
      const { data: userBonus, error: bonusError } = await supabase
        .from('user_bonuses')
        .insert({
          user_id: userId,
          bonus_template_id: bonusTemplateId,
          amount: bonusAmount,
          wagering_required: wageringRequired,
          wagering_completed: 0,
          status: 'active',
          expires_at: expiresAt.toISOString()
        })
        .select('*, bonus_templates(*)')
        .single();
      
      if (bonusError) throw bonusError;
      
      // Update wallet bonus balance
      await supabase
        .from('wallets')
        .update({
          balance_bonus: supabase.sql`balance_bonus + ${bonusAmount}`,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      return {
        id: userBonus.id,
        userId: userBonus.user_id,
        bonusTemplateId: userBonus.bonus_template_id,
        amount: userBonus.amount,
        wageringRequired: userBonus.wagering_required,
        wageringCompleted: userBonus.wagering_completed,
        status: userBonus.status,
        expiresAt: userBonus.expires_at,
        createdAt: userBonus.created_at,
        template: userBonus.bonus_templates
      };
    } catch (error: any) {
      console.error('Error claiming bonus:', error);
      throw error;
    }
  }
  
  async trackWageringProgress(userId: string, betAmount: number, gameId: string): Promise<WageringProgress[]> {
    try {
      // Get active bonuses
      const { data: activeBonuses, error } = await supabase
        .from('user_bonuses')
        .select('*, bonus_templates(*)')
        .eq('user_id', userId)
        .eq('status', 'active');
      
      if (error) throw error;
      
      const progressUpdates: WageringProgress[] = [];
      
      for (const bonus of activeBonuses || []) {
        // Check if game is eligible for wagering
        const template = bonus.bonus_templates;
        if (template.game_restrictions && template.game_restrictions.length > 0) {
          if (!template.game_restrictions.includes(gameId)) {
            continue; // Skip this bonus if game is not eligible
          }
        }
        
        // Update wagering progress
        const newWageringCompleted = bonus.wagering_completed + betAmount;
        
        await supabase
          .from('user_bonuses')
          .update({
            wagering_completed: newWageringCompleted,
            status: newWageringCompleted >= bonus.wagering_required ? 'completed' : 'active',
            updated_at: new Date().toISOString()
          })
          .eq('id', bonus.id);
        
        progressUpdates.push({
          totalRequired: bonus.wagering_required,
          completed: newWageringCompleted,
          remaining: Math.max(0, bonus.wagering_required - newWageringCompleted),
          percentage: Math.min(100, (newWageringCompleted / bonus.wagering_required) * 100),
          eligibleGames: template.game_restrictions || []
        });
      }
      
      return progressUpdates;
    } catch (error) {
      console.error('Error tracking wagering progress:', error);
      return [];
    }
  }
  
  async expireBonuses(): Promise<void> {
    try {
      const now = new Date().toISOString();
      
      await supabase
        .from('user_bonuses')
        .update({ status: 'expired' })
        .eq('status', 'active')
        .lt('expires_at', now);
      
    } catch (error) {
      console.error('Error expiring bonuses:', error);
    }
  }
}

export const enhancedBonusService = new EnhancedBonusService();
export default enhancedBonusService;
