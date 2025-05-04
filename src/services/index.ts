
// This file exports all services for easier imports
export { default as analyticsService } from './analyticsService';
export { default as bonusService } from './bonusService';
export { default as walletService } from './walletService';
export * as transactionService from './transactionService';
export { default as transactionEnrichService } from './transactionEnrichService';
export { default as metamaskService } from './metamaskService';

// Export types for easier import
export type { Wallet, WalletTransaction } from '@/types/wallet';
export type { AnalyticsData, GameAnalytics, UserGrowthData } from '@/types/analytics';
export type { UserBonus, BonusType } from '@/types/bonus';
