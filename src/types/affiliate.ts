
import { User } from './user'; // Assuming Affiliate is linked to a User

export interface Affiliate {
  id: string;
  userId: string; // Link to the User table
  user?: User; // Optional: Include full user details
  code?: string; // Referral code
  totalCommissions?: number;
  clicks?: number;
  signUps?: number;
  depositingUsers?: number;
  // Add other relevant affiliate stats
  createdAt: string;
  updatedAt: string;
  // For display in tables, often user details are needed:
  name?: string; // Likely from the associated User
  email?: string; // Likely from the associated User
}

export interface AffiliateStatSummary {
  totalAffiliates: number;
  totalCommissionsPaid: number;
  newSignUpsThisMonth: number;
}
