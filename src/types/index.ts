
export type Role = "user" | "admin";
export type Status = "Active" | "Inactive" | "Pending" | "Suspended";

export type User = {
  id: string;
  username: string;
  name: string;
  email: string;
  balance: number;
  isVerified: boolean;
  vipLevel: number;
  role: Role;
  status: Status;
  joined: string;
  avatarUrl: string;
  favoriteGames?: string[];
};

export type Transaction = {
  id: string;
  userId: string;
  userName: string;
  type: "deposit" | "withdraw" | "bet" | "win" | "bonus";
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed";
  method: string;
  date: string;
  gameId?: string; // Added for game-related transactions
};

export type Game = {
  id: string;
  title: string;
  provider: string;
  category: string;
  tags: string[];
  image: string;
  rtp: number;
  volatility: string;
  minBet: number;
  maxBet: number;
  jackpot: boolean;
  isNew: boolean;
  isPopular: boolean;
  description?: string; // Added for game descriptions
  releaseDate?: string; // Added for game release dates
  isFavorite?: boolean; // Added for favorite game functionality
};

export type GameProvider = {
  id: string;
  name: string;
  logo: string;
  gameCount: number;
  featured: boolean;
  description?: string;
};

export type GameBet = {
  id: string;
  userId: string;
  gameId: string;
  amount: number;
  multiplier: number;
  payout: number;
  timestamp: string;
};

export type Log = {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
  ipAddress: string;
  location: string;
  status: "success" | "failed";
};

export type Affiliate = {
  id: string;
  userId: string;
  userName: string;
  code: string;
  referredUsers: number;
  totalCommissions: number;
  payoutMethod: string;
  payoutDetails: string;
  status: "active" | "pending" | "suspended";
  joined: string;
  // Additional fields needed by AffiliateStats component
  name?: string;
  email?: string;
  website?: string;
  commission?: number;
  signups?: number;
  totalRevenue?: number;
  joinedDate?: string;
  referralCode?: string;
};

export type Kyc = {
  id: string;
  userId: string;
  userName: string;
  status: "pending" | "verified" | "rejected";
  submittedDate: string;
  approvedDate: string;
  rejectionReason: string;
  documents: {
    idFront: string;
    idBack: string;
    address: string;
  };
};

export type KycRequest = {
  id: string;
  userId: string;
  userName: string;
  submittedDate: string;
  status: "pending" | "verified" | "rejected";
  documentType: string;
  documentFiles: string[];
  notes?: string;
};

export type Promotion = {
  id: string;
  title: string;
  description: string;
  image: string;
  startDate: string;
  endDate: string;
  termsAndConditions: string;
  isActive: boolean;
  type: "deposit" | "free_spin" | "cashback";
  bonusCode: string;
  minDeposit: number;
  bonusPercentage: number;
  maxBonusAmount: number;
  wageringRequirements: number;
  eligibleGames: string[];
  category?: string; // Added for categorizing promotions
};

export type SupportTicket = {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  category: "general" | "technical" | "billing" | "security";
  status: "open" | "pending" | "resolved" | "closed";
  priority: "low" | "medium" | "high";
  messages: SupportMessage[];
  createdDate: string;
  lastUpdate: string;
};

export type SupportMessage = {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
  isAgent: boolean;
};

export type VipLevel = {
  id: string;
  name: string;
  level: number;
  requiredPoints: number;
  pointsRequired: number; // Duplicate property used in some components
  cashbackPercent: number;
  cashbackRate: number; // Duplicate property used in some components
  depositBonusPercent: number;
  depositBonus: number; // Duplicate property used in some components
  withdrawalLimit: number;
  birthdayBonus: number;
  weeklyBonus: number;
  dedicated: boolean;
  fastWithdrawals: boolean;
  exclusivePromos: boolean;
  specialEvents: boolean;
  customizedOffers: boolean;
  benefits: string[];
  color: string;
  icon: string;
};

export type BonusType = "deposit" | "free_spin" | "cashback" | "loyalty" | "vip" | "freespin";

export type BonusTemplate = {
  id: string;
  name: string;
  description: string;
  type: BonusType;
  amount: number;
  percentage: number;
  minDeposit: number;
  maxBonus: number;
  wagering: number;
  expiryDays: number;
  vipLevelRequired: number;
  allowedGames: string;
  isActive: boolean;
  active: boolean; // Duplicate property used in some components
  code: string;
  createdAt?: string;
};

export type Bonus = {
  id: string;
  userId: string;
  type: BonusType;
  amount: number;
  status: "active" | "completed" | "expired";
  createdAt: string;
  expiresAt: string;
  name: string;
  isCompleted: boolean;
  progress: number;
  wagering: number;
  templateId?: string;
  description?: string; // Added for bonus descriptions
};

export type OxaPayWallet = {
  id: string;
  currency: string;
  address: string;
  balance: number;
  status: "active" | "pending" | "disabled";
};
