
export interface AdminRole {
  id: string;
  user_id: string;
  role: 'super_admin' | 'admin' | 'moderator' | 'support';
  permissions: Record<string, any>;
  granted_by?: string;
  granted_at: string;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  created_at: string;
}

export interface AdminSession {
  id: string;
  user_id: string;
  session_token: string;
  ip_address?: string;
  user_agent?: string;
  expires_at: string;
  last_activity: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FinancialAudit {
  id: string;
  transaction_id?: string;
  action: 'create' | 'update' | 'cancel' | 'approve' | 'reject';
  performed_by?: string;
  previous_status?: string;
  new_status?: string;
  previous_amount?: number;
  new_amount?: number;
  reason?: string;
  ip_address?: string;
  created_at: string;
}
