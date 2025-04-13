
import { RecentWin } from "@/types/recent-wins";

// Mock data for development
const mockRecentWins: RecentWin[] = [
  {
    id: 1,
    user_display_name: "Mupfpj...",
    game_name: "Sweet Bonanza",
    game_image_url: "/lovable-uploads/2dc5015b-5024-411b-8ee9-4b422be630fa.png",
    win_amount: 227.93,
    currency: "USDT",
    created_at: "2023-04-10T10:23:45Z"
  },
  {
    id: 2,
    user_display_name: "Hidden***",
    game_name: "Aviator",
    game_image_url: "/lovable-uploads/2dc5015b-5024-411b-8ee9-4b422be630fa.png",
    win_amount: 156.42,
    currency: "BCD",
    created_at: "2023-04-10T10:20:15Z"
  },
  {
    id: 3,
    user_display_name: "Jackp...",
    game_name: "Gates of Olympus",
    game_image_url: "/lovable-uploads/2dc5015b-5024-411b-8ee9-4b422be630fa.png",
    win_amount: 893.51,
    currency: "USDT",
    created_at: "2023-04-10T10:15:33Z"
  },
  {
    id: 4,
    user_display_name: "Kron***",
    game_name: "Fruit Party",
    game_image_url: "/lovable-uploads/2dc5015b-5024-411b-8ee9-4b422be630fa.png",
    win_amount: 543.21,
    currency: "USDT",
    created_at: "2023-04-10T10:10:45Z"
  },
  {
    id: 5,
    user_display_name: "TheLu...",
    game_name: "Book of Dead",
    game_image_url: "/lovable-uploads/2dc5015b-5024-411b-8ee9-4b422be630fa.png",
    win_amount: 1250.75,
    currency: "BCD",
    created_at: "2023-04-10T10:05:22Z"
  },
  {
    id: 6,
    user_display_name: "Casino***",
    game_name: "Wolf Gold",
    game_image_url: "/lovable-uploads/2dc5015b-5024-411b-8ee9-4b422be630fa.png",
    win_amount: 647.32,
    currency: "USDT",
    created_at: "2023-04-10T10:00:11Z"
  },
  {
    id: 7,
    user_display_name: "BetMa...",
    game_name: "Buffalo King",
    game_image_url: "/lovable-uploads/2dc5015b-5024-411b-8ee9-4b422be630fa.png",
    win_amount: 3421.90,
    currency: "USDT",
    created_at: "2023-04-10T09:55:33Z"
  },
  {
    id: 8,
    user_display_name: "Lucky***",
    game_name: "Reactoonz",
    game_image_url: "/lovable-uploads/2dc5015b-5024-411b-8ee9-4b422be630fa.png",
    win_amount: 1987.65,
    currency: "BCD",
    created_at: "2023-04-10T09:50:21Z"
  },
  {
    id: 9,
    user_display_name: "Thund...",
    game_name: "Gonzo's Quest",
    game_image_url: "/lovable-uploads/2dc5015b-5024-411b-8ee9-4b422be630fa.png",
    win_amount: 754.18,
    currency: "USDT",
    created_at: "2023-04-10T09:45:12Z"
  },
  {
    id: 10,
    user_display_name: "Rich***",
    game_name: "Starburst",
    game_image_url: "/lovable-uploads/2dc5015b-5024-411b-8ee9-4b422be630fa.png",
    win_amount: 503.25,
    currency: "USDT",
    created_at: "2023-04-10T09:40:05Z"
  },
  {
    id: 11,
    user_display_name: "Slot***",
    game_name: "Book of Ra",
    game_image_url: "/lovable-uploads/2dc5015b-5024-411b-8ee9-4b422be630fa.png",
    win_amount: 892.47,
    currency: "USDT",
    created_at: "2023-04-10T09:35:18Z"
  },
  {
    id: 12,
    user_display_name: "Royal...",
    game_name: "Dead or Alive 2",
    game_image_url: "/lovable-uploads/2dc5015b-5024-411b-8ee9-4b422be630fa.png",
    win_amount: 2351.63,
    currency: "BCD",
    created_at: "2023-04-10T09:30:25Z"
  },
  {
    id: 13,
    user_display_name: "VIP***",
    game_name: "Mega Moolah",
    game_image_url: "/lovable-uploads/2dc5015b-5024-411b-8ee9-4b422be630fa.png",
    win_amount: 10325.78,
    currency: "USDT",
    created_at: "2023-04-10T09:25:33Z"
  },
  {
    id: 14,
    user_display_name: "Win***",
    game_name: "Immortal Romance",
    game_image_url: "/lovable-uploads/2dc5015b-5024-411b-8ee9-4b422be630fa.png",
    win_amount: 1547.92,
    currency: "USDT",
    created_at: "2023-04-10T09:20:09Z"
  },
  {
    id: 15,
    user_display_name: "Gold***",
    game_name: "Jack and the Beanstalk",
    game_image_url: "/lovable-uploads/2dc5015b-5024-411b-8ee9-4b422be630fa.png",
    win_amount: 987.35,
    currency: "BCD",
    created_at: "2023-04-10T09:15:55Z"
  }
];

// In a real implementation, this would fetch from your API
export const fetchRecentWins = async (): Promise<RecentWin[]> => {
  // Simulating API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return mockRecentWins;
};

// Filter wins by category
export const filterWinsByCategory = (wins: RecentWin[], category: string): RecentWin[] => {
  switch (category) {
    case "slots":
      return wins.filter(win => 
        win.game_name.includes("Bonanza") || 
        win.game_name.includes("Party") || 
        win.game_name.includes("Book") ||
        win.game_name.includes("King") ||
        win.game_name.includes("Gold")
      );
    case "live":
      return wins.filter(win => 
        win.game_name.includes("Roulette") || 
        win.game_name.includes("Blackjack") || 
        win.game_name.includes("Poker") ||
        win.game_name.includes("Table")
      );
    case "originals":
      return wins.filter(win => 
        win.game_name.includes("Aviator") || 
        win.game_name.includes("Crash") ||
        win.game_name.includes("BC") ||
        win.game_name.includes("Original")
      );
    default:
      return wins;
  }
};

// Format currency amount with K (thousands) or M (millions)
export const formatAmount = (amount: number): string => {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(2)}M`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(2)}K`;
  } else {
    return amount.toFixed(2);
  }
};
