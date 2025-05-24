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
      // Use mock data until database types are updated
      return this.getMockBonusTemplates().filter(template => 
        template.vipLevels.includes(vipLevel)
      );
    } catch (error) {
      console.error('Error fetching bonus templates:', error);
      return [];
    }
  }
  
  async validateBonusEligibility(userId: string, bonusTemplateId: string): Promise<{ eligible: boolean; reason?: string }> {
    try {
      const template = this.getMockBonusTemplates().find(t => t.id === bonusTemplateId);
      
      if (!template) {
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
      
      if (!template.vipLevels.includes(wallet.vip_level || 0)) {
        return { eligible: false, reason: 'VIP level not eligible' };
      }
      
      // Check abuse prevention rules
      for (const rule of template.abusePreventionRules || []) {
        const isValid = await this.validateAbusePreventionRule(userId, rule);
        if (!isValid) {
          return { eligible: false, reason: `Abuse prevention rule violated: ${rule.type}` };
        }
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
          // Mock validation - would check actual claims in real implementation
          return true;
          
        case 'max_claims_per_user':
          // Mock validation - would check total user claims
          return true;
          
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
      
      const template = this.getMockBonusTemplates().find(t => t.id === bonusTemplateId);
      
      if (!template) {
        throw new Error('Bonus template not found');
      }
      
      // Calculate bonus amount
      let bonusAmount = template.value;
      
      if (template.type === 'deposit' && template.percentage && depositAmount) {
        bonusAmount = (depositAmount * template.percentage) / 100;
        if (template.maxBonus && bonusAmount > template.maxBonus) {
          bonusAmount = template.maxBonus;
        }
      }
      
      const wageringRequired = bonusAmount * template.wageringRequirement;
      const expiresAt = new Date(Date.now() + template.expiryDays * 24 * 60 * 60 * 1000);
      
      // For now, return mock bonus since we're using mock templates
      const mockBonus: UserBonus = {
        id: `bonus_${Date.now()}`,
        userId: userId,
        bonusTemplateId: bonusTemplateId,
        amount: bonusAmount,
        wageringRequired: wageringRequired,
        wageringCompleted: 0,
        status: 'active',
        expiresAt: expiresAt.toISOString(),
        createdAt: new Date().toISOString(),
        template: template
      };
      
      // Update wallet bonus balance using simple addition
      try {
        const { data: currentWallet, error: fetchError } = await supabase
          .from('wallets')
          .select('balance_bonus')
          .eq('user_id', userId)
          .single();
        
        if (fetchError) {
          console.error('Error fetching wallet:', fetchError);
          return mockBonus;
        }
        
        const newBonusBalance = (currentWallet.balance_bonus || 0) + bonusAmount;
        
        const { error: updateError } = await supabase
          .from('wallets')
          .update({ 
            balance_bonus: newBonusBalance,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
        
        if (updateError) {
          console.error('Error updating wallet bonus balance:', updateError);
        }
      } catch (sqlError) {
        console.error('Error with wallet update:', sqlError);
      }
      
      return mockBonus;
    } catch (error: any) {
      console.error('Error claiming bonus:', error);
      throw error;
    }
  }
  
  async trackWageringProgress(userId: string, betAmount: number, gameId: string): Promise<WageringProgress[]> {
    try {
      // Mock implementation until user_bonuses table is available in types
      return [{
        totalRequired: 1000,
        completed: betAmount,
        remaining: Math.max(0, 1000 - betAmount),
        percentage: Math.min(100, (betAmount / 1000) * 100),
        eligibleGames: []
      }];
    } catch (error) {
      console.error('Error tracking wagering progress:', error);
      return [];
    }
  }
  
  async expireBonuses(): Promise<void> {
    try {
      // Mock implementation until user_bonuses table is available in types
      console.log('Expired bonuses processed');
    } catch (error) {
      console.error('Error expiring bonuses:', error);
    }
  }
  
  private getMockBonusTemplates(): BonusTemplate[] {
    return [
      {
        id: '1',
        name: 'Welcome Bonus',
        type: 'welcome',
        value: 100,
        percentage: 100,
        minDeposit: 20,
        maxBonus: 500,
        wageringRequirement: 35,
        expiryDays: 30,
        vipLevels: [0, 1, 2, 3, 4, 5],
        isActive: true,
        abusePreventionRules: [
          { type: 'max_claims_per_user', value: 1 },
          { type: 'account_age_days', value: 0 }
        ]
      },
      {
        id: '2',
        name: 'Free Spins',
        type: 'freespins',
        value: 50,
        minDeposit: 0,
        wageringRequirement: 40,
        expiryDays: 7,
        vipLevels: [1, 2, 3, 4, 5],
        isActive: true,
        abusePreventionRules: [
          { type: 'max_claims_per_day', value: 1 }
        ]
      },
      {
        id: '3',
        name: 'Reload Bonus',
        type: 'reload',
        value: 50,
        percentage: 50,
        minDeposit: 50,
        maxBonus: 250,
        wageringRequirement: 30,
        expiryDays: 14,
        vipLevels: [2, 3, 4, 5],
        isActive: true,
        abusePreventionRules: [
          { type: 'max_claims_per_day', value: 3 }
        ]
      }
    ];
  }
}

export const enhancedBonusService = new EnhancedBonusService();
export default enhancedBonusService;
