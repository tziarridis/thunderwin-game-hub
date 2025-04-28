import { VipLevel, Transaction, Bonus } from "@/types";

// Mock API service for VIP levels
export const getVipLevels = async (): Promise<VipLevel[]> => {
  // Mock data
  const vipLevels: VipLevel[] = [
    {
      id: 1,
      level: 1,
      name: "Bronze",
      pointsRequired: 0,
      benefits: [
        "Welcome Bonus",
        "Weekly Cashback 5%",
        "Fast Withdrawals"
      ],
      cashbackRate: 0.05,
      withdrawalLimit: 5000,
      bonuses: {
        depositMatch: 50,
        freeSpins: 10,
        birthdayBonus: 10
      },
      color: "#CD7F32",
    },
    {
      id: 2,
      level: 2,
      name: "Silver",
      pointsRequired: 1000,
      benefits: [
        "Weekly Cashback 7%",
        "Higher Withdrawal Limits",
        "Enhanced Bonuses",
        "Faster Withdrawals"
      ],
      cashbackRate: 0.07,
      withdrawalLimit: 10000,
      bonuses: {
        depositMatch: 100,
        freeSpins: 25,
        birthdayBonus: 25
      },
      color: "#C0C0C0",
    },
    {
      id: 3,
      level: 3,
      name: "Gold",
      pointsRequired: 5000,
      benefits: [
        "Weekly Cashback 10%", 
        "Personal Account Manager",
        "Custom Bonuses",
        "Priority Withdrawals",
        "Special Promotions"
      ],
      cashbackRate: 0.1,
      withdrawalLimit: 25000,
      personalManager: true,
      specialPromotions: true,
      bonuses: {
        depositMatch: 150,
        freeSpins: 50,
        birthdayBonus: 50
      },
      color: "#FFD700",
    },
    {
      id: 4,
      level: 4,
      name: "Platinum",
      pointsRequired: 20000,
      benefits: [
        "Weekly Cashback 15%",
        "VIP Only Tournaments",
        "Custom Gifts",
        "Luxury Holiday Packages",
        "Personal Account Manager",
        "Unlimited Withdrawals"
      ],
      cashbackRate: 0.15,
      withdrawalLimit: 50000,
      personalManager: true,
      customGifts: true,
      specialPromotions: true,
      bonuses: {
        depositMatch: 200,
        freeSpins: 100,
        birthdayBonus: 100
      },
      color: "#E5E4E2",
    },
    {
      id: 5,
      level: 5,
      name: "Diamond",
      pointsRequired: 50000,
      benefits: [
        "Weekly Cashback 20%",
        "Exclusive VIP Events",
        "Custom Gifts",
        "Luxury Holiday Packages",
        "Personal Account Manager",
        "Unlimited Withdrawals",
        "Custom Withdrawal Limits"
      ],
      cashbackRate: 0.2,
      withdrawalLimit: 100000,
      personalManager: true,
      customGifts: true,
      specialPromotions: true,
      bonuses: {
        depositMatch: 300,
        freeSpins: 200,
        birthdayBonus: 200
      },
      color: "#B9F2FF",
    }
  ];

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return vipLevels;
};

export const createVipLevel = async (newLevel: Omit<VipLevel, "id">): Promise<VipLevel> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Generate a unique ID (in a real API this would be done by the server)
  const id = Date.now();
  
  const createdLevel: VipLevel = {
    ...newLevel,
    id
  };
  
  return createdLevel;
};

export const updateVipLevel = async (updatedLevel: VipLevel): Promise<VipLevel> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In a real API, we'd update the database here
  
  return updatedLevel;
};

export const deleteVipLevel = async (id: number): Promise<void> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In a real API, we'd delete from the database here
};

// Mock API service for transactions
export const getTransactions = async (userId: string): Promise<Transaction[]> => {
  // Mock data
  const transactions: Transaction[] = [
    {
      id: "1",
      userId: userId,
      type: "deposit",
      amount: 100,
      currency: "USD",
      status: "completed",
      date: "2023-07-27T10:00:00Z",
      description: "Initial deposit",
      paymentMethod: "credit_card"
    },
    {
      id: "2",
      userId: userId,
      type: "withdrawal",
      amount: 50,
      currency: "USD",
      status: "pending",
      date: "2023-07-26T15:30:00Z",
      description: "Withdrawal request",
      paymentMethod: "bank_transfer"
    },
    {
      id: "3",
      userId: userId,
      type: "bet",
      amount: 10,
      currency: "USD",
      status: "completed",
      date: "2023-07-25T18:45:00Z",
      gameId: "slot-123",
    },
    {
      id: "4",
      userId: userId,
      type: "win",
      amount: 20,
      currency: "USD",
      status: "completed",
      date: "2023-07-25T19:00:00Z",
      gameId: "slot-123",
    },
    {
      id: "5",
      userId: userId,
      type: "bonus",
      amount: 25,
      currency: "USD",
      status: "completed",
      date: "2023-07-24T20:00:00Z",
      bonusId: "welcome-bonus",
    },
  ];

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return transactions;
};

// Mock API service for bonuses
export const getBonuses = async (userId: string): Promise<Bonus[]> => {
  // Mock data
  const bonuses: Bonus[] = [
    {
      id: "1",
      userId: userId,
      type: "welcome",
      amount: 100,
      status: "active",
      expiryDate: "2023-08-15T00:00:00Z",
      createdAt: "2023-07-15T14:30:00Z",
      wageringRequirement: 35,
      progress: 0,
      description: "Welcome bonus for new users - 100% match up to $100",
      code: "WELCOME100"
    },
    {
      id: "2",
      userId: userId,
      type: "free_spins",
      amount: 50,
      status: "active",
      expiryDate: "2023-08-10T00:00:00Z",
      createdAt: "2023-07-10T09:45:00Z",
      wageringRequirement: 20,
      progress: 0,
      description: "50 free spins on Starburst",
      code: "SPIN50"
    },
    {
      id: "3",
      userId: userId,
      type: "deposit",
      amount: 75,
      status: "active",
      expiryDate: "2023-08-05T00:00:00Z",
      createdAt: "2023-07-05T16:15:00Z",
      wageringRequirement: 30,
      progress: 45,
      description: "Weekly reload bonus - 50% match up to $75",
      code: "RELOAD50"
    },
    {
      id: "4",
      userId: userId,
      type: "cashback",
      amount: 25,
      status: "used",
      expiryDate: "2023-06-30T00:00:00Z",
      createdAt: "2023-06-20T11:30:00Z",
      wageringRequirement: 10,
      progress: 100,
      description: "10% cashback on losses",
      code: "CASH10"
    },
    {
      id: "5",
      userId: userId,
      type: "free_spins",
      amount: 20,
      status: "expired",
      expiryDate: "2023-06-25T00:00:00Z",
      createdAt: "2023-06-15T14:30:00Z",
      wageringRequirement: 15,
      progress: 60,
      description: "20 free spins on Book of Dead",
      code: "BOOK20"
    },
  ];

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return bonuses;
};
