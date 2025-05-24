
import { supabase } from '@/integrations/supabase/client';
import { AdminRole, AuditLog, AdminSession, FinancialAudit } from '@/types/admin';

class AdminService {
  // Admin Role Management
  async getUserRoles(userId: string): Promise<AdminRole[]> {
    const { data, error } = await supabase
      .from('admin_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);
    
    if (error) {
      console.error('Error fetching user roles:', error);
      throw new Error('Failed to fetch user roles');
    }
    
    return data || [];
  }

  async hasRole(userId: string, role: string): Promise<boolean> {
    const { data, error } = await supabase
      .rpc('has_admin_role', { user_uuid: userId, required_role: role });
    
    if (error) {
      console.error('Error checking role:', error);
      return false;
    }
    
    return data || false;
  }

  async isAdmin(userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .rpc('is_admin', { user_uuid: userId });
    
    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
    
    return data || false;
  }

  async grantRole(
    userId: string, 
    role: AdminRole['role'], 
    permissions: Record<string, any> = {},
    expiresAt?: string
  ): Promise<AdminRole> {
    const { data, error } = await supabase
      .from('admin_roles')
      .insert({
        user_id: userId,
        role,
        permissions,
        granted_by: (await supabase.auth.getUser()).data.user?.id,
        expires_at: expiresAt
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error granting role:', error);
      throw new Error('Failed to grant role');
    }
    
    return data;
  }

  async revokeRole(userId: string, role: string): Promise<void> {
    const { error } = await supabase
      .from('admin_roles')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('role', role);
    
    if (error) {
      console.error('Error revoking role:', error);
      throw new Error('Failed to revoke role');
    }
  }

  // Session Management
  async createAdminSession(sessionToken: string): Promise<AdminSession> {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('admin_sessions')
      .insert({
        user_id: user.id,
        session_token: sessionToken,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating admin session:', error);
      throw new Error('Failed to create admin session');
    }
    
    return data;
  }

  async validateSession(sessionToken: string): Promise<AdminSession | null> {
    const { data, error } = await supabase
      .from('admin_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .single();
    
    if (error) {
      console.error('Error validating session:', error);
      return null;
    }
    
    // Update last activity
    await supabase
      .from('admin_sessions')
      .update({ last_activity: new Date().toISOString() })
      .eq('id', data.id);
    
    return data;
  }

  async terminateSession(sessionToken: string): Promise<void> {
    const { error } = await supabase
      .from('admin_sessions')
      .update({ is_active: false })
      .eq('session_token', sessionToken);
    
    if (error) {
      console.error('Error terminating session:', error);
      throw new Error('Failed to terminate session');
    }
  }

  // Audit Logging
  async getAuditLogs(filters: {
    userId?: string;
    resourceType?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  } = {}): Promise<AuditLog[]> {
    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters.userId) {
      query = query.eq('user_id', filters.userId);
    }
    
    if (filters.resourceType) {
      query = query.eq('resource_type', filters.resourceType);
    }
    
    if (filters.action) {
      query = query.eq('action', filters.action);
    }
    
    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    
    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate);
    }
    
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching audit logs:', error);
      throw new Error('Failed to fetch audit logs');
    }
    
    return data || [];
  }

  // Financial Transaction Management
  async rollbackTransaction(
    transactionId: string, 
    reason: string
  ): Promise<boolean> {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .rpc('rollback_transaction', {
        transaction_uuid: transactionId,
        admin_user_id: user.id,
        rollback_reason: reason
      });
    
    if (error) {
      console.error('Error rolling back transaction:', error);
      throw new Error('Failed to rollback transaction');
    }
    
    return data;
  }

  async getFinancialAudit(transactionId?: string): Promise<FinancialAudit[]> {
    let query = supabase
      .from('financial_audit')
      .select('*')
      .order('created_at', { ascending: false });

    if (transactionId) {
      query = query.eq('transaction_id', transactionId);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching financial audit:', error);
      throw new Error('Failed to fetch financial audit');
    }
    
    return data || [];
  }
}

export const adminService = new AdminService();
export default adminService;
