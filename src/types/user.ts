import { KycStatus } from './kyc'; // Assuming KycStatus might be relevant

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  // Add other profile fields
}

export interface User {
  id: string;
  email: string;
  username?: string;
  profile?: UserProfile;
  isActive: boolean;
  isStaff?: boolean;
  isAdmin?: boolean; // Or use roles
  roles?: string[]; // Example: ['admin', 'player']
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  kycStatus?: KycStatus; // Example
  // any other user-specific fields
  [key: string]: any;
}

// You might also want types for user settings, preferences etc.
export interface UserSettings {
  theme?: 'dark' | 'light';
  language?: string;
  // ... other settings
}
