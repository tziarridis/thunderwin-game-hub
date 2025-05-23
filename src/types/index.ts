
// Re-export all types from game.ts
export * from './game';

// Re-export all types from kyc.ts
export * from './kyc';

// Re-export all types from affiliate.ts
export * from './affiliate';

// Re-export types from new user.ts.
// Explicitly export to avoid ambiguity if global User exists.
export type { UserProfile as UserProfileFromUserFile, User as AppSpecificUser, UserSettings } from './user';


// Re-export types AND enums from promotion.ts
export * from './promotion';

// Add any other general types here if they don't fit elsewhere,
// or re-export from other specific type files.

// Example of a truly shared/generic type if needed:
// export interface AppConfig {
//   theme: 'dark' | 'light';
// }
