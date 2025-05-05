
// This file exports all services for easier imports
import analyticsService from './analyticsService';
import bonusService from './bonusService';
import { walletService } from './walletService';
import { transactionService } from './transactionService';
import transactionEnrichService from './transactionEnrichService';
import { metamaskService } from './metamaskService';

// Export all services
export { analyticsService };
export { bonusService };
export { walletService };
export { transactionService };
export { transactionEnrichService };
export { metamaskService };

// Export types for easier import
export type { Wallet, WalletTransaction } from '@/types/wallet';
export type { AnalyticsData, GameAnalytics, UserGrowthData } from '@/types/analytics';
export type { UserBonus, BonusType } from '@/types/bonus';
