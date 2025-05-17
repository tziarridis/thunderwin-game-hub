
import { Game, GameCategory, GameProvider, AuthUser } from "."; // Ensure GameCategory and GameProvider are imported if augmented

// Extend existing Game type if isLive is a valid property
declare module "." {
  interface Game {
    isLive?: boolean;
    features?: string[];
  }

  interface AuthUser {
    name?: string;
    role?: 'user' | 'admin'; // Added role
  }

  // It's generally better to define new properties directly in index.d.ts
  // but if augmenting existing imported types from elsewhere:
  // interface GameProvider {
  //   slug?: string;
  //   isActive?: boolean;
  //   order?: number;
  // }
  // interface GameCategory {
  //   isActive?: boolean;
  // }
}
