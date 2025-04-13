
export interface RecentWin {
  id: number;
  user_display_name: string;
  game_name: string;
  game_image_url: string;
  win_amount: number;
  currency: string;
  created_at: string;
}

export interface RecentWinsResponse {
  wins: RecentWin[];
  total: number;
}
