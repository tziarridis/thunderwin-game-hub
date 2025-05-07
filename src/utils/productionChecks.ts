
/**
 * Production readiness checks for the casino application
 * Run these checks before deployment to ensure everything is properly configured
 */

import { productionConfig } from '@/config/productionConfig';
import { supabase } from '@/integrations/supabase/client';
import { gameProviders } from '@/config/gameProviders';

interface CheckResult {
  success: boolean;
  message: string;
  details?: string;
}

/**
 * Run all production readiness checks
 */
export const runProductionChecks = async (): Promise<CheckResult[]> => {
  const results: CheckResult[] = [];
  
  // Check Supabase connection
  try {
    const { data, error } = await supabase.from('games').select('id').limit(1);
    
    if (error) {
      results.push({
        success: false,
        message: 'Supabase connection failed',
        details: error.message
      });
    } else {
      results.push({
        success: true,
        message: 'Supabase connection successful'
      });
    }
  } catch (error: any) {
    results.push({
      success: false,
      message: 'Supabase connection check threw an exception',
      details: error.message
    });
  }
  
  // Check game provider configurations
  const enabledProviders = Object.entries(gameProviders)
    .filter(([_, config]) => config.enabled);
  
  if (enabledProviders.length === 0) {
    results.push({
      success: false,
      message: 'No game providers are enabled',
      details: 'At least one game provider should be enabled for the casino to function'
    });
  } else {
    results.push({
      success: true,
      message: `${enabledProviders.length} game providers are configured and enabled`
    });
  }
  
  // Check for required environment variables
  const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];
  
  const missingEnvVars = requiredEnvVars.filter(envVar => !import.meta.env[envVar]);
  
  if (missingEnvVars.length > 0) {
    results.push({
      success: false,
      message: 'Missing required environment variables',
      details: missingEnvVars.join(', ')
    });
  } else {
    results.push({
      success: true,
      message: 'All required environment variables are present'
    });
  }
  
  // Check if production settings are applied
  if (import.meta.env.MODE !== 'production') {
    results.push({
      success: false,
      message: 'Application is not running in production mode',
      details: `Current mode: ${import.meta.env.MODE}`
    });
  } else {
    results.push({
      success: true,
      message: 'Application is running in production mode'
    });
  }
  
  return results;
};

/**
 * Validate the environment for production deployment
 */
export const validateProductionEnvironment = (): { valid: boolean, issues: string[] } => {
  const issues: string[] = [];
  
  // Check Supabase configuration
  if (!productionConfig.supabaseUrl || !productionConfig.supabaseAnonKey) {
    issues.push('Supabase configuration is incomplete');
  }
  
  // Check game provider settings
  const providerConfig = productionConfig.gameProviders;
  
  if (!providerConfig.pragmaticPlay.enabled && 
      !providerConfig.gitSlotPark.enabled && 
      !providerConfig.infinGame.enabled) {
    issues.push('No game providers are enabled in production config');
  }
  
  // Check if demo mode is enabled in production
  if (productionConfig.features.demoMode && !productionConfig.features.realMoneyEnabled) {
    issues.push('Production is configured for demo mode only (real money is disabled)');
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
};

export default {
  runProductionChecks,
  validateProductionEnvironment
};
