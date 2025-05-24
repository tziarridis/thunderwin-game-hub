
import { supabase } from '@/integrations/supabase/client';

export interface RateLimitConfig {
  endpoint: string;
  maxRequests: number;
  windowMs: number;
  blockDurationMs: number;
}

export interface SecurityIncident {
  id: string;
  incidentType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  sourceIp?: string;
  userId?: string;
  details: any;
  status: 'open' | 'investigating' | 'resolved';
}

class SecurityHardeningService {
  private rateLimitConfigs: Map<string, RateLimitConfig> = new Map();
  private blockedIPs: Set<string> = new Set();

  constructor() {
    this.initializeRateLimits();
    this.setupSecurityHeaders();
  }

  async checkRateLimit(identifier: string, endpoint: string): Promise<boolean> {
    try {
      const config = this.rateLimitConfigs.get(endpoint);
      if (!config) return true; // No rate limit configured

      const windowStart = new Date(Date.now() - config.windowMs);
      
      // Check existing requests in current window
      const { data: existingLogs } = await supabase
        .from('rate_limit_logs')
        .select('request_count, blocked_requests')
        .eq('identifier', identifier)
        .eq('endpoint', endpoint)
        .gte('window_start', windowStart.toISOString())
        .single();

      const currentCount = existingLogs?.request_count || 0;
      
      if (currentCount >= config.maxRequests) {
        // Rate limit exceeded
        await this.logRateLimitViolation(identifier, endpoint);
        await this.createSecurityIncident('rate_limit_exceeded', 'medium', {
          identifier,
          endpoint,
          requestCount: currentCount,
          limit: config.maxRequests
        });
        return false;
      }

      // Update or create rate limit log
      await this.updateRateLimitLog(identifier, endpoint, windowStart);
      return true;
    } catch (error) {
      console.error('Rate limit check error:', error);
      return true; // Allow request on error
    }
  }

  async detectSuspiciousActivity(userId: string, activityData: any): Promise<void> {
    try {
      const suspiciousPatterns = await this.analyzeSuspiciousPatterns(userId, activityData);
      
      for (const pattern of suspiciousPatterns) {
        await this.createSecurityIncident(
          pattern.type,
          pattern.severity,
          {
            userId,
            pattern: pattern.details,
            timestamp: new Date().toISOString()
          },
          userId
        );

        // Auto-respond to critical incidents
        if (pattern.severity === 'critical') {
          await this.autoRespondToIncident(pattern, userId);
        }
      }
    } catch (error) {
      console.error('Error detecting suspicious activity:', error);
    }
  }

  async blockIP(ipAddress: string, reason: string, duration: number = 3600000): Promise<void> {
    try {
      this.blockedIPs.add(ipAddress);
      
      await this.createSecurityIncident('ip_blocked', 'high', {
        ipAddress,
        reason,
        duration,
        blockedAt: new Date().toISOString()
      });

      // Auto-unblock after duration
      setTimeout(() => {
        this.blockedIPs.delete(ipAddress);
      }, duration);

    } catch (error) {
      console.error('Error blocking IP:', error);
    }
  }

  isIPBlocked(ipAddress: string): boolean {
    return this.blockedIPs.has(ipAddress);
  }

  async validateCSRFToken(token: string, sessionId: string): Promise<boolean> {
    try {
      // In production, implement proper CSRF token validation
      const expectedToken = this.generateCSRFToken(sessionId);
      return token === expectedToken;
    } catch (error) {
      console.error('CSRF validation error:', error);
      return false;
    }
  }

  generateCSRFToken(sessionId: string): string {
    // Simple token generation - use stronger method in production
    const timestamp = Date.now().toString();
    const data = sessionId + timestamp;
    return btoa(data).slice(0, 32);
  }

  async logSecurityEvent(eventType: string, details: any, userId?: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('security_incidents')
        .insert({
          incident_type: eventType,
          severity: this.calculateSeverity(eventType),
          user_id: userId,
          details,
          source_ip: await this.getClientIP()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  }

  async encryptSensitiveData(data: string, keyId: string = 'default'): Promise<string> {
    try {
      // In production, use proper encryption service
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      
      // Mock encryption - use real crypto in production
      const encrypted = btoa(String.fromCharCode(...dataBuffer));
      return `${keyId}:${encrypted}`;
    } catch (error) {
      console.error('Encryption error:', error);
      throw error;
    }
  }

  async decryptSensitiveData(encryptedData: string): Promise<string> {
    try {
      const [keyId, encrypted] = encryptedData.split(':');
      
      // Mock decryption - use real crypto in production
      const decoded = atob(encrypted);
      const dataArray = new Uint8Array(decoded.length);
      for (let i = 0; i < decoded.length; i++) {
        dataArray[i] = decoded.charCodeAt(i);
      }
      
      const decoder = new TextDecoder();
      return decoder.decode(dataArray);
    } catch (error) {
      console.error('Decryption error:', error);
      throw error;
    }
  }

  private initializeRateLimits(): void {
    // Configure rate limits for different endpoints
    this.rateLimitConfigs.set('/api/auth/login', {
      endpoint: '/api/auth/login',
      maxRequests: 5,
      windowMs: 15 * 60 * 1000, // 15 minutes
      blockDurationMs: 60 * 60 * 1000 // 1 hour
    });

    this.rateLimitConfigs.set('/api/games/launch', {
      endpoint: '/api/games/launch',
      maxRequests: 10,
      windowMs: 60 * 1000, // 1 minute
      blockDurationMs: 5 * 60 * 1000 // 5 minutes
    });

    this.rateLimitConfigs.set('/api/wallet/transaction', {
      endpoint: '/api/wallet/transaction',
      maxRequests: 20,
      windowMs: 60 * 1000, // 1 minute
      blockDurationMs: 10 * 60 * 1000 // 10 minutes
    });
  }

  private setupSecurityHeaders(): void {
    // Security headers would be set at the server level
    // This is a placeholder for client-side security measures
    if (typeof window !== 'undefined') {
      // Prevent clickjacking
      if (window.top !== window.self) {
        window.top!.location = window.self.location;
      }
    }
  }

  private async updateRateLimitLog(
    identifier: string, 
    endpoint: string, 
    windowStart: Date
  ): Promise<void> {
    const { data: existing } = await supabase
      .from('rate_limit_logs')
      .select('*')
      .eq('identifier', identifier)
      .eq('endpoint', endpoint)
      .gte('window_start', windowStart.toISOString())
      .single();

    if (existing) {
      await supabase
        .from('rate_limit_logs')
        .update({ request_count: existing.request_count + 1 })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('rate_limit_logs')
        .insert({
          identifier,
          endpoint,
          request_count: 1,
          window_start: windowStart.toISOString()
        });
    }
  }

  private async logRateLimitViolation(identifier: string, endpoint: string): Promise<void> {
    await supabase
      .from('rate_limit_logs')
      .update({ blocked_requests: 1 })
      .eq('identifier', identifier)
      .eq('endpoint', endpoint);
  }

  private async analyzeSuspiciousPatterns(userId: string, activityData: any): Promise<any[]> {
    const patterns = [];

    // Check for rapid successive logins
    if (activityData.type === 'login') {
      const recentLogins = await this.getRecentLogins(userId);
      if (recentLogins.length > 10) {
        patterns.push({
          type: 'rapid_login_attempts',
          severity: 'high' as const,
          details: { loginCount: recentLogins.length, timeframe: '1 hour' }
        });
      }
    }

    // Check for unusual transaction patterns
    if (activityData.type === 'transaction') {
      const unusualPattern = await this.detectUnusualTransactionPattern(userId, activityData);
      if (unusualPattern) {
        patterns.push(unusualPattern);
      }
    }

    return patterns;
  }

  private async getRecentLogins(userId: string): Promise<any[]> {
    // Mock implementation - get actual login logs in production
    return [];
  }

  private async detectUnusualTransactionPattern(userId: string, transactionData: any): Promise<any | null> {
    // Mock pattern detection
    if (transactionData.amount > 10000) {
      return {
        type: 'large_transaction',
        severity: 'medium' as const,
        details: { amount: transactionData.amount, threshold: 10000 }
      };
    }
    return null;
  }

  private async createSecurityIncident(
    type: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    details: any,
    userId?: string
  ): Promise<SecurityIncident> {
    const { data, error } = await supabase
      .from('security_incidents')
      .insert({
        incident_type: type,
        severity,
        user_id: userId,
        details,
        source_ip: await this.getClientIP()
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      incidentType: data.incident_type,
      severity: data.severity as 'low' | 'medium' | 'high' | 'critical',
      sourceIp: data.source_ip,
      userId: data.user_id,
      details: data.details,
      status: data.status as 'open' | 'investigating' | 'resolved'
    };
  }

  private async autoRespondToIncident(pattern: any, userId: string): Promise<void> {
    // Auto-response based on incident type
    switch (pattern.type) {
      case 'rapid_login_attempts':
        await this.temporaryAccountLock(userId, 30 * 60 * 1000); // 30 minutes
        break;
      case 'large_transaction':
        await this.flagTransactionForReview(pattern.details.transactionId);
        break;
    }
  }

  private async temporaryAccountLock(userId: string, duration: number): Promise<void> {
    const unlockTime = new Date(Date.now() + duration);
    
    await supabase
      .from('wallets')
      .update({ 
        exclusion_until: unlockTime.toISOString(),
        compliance_notes: 'Temporary lock due to suspicious activity'
      })
      .eq('user_id', userId);
  }

  private async flagTransactionForReview(transactionId: string): Promise<void> {
    await supabase
      .from('transactions')
      .update({ status: 'pending_review' })
      .eq('id', transactionId);
  }

  private calculateSeverity(eventType: string): 'low' | 'medium' | 'high' | 'critical' {
    const severityMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
      'login_attempt': 'low',
      'failed_login': 'medium',
      'rate_limit_exceeded': 'medium',
      'large_transaction': 'medium',
      'rapid_login_attempts': 'high',
      'ip_blocked': 'high',
      'account_takeover': 'critical',
      'data_breach': 'critical'
    };

    return severityMap[eventType] || 'low';
  }

  private async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      return '127.0.0.1';
    }
  }
}

export const securityHardeningService = new SecurityHardeningService();
export default securityHardeningService;
