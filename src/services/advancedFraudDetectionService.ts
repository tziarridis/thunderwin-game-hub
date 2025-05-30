import { supabase } from '@/integrations/supabase/client';
import type { Database, Json } from '@/integrations/supabase/types'; // Ensure Json is available

// Define more specific types for device info and geolocation
interface ScreenInfo {
  width?: number;
  height?: number;
}

interface DeviceInfo {
  userAgent?: string;
  language?: string;
  platform?: string;
  screen?: ScreenInfo;
  timezone?: string;
  plugins?: string[];
  webglVendor?: string;
  webglRenderer?: string;
}

interface GeolocationInfo {
  country?: string;
  region?: string;
  city?: string;
  coordinates?: { lat: number; lon: number };
  vpn?: boolean;
  proxy?: boolean;
}

export interface DeviceFingerprint {
  id: string;
  userId?: string;
  fingerprintHash: string;
  deviceInfo: DeviceInfo; 
  ipAddress: string;
  geolocation?: GeolocationInfo; 
  riskScore: number;
  isSuspicious: boolean;
}

export interface BehaviorPattern {
  id: string;
  userId: string;
  patternType: string;
  patternData: Record<string, any>; 
  confidenceScore: number;
  anomalyScore: number;
}

export interface FraudInvestigation {
  id: string;
  userId: string;
  investigationType: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  evidence: Array<Record<string, any>>; 
  riskFactors: Array<Record<string, any>>; 
  automatedFlags: Array<Record<string, any>>; 
}

interface BonusAbuseData {
  deviceFingerprint: string;
}

interface ActionData {
  type: string; 
  [key: string]: any; 
}

interface BettingPatternAnalysis {
  anomalyScore: number; // Renamed from anomaly to match edge function
  confidence: number;
  factors: string[];
  modelType?: string; // Optional: to know which model version made the prediction
}

interface DetectedBehaviorPattern {
  type: string;
  data: Record<string, any>; 
  confidence: number;
  anomaly: number;
}

class AdvancedFraudDetectionService {
  
  async captureDeviceFingerprint(deviceInfo: DeviceInfo, userId?: string): Promise<DeviceFingerprint> {
    try {
      const fingerprint = this.generateFingerprint(deviceInfo);
      const ipAddress = await this.getClientIP();
      const geolocation = await this.getGeolocation(ipAddress);
      
      const { data, error } = await supabase
        .from('device_fingerprints')
        .insert({
          user_id: userId,
          fingerprint_hash: fingerprint,
          device_info: deviceInfo as unknown as Json, // Cast to Json
          ip_address: ipAddress,
          geolocation: geolocation as unknown as Json | null, // Cast to Json or Json | null
          risk_score: this.calculateDeviceRiskScore(deviceInfo, geolocation)
        })
        .select()
        .single();

      if (error) throw error;
      
      await this.checkSuspiciousDevicePatterns(fingerprint, userId);
      
      return this.mapDeviceFingerprint(data);
    } catch (error) {
      console.error('Error capturing device fingerprint:', error);
      throw error;
    }
  }

  async analyzeBehaviorPattern(userId: string, actionData: ActionData): Promise<void> {
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

        if (pattern.anomaly > 0.8) {
          await this.createFraudInvestigation(userId, 'behavioral_anomaly', pattern);
        }
      }
    } catch (error) {
      console.error('Error analyzing behavior pattern:', error);
    }
  }

  async detectBonusAbuse(userId: string, bonusData: BonusAbuseData): Promise<boolean> {
    try {
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
    evidence: Record<string, any> 
  ): Promise<FraudInvestigation> {
    try {
      const priority = this.calculateInvestigationPriority(evidence);
      
      const { data, error } = await supabase
        .from('fraud_investigations')
        .insert({
          user_id: userId,
          investigation_type: type,
          priority,
          evidence: [evidence] as unknown as Json,
          risk_factors: await this.gatherRiskFactors(userId) as unknown as Json,
          automated_flags: await this.getAutomatedFlags(userId) as unknown as Json
        })
        .select()
        .single();

      if (error) throw error;

      if (priority === 'critical') {
        await this.flagAccount(userId, 'auto_fraud_detection');
      }

      return this.mapFraudInvestigation(data);
    } catch (error) {
      console.error('Error creating fraud investigation:', error);
      throw error;
    }
  }

  private generateFingerprint(deviceInfo: DeviceInfo): string {
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
      return data.ip as string;
    } catch (error) {
      console.warn('Failed to fetch client IP, defaulting to 127.0.0.1:', error);
      return '127.0.0.1';
    }
  }

  private async getGeolocation(ip: string): Promise<GeolocationInfo | null> {
    try {
      // In production, use a real geolocation service and map to GeolocationInfo
      // For now, returning a mock structure matching GeolocationInfo
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

  private calculateDeviceRiskScore(deviceInfo: DeviceInfo, geolocation: GeolocationInfo | null): number {
    let riskScore = 0;
    
    if (!deviceInfo.plugins || deviceInfo.plugins.length === 0) riskScore += 20;
    if (deviceInfo.userAgent?.includes('headless')) riskScore += 50;
    if (!deviceInfo.webglVendor || !deviceInfo.webglRenderer) riskScore += 15;
    
    if (geolocation?.vpn) riskScore += 30;
    if (geolocation?.proxy) riskScore += 25;
    
    return Math.min(riskScore, 100);
  }

  private async detectBehaviorPatterns(userId: string, actionData: ActionData): Promise<DetectedBehaviorPattern[]> {
    const patterns: DetectedBehaviorPattern[] = [];
    
    if (actionData.type === 'bet') {
      // Assuming actionData for 'bet' matches structure expected by analyzeBettingPattern
      const bettingPatternAnalysis = await this.analyzeBettingPattern(userId, actionData); 
      if (bettingPatternAnalysis.anomalyScore > 0.5) { // Use anomalyScore
        patterns.push({
          type: 'betting_anomaly',
          data: bettingPatternAnalysis, 
          confidence: bettingPatternAnalysis.confidence,
          anomaly: bettingPatternAnalysis.anomalyScore // Use anomalyScore
        });
      }
    }
    
    return patterns;
  }

  private async analyzeBettingPattern(userId: string, betData: ActionData): Promise<BettingPatternAnalysis> {
    console.log(`[AdvancedFraudDetectionService] Analyzing betting pattern for user ${userId}, betData:`, betData);
    try {
      const { data: prediction, error } = await supabase.functions.invoke('ml-fraud-detection', {
        body: { userId, betData },
      });

      if (error) {
        console.error('[AdvancedFraudDetectionService] Error calling ml-fraud-detection function:', error);
        throw error;
      }

      if (!prediction || typeof prediction.anomalyScore !== 'number' || typeof prediction.confidence !== 'number') {
        console.error('[AdvancedFraudDetectionService] Invalid prediction format from ml-fraud-detection:', prediction);
        throw new Error('Invalid prediction format from ML model');
      }
      
      console.log('[AdvancedFraudDetectionService] Prediction received:', prediction);
      // Ensure the return type matches BettingPatternAnalysis
      return {
        anomalyScore: prediction.anomalyScore,
        confidence: prediction.confidence,
        factors: prediction.factors || [],
        modelType: prediction.modelType
      };
    } catch (error) {
      console.error('[AdvancedFraudDetectionService] Error in analyzeBettingPattern:', error);
      // Fallback to a default low-risk pattern on error to avoid breaking flow
      return {
        anomalyScore: 0.1, // Low anomaly
        confidence: 0.9,   // High confidence in this low anomaly assessment
        factors: ['system_error_fallback'],
      };
    }
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

  private calculateInvestigationPriority(evidence: Record<string, any>): 'low' | 'medium' | 'high' | 'critical' {
    // Assuming evidence contains a riskScore property
    const riskScore = (evidence.riskScore as number) || 0;
    if (riskScore > 80) return 'critical';
    if (riskScore > 60) return 'high';
    if (riskScore > 40) return 'medium';
    return 'low';
  }

  private async gatherRiskFactors(userId: string): Promise<Array<Record<string, any>>> {
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
    // Add more factors as needed, ensuring they are Record<string, any>
    return factors;
  }

  private async getAutomatedFlags(userId: string): Promise<Array<Record<string, any>>> {
    const { data: investigations } = await supabase
      .from('fraud_investigations')
      .select('automated_flags')
      .eq('user_id', userId)
      .eq('status', 'open');

    return investigations?.flatMap(i => i.automated_flags as Array<Record<string, any>>) || [];
  }

  private async flagAccount(userId: string, reason: string): Promise<void> {
    await supabase
      .from('wallets')
      .update({ 
        compliance_notes: `Auto-flagged: ${reason}` 
      } as any) // Cast to any as a temporary workaround for Supabase types not yet reflecting the new column
      .eq('user_id', userId);
  }

  private mapDeviceFingerprint(data: Record<string, any>): DeviceFingerprint {
    return {
      id: data.id,
      userId: data.user_id,
      fingerprintHash: data.fingerprint_hash,
      deviceInfo: data.device_info as DeviceInfo, 
      ipAddress: data.ip_address,
      geolocation: data.geolocation as GeolocationInfo | undefined, 
      riskScore: data.risk_score,
      isSuspicious: data.is_suspicious
    };
  }

  private mapFraudInvestigation(data: Record<string, any>): FraudInvestigation {
    return {
      id: data.id,
      userId: data.user_id,
      investigationType: data.investigation_type,
      priority: data.priority as 'low' | 'medium' | 'high' | 'critical',
      status: data.status as 'open' | 'investigating' | 'resolved' | 'closed',
      evidence: data.evidence as Array<Record<string, any>>, 
      riskFactors: data.risk_factors as Array<Record<string, any>>, 
      automatedFlags: data.automated_flags as Array<Record<string, any>> 
    };
  }
}

export const advancedFraudDetectionService = new AdvancedFraudDetectionService();
export default advancedFraudDetectionService;
