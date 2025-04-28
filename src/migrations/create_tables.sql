
-- Create VIP Levels table
CREATE TABLE IF NOT EXISTS public.vip_levels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  level INT NOT NULL,
  name VARCHAR NOT NULL,
  points_required INT NOT NULL,
  benefits TEXT[] DEFAULT '{}',
  cashback_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  withdrawal_limit DECIMAL(15,2) NOT NULL DEFAULT 0,
  deposit_match INT NOT NULL DEFAULT 0,
  free_spins INT NOT NULL DEFAULT 0,
  birthday_bonus INT NOT NULL DEFAULT 0,
  color VARCHAR,
  personal_manager BOOLEAN DEFAULT false,
  custom_gifts BOOLEAN DEFAULT false,
  special_promotions BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create Bonuses table
CREATE TABLE IF NOT EXISTS public.bonuses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'active',
  expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  wagering_requirement INT NOT NULL DEFAULT 0,
  progress INT NOT NULL DEFAULT 0,
  description TEXT,
  code VARCHAR,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create Games table
CREATE TABLE IF NOT EXISTS public.games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID REFERENCES public.providers(id),
  game_id VARCHAR NOT NULL,
  game_name VARCHAR NOT NULL,
  game_code VARCHAR NOT NULL,
  game_type VARCHAR,
  description TEXT,
  cover VARCHAR,
  status VARCHAR NOT NULL DEFAULT 'active',
  technology VARCHAR,
  has_lobby BOOLEAN DEFAULT false,
  is_mobile BOOLEAN DEFAULT true,
  has_freespins BOOLEAN DEFAULT false,
  has_tables BOOLEAN DEFAULT false,
  only_demo BOOLEAN DEFAULT false,
  rtp DECIMAL(5,2) DEFAULT 96.0,
  distribution VARCHAR,
  views INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  show_home BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create Favorite Games table
CREATE TABLE IF NOT EXISTS public.favorite_games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, game_id)
);

-- Create KYC Requests table
CREATE TABLE IF NOT EXISTS public.kyc_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type VARCHAR NOT NULL,
  document_number VARCHAR NOT NULL,
  submission_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status VARCHAR NOT NULL DEFAULT 'pending',
  verification_date TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  document_urls TEXT[] DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create Bonus Templates table
CREATE TABLE IF NOT EXISTS public.bonus_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR NOT NULL,
  value DECIMAL(15,2) NOT NULL,
  min_deposit DECIMAL(15,2),
  wagering_requirement INT NOT NULL,
  duration_days INT NOT NULL,
  vip_levels INT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  bonus_type VARCHAR,
  amount DECIMAL(15,2),
  percentage DECIMAL(5,2),
  max_bonus DECIMAL(15,2),
  vip_level_required INT,
  allowed_games VARCHAR,
  code VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
