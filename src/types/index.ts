
// Re-export all types from game.ts
export * from './game';

// Re-export all types from kyc.ts
export * from './kyc';

// Re-export all types from affiliate.ts
export * from './affiliate';

// Re-export types from new user.ts (will be created next)
export * from './user';

// Re-export types from new promotion.ts (will be created next)
export * from './promotion';

// Add any other general types here if they don't fit elsewhere,
// or re-export from other specific type files.

// Example of a truly shared/generic type if needed:
// export interface AppConfig {
//   theme: 'dark' | 'light';
// }
