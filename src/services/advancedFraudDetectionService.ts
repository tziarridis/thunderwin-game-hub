
import { supabase } from '@/integrations/supabase/client';

export interface DeviceFingerprint {
  id: string;
  userId?: string;
  fingerprintHash: string;
  deviceInfo: any;
  ipAddress: string;
  geolocation?: any;
  riskScore: number;
  isSuspicious: boolean;
}

export interface BehaviorPattern {
  id: string;
  userId: string;
  patternType: string;
  patternData: any;
  confidenceScore: number;
  anomalyScore: number;
}

export interface FraudInvestigation {
  id: string;
  userId: string;
  investigationType: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  evidence: any[];
  riskFactors: any[];
  automatedFlags: any[];
}

class AdvancedFraudDetectionService {
  
  async captureDeviceFingerprint(deviceInfo: any, userId?: string): Promise<DeviceFingerprint> {
    try {
      const fingerprint = this.generateFingerprint(deviceInfo);
      const ipAddress = await this.getClientIP();
      const geolocation = await this.getGeolocation(ipAddress);
      
      const { data, error } = await supabase
        .from('device_fingerprints')
        .insert({
          user_id: userId,
          fingerprint_hash: fingerprint,
          device_info: deviceInfo,
          ip_address: ipAddress,
          geolocation,
          risk_score: this.calculateDeviceRiskScore(deviceInfo, geolocation)
        })
        .select()
        .single();

      if (error) throw error;
      
      // Check for suspicious patterns
      await this.checkSuspiciousDevicePatterns(fingerprint, userId);
      
      return this.mapDeviceFingerprint(data);
    } catch (error) {
      console.error('Error capturing device fingerprint:', error);
      throw error;
    }
  }

  async analyzeBehaviorPattern(userId: string, actionData: any): Promise<void> {
    try {
      const patterns = await this.detectBehaviorPatterns(userId, actionData);
      
      for (const pattern of patterns) {
        const { error } = await supabase
          .from('user_behavior_patterns')
          .insert({
            user_id: userId,
            pattern_type: pattern.type,
            pattern_data: pattern.data,
            confidence_score: pattern.confidence,
            anomaly_score: pattern.anomaly
          });

        if (error) throw error;

        // Trigger investigation if anomaly score is high
        if (pattern.anomaly > 0.8) {
          await this.createFraudInvestigation(userId, 'behavioral_anomaly', pattern);
        }
      }
    } catch (error) {
      console.error('Error analyzing behavior pattern:', error);
    }
  }

  async detectBonusAbuse(userId: string, bonusData: any): Promise<boolean> {
    try {
      // Check for multiple accounts from same device
      const { data: deviceMatches } = await supabase
        .from('device_fingerprints')
        .select('user_id')
        .eq('fingerprint_hash', bonusData.deviceFingerprint)
        .neq('user_id', userId);

      if (deviceMatches && deviceMatches.length > 0) {
        await this.createFraudInvestigation(userId, 'bonus_abuse', {
          reason: 'Multiple accounts from same device',
          relatedUsers: deviceMatches.map(d => d.user_id)
        });
        return true;
      }

      // Check for rapid bonus claiming patterns
      const rapidClaiming = await this.checkRapidBonusClaiming(userId);
      if (rapidClaiming) {
        await this.createFraudInvestigation(userId, 'bonus_abuse', {
          reason: 'Rapid bonus claiming pattern detected'
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error detecting bonus abuse:', error);
      return false;
    }
  }

  async createFraudInvestigation(
    userId: string, 
    type: string, 
    evidence: any
  ): Promise<FraudInvestigation> {
    try {
      const priority = this.calculateInvestigationPriority(evidence);
      
      const { data, error } = await supabase
        .from('fraud_investigations')
        .insert({
          user_id: userId,
          investigation_type: type,
          priority,
          evidence: [evidence],
          risk_factors: await this.gatherRiskFactors(userId),
          automated_flags: await this.getAutomatedFlags(userId)
        })
        .select()
        .single();

      if (error) throw error;

      // Auto-flag high-risk accounts
      if (priority === 'critical') {
        await this.flagAccount(userId, 'auto_fraud_detection');
      }

      return this.mapFraudInvestigation(data);
    } catch (error) {
      console.error('Error creating fraud investigation:', error);
      throw error;
    }
  }

  private generateFingerprint(deviceInfo: any): string {
    const components = [
      deviceInfo.userAgent,
      deviceInfo.language,
      deviceInfo.platform,
      deviceInfo.screen?.width,
      deviceInfo.screen?.height,
      deviceInfo.timezone,
      deviceInfo.plugins?.join(','),
      deviceInfo.webglVendor,
      deviceInfo.webglRenderer
    ].filter(Boolean);
    
    return btoa(components.join('|')).slice(0, 32);
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

  private async getGeolocation(ip: string): Promise<any> {
    try {
      // In production, use a real geolocation service
      return {
        country: 'Unknown',
        region: 'Unknown',
        city: 'Unknown',
        coordinates: { lat: 0, lon: 0 }
      };
    } catch (error) {
      return null;
    }
  }

  private calculateDeviceRiskScore(deviceInfo: any, geolocation: any): number {
    let riskScore = 0;
    
    // Check for common bot indicators
    if (!deviceInfo.plugins || deviceInfo.plugins.length === 0) riskScore += 20;
    if (deviceInfo.userAgent?.includes('headless')) riskScore += 50;
    if (!deviceInfo.webglVendor || !deviceInfo.webglRenderer) riskScore += 15;
    
    // Check for VPN/Proxy indicators
    if (geolocation?.vpn) riskScore += 30;
    if (geolocation?.proxy) riskScore += 25;
    
    return Math.min(riskScore, 100);
  }

  private async detectBehaviorPatterns(userId: string, actionData: any): Promise<any[]> {
    // Mock pattern detection - in production, use ML models
    const patterns = [];
    
    // Betting pattern analysis
    if (actionData.type === 'bet') {
      const bettingPattern = await this.analyzeBettingPattern(userId, actionData);
      if (bettingPattern.anomaly > 0.5) {
        patterns.push({
          type: 'betting_anomaly',
          data: bettingPattern,
          confidence: bettingPattern.confidence,
          anomaly: bettingPattern.anomaly
        });
      }
    }
    
    return patterns;
  }

  private async analyzeBettingPattern(userId: string, betData: any): Promise<any> {
    // Mock analysis - implement real ML model in production
    return {
      confidence: 0.85,
      anomaly: Math.random() > 0.9 ? 0.9 : 0.1,
      factors: ['bet_size_variance', 'timing_pattern', 'game_selection']
    };
  }

  private async checkSuspiciousDevicePatterns(fingerprint: string, userId?: string): Promise<void> {
    const { data: existingDevices } = await supabase
      .from('device_fingerprints')
      .select('*')
      .eq('fingerprint_hash', fingerprint);

    if (existingDevices && existingDevices.length > 5) {
      // Device used by multiple accounts - suspicious
      await supabase
        .from('device_fingerprints')
        .update({ is_suspicious: true, risk_score: 90 })
        .eq('fingerprint_hash', fingerprint);
    }
  }

  private async checkRapidBonusClaiming(userId: string): Promise<boolean> {
    // Check if user claimed multiple bonuses in short timeframe
    const { data: recentBonuses } = await supabase
      .from('user_bonuses')
      .select('created_at')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    return recentBonuses && recentBonuses.length > 3;
  }

  private calculateInvestigationPriority(evidence: any): 'low' | 'medium' | 'high' | 'critical' {
    if (evidence.riskScore > 80) return 'critical';
    if (evidence.riskScore > 60) return 'high';
    if (evidence.riskScore > 40) return 'medium';
    return 'low';
  }

  private async gatherRiskFactors(userId: string): Promise<any[]> {
    const factors = [];
    
    // Check account age
    const { data: user } = await supabase
      .from('users')
      .select('created_at')
      .eq('id', userId)
      .single();

    if (user) {
      const accountAge = Date.now() - new Date(user.created_at).getTime();
      if (accountAge < 7 * 24 * 60 * 60 * 1000) { // Less than 7 days
        factors.push({ type: 'new_account', value: accountAge });
      }
    }

    return factors;
  }

  private async getAutomatedFlags(userId: string): Promise<any[]> {
    // Return existing automated flags for user
    const { data: investigations } = await supabase
      .from('fraud_investigations')
      .select('automated_flags')
      .eq('user_id', userId)
      .eq('status', 'open');

    return investigations?.flatMap(i => i.automated_flags) || [];
  }

  private async flagAccount(userId: string, reason: string): Promise<void> {
    await supabase
      .from('wallets')
      .update({ 
        compliance_notes: `Auto-flagged: ${reason}` 
      } as any) // Cast to any as a temporary workaround for Supabase types not yet reflecting the new column
      .eq('user_id', userId);
  }

  private mapDeviceFingerprint(data: any): DeviceFingerprint {
    return {
      id: data.id,
      userId: data.user_id,
      fingerprintHash: data.fingerprint_hash,
      deviceInfo: data.device_info,
      ipAddress: data.ip_address,
      geolocation: data.geolocation,
      riskScore: data.risk_score,
      isSuspicious: data.is_suspicious
    };
  }

  private mapFraudInvestigation(data: any): FraudInvestigation {
    return {
      id: data.id,
      userId: data.user_id,
      investigationType: data.investigation_type,
      priority: data.priority as 'low' | 'medium' | 'high' | 'critical',
      status: data.status as 'open' | 'investigating' | 'resolved' | 'closed',
      evidence: data.evidence,
      riskFactors: data.risk_factors,
      automatedFlags: data.automated_flags
    };
  }
}

export const advancedFraudDetectionService = new AdvancedFraudDetectionService();
export default advancedFraudDetectionService;

