
import { supabase } from '@/integrations/supabase/client';

export interface WalletValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface DepositLimits {
  daily: number;
  weekly: number;
  monthly: number;
}

export interface WalletOperation {
  userId: string;
  amount: number;
  type: 'deposit' | 'withdraw' | 'bet' | 'win' | 'bonus';
  currency: string;
}

class WalletValidationService {
  
  async validateBalance(userId: string, amount: number): Promise<WalletValidationResult> {
    const result: WalletValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };
    
    try {
      const { data: wallet, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error || !wallet) {
        result.isValid = false;
        result.errors.push('Wallet not found');
        return result;
      }
      
      if (!wallet.active) {
        result.isValid = false;
        result.errors.push('Wallet is frozen');
        return result;
      }
      
      if (wallet.balance < amount) {
        result.isValid = false;
        result.errors.push('Insufficient balance');
        return result;
      }
      
      if (wallet.balance < amount * 2) {
        result.warnings.push('Low balance warning');
      }
      
      return result;
    } catch (error: any) {
      result.isValid = false;
      result.errors.push(error.message);
      return result;
    }
  }
  
  async validateDepositLimits(userId: string, amount: number): Promise<WalletValidationResult> {
    const result: WalletValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };
    
    try {
      const { data: wallet, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error || !wallet) {
        result.isValid = false;
        result.errors.push('Wallet not found');
        return result;
      }
      
      // Check daily limit
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data: dailyDeposits } = await supabase
        .from('transactions')
        .select('amount')
        .eq('player_id', userId)
        .eq('type', 'deposit')
        .gte('created_at', today.toISOString());
      
      const dailyTotal = (dailyDeposits || []).reduce((sum, t) => sum + Number(t.amount), 0);
      
      if (wallet.deposit_limit_daily && dailyTotal + amount > wallet.deposit_limit_daily) {
        result.isValid = false;
        result.errors.push('Daily deposit limit exceeded');
      }
      
      // Check weekly limit
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      
      const { data: weeklyDeposits } = await supabase
        .from('transactions')
        .select('amount')
        .eq('player_id', userId)
        .eq('type', 'deposit')
        .gte('created_at', weekStart.toISOString());
      
      const weeklyTotal = (weeklyDeposits || []).reduce((sum, t) => sum + Number(t.amount), 0);
      
      if (wallet.deposit_limit_weekly && weeklyTotal + amount > wallet.deposit_limit_weekly) {
        result.isValid = false;
        result.errors.push('Weekly deposit limit exceeded');
      }
      
      // Check monthly limit
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      
      const { data: monthlyDeposits } = await supabase
        .from('transactions')
        .select('amount')
        .eq('player_id', userId)
        .eq('type', 'deposit')
        .gte('created_at', monthStart.toISOString());
      
      const monthlyTotal = (monthlyDeposits || []).reduce((sum, t) => sum + Number(t.amount), 0);
      
      if (wallet.deposit_limit_monthly && monthlyTotal + amount > wallet.deposit_limit_monthly) {
        result.isValid = false;
        result.errors.push('Monthly deposit limit exceeded');
      }
      
      return result;
    } catch (error: any) {
      result.isValid = false;
      result.errors.push(error.message);
      return result;
    }
  }
  
  async freezeWallet(userId: string, reason: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('wallets')
        .update({ 
          active: false, 
          updated_at: new Date().toISOString() 
        })
        .eq('user_id', userId);
      
      if (error) throw error;
      
      // Log the freeze action
      await supabase
        .from('audit_logs')
        .insert({
          user_id: userId,
          action: 'freeze_wallet',
          resource_type: 'wallet',
          resource_id: userId,
          new_values: { reason, frozen_at: new Date().toISOString() }
        });
      
      return true;
    } catch (error) {
      console.error('Error freezing wallet:', error);
      return false;
    }
  }
  
  async unfreezeWallet(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('wallets')
        .update({ 
          active: true, 
          updated_at: new Date().toISOString() 
        })
        .eq('user_id', userId);
      
      if (error) throw error;
      
      // Log the unfreeze action
      await supabase
        .from('audit_logs')
        .insert({
          user_id: userId,
          action: 'unfreeze_wallet',
          resource_type: 'wallet',
          resource_id: userId,
          new_values: { unfrozen_at: new Date().toISOString() }
        });
      
      return true;
    } catch (error) {
      console.error('Error unfreezing wallet:', error);
      return false;
    }
  }
  
  async executeAtomicTransaction(operations: WalletOperation[]): Promise<boolean> {
    try {
      // Start a transaction
      const { data, error } = await supabase.rpc('execute_atomic_wallet_operations', {
        operations: operations
      });
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error executing atomic transaction:', error);
      return false;
    }
  }
}

export const walletValidationService = new WalletValidationService();
export default walletValidationService;
