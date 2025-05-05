
-- Create Favorite Games table
CREATE TABLE IF NOT EXISTS public.favorite_games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id VARCHAR NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, game_id)
);

-- Enable Row Level Security
ALTER TABLE public.favorite_games ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to SELECT their own favorite games
CREATE POLICY "Users can view their own favorite games" 
  ON public.favorite_games 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows users to INSERT their own favorite games
CREATE POLICY "Users can insert their own favorite games" 
  ON public.favorite_games 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy that allows users to DELETE their own favorite games
CREATE POLICY "Users can delete their own favorite games" 
  ON public.favorite_games 
  FOR DELETE 
  USING (auth.uid() = user_id);
