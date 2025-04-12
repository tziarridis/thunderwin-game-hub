import { Game, GameProvider, User, Transaction, Promotion, Bonus, BonusTemplate, Affiliate, VipLevel, KycRequest, RegionStats, GameStats, ProviderStats } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

// Mock data for games
const mockGames: Game[] = [
  {
    id: "1",
    title: "Mega Fortune",
    provider: "NetEnt",
    category: "slots",
    image: "/lovable-uploads/2dc5015b-5024-411b-8ee9-4b422be630fa.png",
    rtp: 96.0,
    volatility: "High",
    minBet: 0.25,
    maxBet: 50.0,
    isPopular: true,
    isNew: true,
    isFavorite: false,
    releaseDate: "2020-01-15",
    jackpot: true,
    description: "A classic jackpot slot with a luxurious theme.",
    tags: ["jackpot", "luxury"]
  },
  {
    id: "2",
    title: "Gonzo's Quest",
    provider: "NetEnt",
    category: "slots",
    image: "/lovable-uploads/2dc5015b-5024-411b-8ee9-4b422be630fa.png",
    rtp: 95.97,
    volatility: "Medium",
    minBet: 0.20,
    maxBet: 40.0,
    isPopular: true,
    isNew: false,
    isFavorite: true,
    releaseDate: "2013-11-21",
    jackpot: false,
    description: "Join Gonzo on his quest for Eldorado in this popular slot.",
    tags: ["adventure", "avalanche"]
  },
  {
    id: "3",
    title: "Live Blackjack",
    provider: "Evolution Gaming",
    category: "live",
    image: "/lovable-uploads/2dc5015b-5024-411b-8ee9-4b422be630fa.png",
    rtp: 99.5,
    volatility: "Low",
    minBet: 5.0,
    maxBet: 5000.0,
    isPopular: true,
    isNew: false,
    isFavorite: false,
    releaseDate: "2010-02-01",
    jackpot: false,
    description: "Experience the thrill of live blackjack with professional dealers.",
    tags: ["live", "blackjack"]
  },
  {
    id: "4",
    title: "European Roulette",
    provider: "NetEnt",
    category: "table",
    image: "/lovable-uploads/2dc5015b-5024-411b-8ee9-4b422be630fa.png",
    rtp: 97.3,
    volatility: "Low",
    minBet: 1.0,
    maxBet: 500.0,
    isPopular: false,
    isNew: false,
    isFavorite: false,
    releaseDate: "2008-05-01",
    jackpot: false,
    description: "A classic version of European roulette.",
    tags: ["table", "roulette"]
  },
  {
    id: "5",
    title: "Starburst",
    provider: "NetEnt",
    category: "slots",
    image: "/lovable-uploads/2dc5015b-5024-411b-8ee9-4b422be630fa.png",
    rtp: 96.09,
    volatility: "Low",
    minBet: 0.01,
    maxBet: 250,
    isPopular: true,
    isNew: false,
    isFavorite: true,
    releaseDate: "2012-01-01",
    jackpot: false,
    description: "A vibrant and energetic slot with expanding wilds.",
    tags: ["slots", "wilds", "classic"]
  },
  {
    id: "6",
    title: "Book of Dead",
    provider: "Play'n GO",
    category: "slots",
    image: "/lovable-uploads/2dc5015b-5024-411b-8ee9-4b422be630fa.png",
    rtp: 96.21,
    volatility: "High",
    minBet: 0.05,
    maxBet: 50,
    isPopular: true,
    isNew: false,
    isFavorite: true,
    releaseDate: "2016-01-01",
    jackpot: false,
    description: "An adventurous slot set in ancient Egypt.",
    tags: ["slots", "egypt", "adventure"]
  },
  {
    id: "7",
    title: "Lightning Roulette",
    provider: "Evolution Gaming",
    category: "live",
    image: "/lovable-uploads/2dc5015b-5024-411b-8ee9-4b422be630fa.png",
    rtp: 97.30,
    volatility: "Medium",
    minBet: 0.20,
    maxBet: 10000,
    isPopular: true,
    isNew: true,
    isFavorite: false,
    releaseDate: "2018-01-01",
    jackpot: false,
    description: "A thrilling live roulette game with electrifying multipliers.",
    tags: ["live", "roulette", "multipliers"]
  },
  {
    id: "8",
    title: "Baccarat Squeeze",
    provider: "Evolution Gaming",
    category: "live",
    image: "/lovable-uploads/2dc5015b-5024-411b-8ee9-4b422be630fa.png",
    rtp: 98.94,
    volatility: "Low",
    minBet: 5,
    maxBet: 5000,
    isPopular: false,
    isNew: false,
    isFavorite: false,
    releaseDate: "2015-01-01",
    jackpot: false,
    description: "A luxurious baccarat experience with a focus on the squeeze ritual.",
    tags: ["live", "baccarat", "luxury"]
  },
  {
    id: "9",
    title: "Joker Millions",
    provider: "Yggdrasil",
    category: "slots",
    image: "/lovable-uploads/2dc5015b-5024-411b-8ee9-4b422be630fa.png",
    rtp: 94.3,
    volatility: "High",
    minBet: 0.25,
    maxBet: 1,
    isPopular: false,
    isNew: false,
    isFavorite: false,
    releaseDate: "2015-01-01",
    jackpot: true,
    description: "A progressive jackpot slot with a classic fruit machine theme.",
    tags: ["slots", "jackpot", "classic"]
  },
  {
    id: "10",
    title: " Vikings Go Berzerk",
    provider: "Yggdrasil",
    category: "slots",
    image: "/lovable-uploads/2dc5015b-5024-411b-8ee9-4b422be630fa.png",
    rtp: 96.1,
    volatility: "High",
    minBet: 0.25,
    maxBet: 125,
    isPopular: true,
    isNew: false,
    isFavorite: false,
    releaseDate: "2016-01-01",
    jackpot: false,
    description: "Join the Vikings in their berzerk mode for big wins.",
    tags: ["slots", "vikings", "adventure"]
  },
  {
    id: "11",
    title: " Caribbean Stud Poker",
    provider: "Evolution Gaming",
    category: "live",
    image: "/lovable-uploads/2dc5015b-5024-411b-8ee9-4b422be630fa.png",
    rtp: 94.74,
    volatility: "High",
    minBet: 1,
    maxBet: 1000,
    isPopular: false,
    isNew: false,
    isFavorite: false,
    releaseDate: "2014-01-01",
    jackpot: true,
    description: "A live version of the classic poker game with a progressive jackpot.",
    tags: ["live", "poker", "jackpot"]
  },
  {
    id: "12",
    title: " Casino Hold'em",
    provider: "Evolution Gaming",
    category: "live",
    image: "/lovable-uploads/2dc5015b-5024-411b-8ee9-4b422be630fa.png",
    rtp: 97.84,
    volatility: "Medium",
    minBet: 0.5,
    maxBet: 2000,
    isPopular: false,
    isNew: false,
    isFavorite: false,
    releaseDate: "2014-01-01",
    jackpot: false,
    description: "A live version of the popular Texas Hold'em poker game.",
    tags: ["live", "poker"]
  }
];

// Mock data for game providers
const mockProviders: GameProvider[] = [
  {
    id: "1",
    name: "NetEnt",
    logo: "/netent-logo.svg",
    gamesCount: 200,
    isPopular: true,
    description: "A leading provider of premium gaming solutions.",
    featured: true
  },
  {
    id: "2",
    name: "Evolution Gaming",
    logo: "/evolution-gaming-logo.svg",
    gamesCount: 150,
    isPopular: true,
    description: "The world leader in live casino gaming.",
    featured: true
  },
  {
    id: "3",
    name: "Play'n GO",
    logo: "/playngo-logo.svg",
    gamesCount: 100,
    isPopular: true,
    description: "A leading provider of mobile-first casino games.",
    featured: false
  },
  {
    id: "4",
    name: "Yggdrasil",
    logo: "/yggdrasil-logo.svg",
    gamesCount: 80,
    isPopular: false,
    description: "A provider of innovative and engaging casino games.",
    featured: false
  }
];

// Mock users
const mockUsers: User[] = [
  {
    id: "1",
    username: "admin",
    email: "admin@thunderwin.com",
    balance: 10000,
    name: "Admin User",
    status: "Active",
    isAdmin: true,
    vipLevel: 10,
    isVerified: true,
    joined: "2023-01-01",
    role: "admin"
  },
  {
    id: "2",
    username: "player1",
    email: "player1@example.com",
    balance: 500,
    name: "Regular Player",
    status: "Active",
    isAdmin: false,
    vipLevel: 2,
    isVerified: true,
    joined: "2023-02-15",
    role: "user"
  },
  {
    id: "3",
    username: "newuser",
    email: "newuser@example.com",
    balance: 50,
    name: "New User",
    status: "Pending",
    isAdmin: false,
    vipLevel: 0,
    isVerified: false,
    joined: "2023-04-10",
    role: "user"
  }
];

// Mock transactions
const mockTransactions: Transaction[] = [
  {
    id: "1",
    userId: "2",
    type: "deposit",
    amount: 100,
    status: "completed",
    createdAt: "2023-04-11",
    paymentMethod: "Credit Card"
  },
  {
    id: "2",
    userId: "2",
    type: "bet",
    amount: 20,
    status: "completed",
    createdAt: "2023-04-11",
    gameId: "1"
  },
  {
    id: "3",
    userId: "2",
    type: "win",
    amount: 50,
    status: "completed",
    createdAt: "2023-04-11",
    gameId: "1"
  },
  {
    id: "4",
    userId: "3",
    type: "deposit",
    amount: 50,
    status: "completed",
    createdAt: "2023-04-10",
    paymentMethod: "E-Wallet"
  }
];

// Mock promotions
const mockPromotions: Promotion[] = [
  {
    id: "1",
    title: "Welcome Bonus",
    description: "Get 100% up to $500 on your first deposit",
    image: "/lovable-uploads/2dc5015b-5024-411b-8ee9-4b422be630fa.png",
    startDate: "2023-01-01",
    endDate: "2023-12-31",
    isActive: true,
    promotionType: "welcome",
    terms: "Minimum deposit $20, wagering requirements apply"
  },
  {
    id: "2",
    title: "Free Spins",
    description: "Get 50 free spins on Starburst",
    image: "/lovable-uploads/2dc5015b-5024-411b-8ee9-4b422be630fa.png",
    startDate: "2023-04-01",
    endDate: "2023-04-30",
    isActive: true,
    promotionType: "noDeposit",
    terms: "No deposit required, wagering requirements apply"
  }
];

// Mock bonuses
const mockBonuses: Bonus[] = [
  {
    id: "1",
    name: "Welcome Bonus",
    description: "100% match up to $200",
    amount: 200,
    type: "deposit",
    requirements: "Minimum deposit $20",
    expiryDays: 30,
    isActive: true,
    status: "active",
    progress: 0,
    wagering: 35,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "2",
    name: "Free Spins",
    description: "50 free spins on Starburst",
    amount: 50,
    type: "free_spins",
    requirements: "No deposit required",
    expiryDays: 7,
    isActive: true,
    status: "active",
    progress: 0,
    wagering: 40,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Mock bonus templates
const mockBonusTemplates: BonusTemplate[] = [
  {
    id: "1",
    name: "Welcome Bonus",
    description: "100% match up to $200",
    bonusType: "deposit",
    amount: 100,
    wagering: 35,
    expiryDays: 30,
    isActive: true
  },
  {
    id: "2",
    name: "Free Spins",
    description: "50 free spins on Starburst",
    bonusType: "free_spins",
    amount: 50,
    wagering: 40,
    expiryDays: 7,
    isActive: true
  }
];

// Mock affiliates
const mockAffiliates: Affiliate[] = [
  {
    id: "1",
    name: "Affiliate 1",
    email: "affiliate1@example.com",
    website: "https://affiliate1.com",
    commissionRate: 0.25,
    balance: 500,
    registeredDate: "2023-01-01",
    status: "active",
    referrals: 50
  },
  {
    id: "2",
    name: "Affiliate 2",
    email: "affiliate2@example.com",
    website: "https://affiliate2.com",
    commissionRate: 0.30,
    balance: 1000,
    registeredDate: "2023-02-15",
    status: "active",
    referrals: 100
  }
];

// Mock VIP levels
const mockVipLevels: VipLevel[] = [
  {
    id: 1,
    name: "Bronze",
    requirements: "1000 points",
    benefits: ["5% cashback"],
    cashbackRate: 0.05,
    withdrawalLimit: 5000,
    personalManager: false,
    customGifts: false,
    specialPromotions: false
  },
  {
    id: 2,
    name: "Silver",
    requirements: "5000 points",
    benefits: ["10% cashback", "Personal manager"],
    cashbackRate: 0.10,
    withdrawalLimit: 10000,
    personalManager: true,
    customGifts: false,
    specialPromotions: true
  }
];

// Mock KYC requests
const mockKycRequests: KycRequest[] = [
  {
    id: "1",
    userId: "2",
    userName: "player1",
    status: "pending",
    documentType: "Passport",
    documentImage: "/passport.jpg",
    submittedDate: "2023-04-10"
  },
  {
    id: "2",
    userId: "3",
    userName: "newuser",
    status: "rejected",
    documentType: "ID Card",
    documentImage: "/id-card.jpg",
    submittedDate: "2023-04-09",
    rejectionReason: "Invalid document"
  }
];

// Mock region stats
const mockRegionStats: RegionStats[] = [
  {
    region: "North America",
    userCount: 1500,
    depositAmount: 500000,
    betAmount: 2000000,
    winAmount: 1500000,
    netProfit: 500000
  },
  {
    region: "Europe",
    userCount: 2000,
    depositAmount: 750000,
    betAmount: 3000000,
    winAmount: 2250000,
    netProfit: 750000
  }
];

// Mock game stats
const mockGameStats: GameStats[] = [
  {
    gameId: "1",
    gameName: "Mega Fortune",
    provider: "NetEnt",
    totalBets: 50000,
    totalWins: 40000,
    netProfit: 10000,
    uniquePlayers: 500
  },
  {
    gameId: "2",
    gameName: "Gonzo's Quest",
    provider: "NetEnt",
    totalBets: 40000,
    totalWins: 30000,
    netProfit: 10000,
    uniquePlayers: 400
  }
];

// Mock provider stats
const mockProviderStats: ProviderStats[] = [
  {
    providerId: "1",
    providerName: "NetEnt",
    totalGames: 200,
    totalBets: 90000,
    totalWins: 70000,
    netProfit: 20000,
    uniquePlayers: 900
  },
  {
    providerId: "2",
    providerName: "Evolution Gaming",
    totalGames: 150,
    totalBets: 60000,
    totalWins: 45000,
    netProfit: 15000,
    uniquePlayers: 600
  }
];

// Function to fetch games
export const getGames = async (): Promise<Game[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockGames;
};

// Function to fetch game providers
export const getGameProviders = async (): Promise<GameProvider[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockProviders;
};

// Function to fetch users
export const getUsers = async (): Promise<User[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockUsers;
};

// Function to fetch transactions
export const getTransactions = async (): Promise<Transaction[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockTransactions;
};

// Function to fetch promotions
export const getPromotions = async (): Promise<Promotion[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockPromotions;
};

// Function to fetch bonuses
export const getBonuses = async (): Promise<Bonus[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockBonuses;
};

// Function to fetch bonus templates
export const getBonusTemplates = async (): Promise<BonusTemplate[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockBonusTemplates;
};

// Function to fetch affiliates
export const getAffiliates = async (): Promise<Affiliate[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockAffiliates;
};

// Function to fetch VIP levels
export const getVipLevels = async (): Promise<VipLevel[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockVipLevels;
};

// Function to fetch KYC requests
export const getKycRequests = async (): Promise<KycRequest[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockKycRequests;
};

// Function to fetch dashboard stats
export const getDashboardStats = async (): Promise<any> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    ggr: 100000,
    ngr: 50000,
    totalDeposits: 500000,
    totalWithdrawals: 200000,
    totalBets: 2000000,
    totalWins: 1500000,
    totalUsers: 1000,
    newUsers: 100,
    activeUsers: 500,
    bonusAmount: 50000,
    availableBalance: 500000
  };
};

// Function to fetch region stats
export const getRegionStats = async (): Promise<RegionStats[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockRegionStats;
};

// Function to fetch game stats
export const getGameStats = async (): Promise<GameStats[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockGameStats;
};

// Function to fetch provider stats
export const getProviderStats = async (): Promise<ProviderStats[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockProviderStats;
};

// API namespaces for better organization
export const gamesApi = {
  getGames,
  getGameProviders,
  addGame: async (gameData: Game) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return gameData;
  },
  updateGame: async (gameData: Game) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return gameData;
  },
  deleteGame: async (gameId: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  }
};

export const usersApi = {
  getUsers,
  addUser: async (userData: Omit<User, 'id'>) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { ...userData, id: Date.now().toString() };
  },
  updateUser: async (userData: User) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return userData;
  }
};

export const transactionsApi = {
  getTransactions,
  addTransaction: async (transactionData: Omit<Transaction, 'id'>) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { ...transactionData, id: Date.now().toString() };
  },
  updateTransaction: async (transactionData: Transaction) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return transactionData;
  }
};
