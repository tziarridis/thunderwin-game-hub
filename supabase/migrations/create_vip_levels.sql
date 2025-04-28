
-- Create VIP Levels table if it doesn't exist
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

-- Add some default VIP levels if the table is empty
INSERT INTO public.vip_levels (level, name, points_required, benefits, cashback_rate, withdrawal_limit, deposit_match, free_spins, birthday_bonus, color)
SELECT 1, 'Bronze', 0, ARRAY['Weekly Cashback', 'Birthday Bonus'], 5, 5000, 25, 10, 5, '#CD7F32'
WHERE NOT EXISTS (SELECT 1 FROM public.vip_levels WHERE level = 1);

INSERT INTO public.vip_levels (level, name, points_required, benefits, cashback_rate, withdrawal_limit, deposit_match, free_spins, birthday_bonus, color)
SELECT 2, 'Silver', 1000, ARRAY['Weekly Cashback', 'Birthday Bonus', 'Weekly Free Spins'], 7.5, 7500, 50, 25, 10, '#C0C0C0'
WHERE NOT EXISTS (SELECT 1 FROM public.vip_levels WHERE level = 2);

INSERT INTO public.vip_levels (level, name, points_required, benefits, cashback_rate, withdrawal_limit, deposit_match, free_spins, birthday_bonus, color, personal_manager)
SELECT 3, 'Gold', 5000, ARRAY['Daily Cashback', 'Birthday Bonus', 'Weekly Free Spins', 'Dedicated Support'], 10, 10000, 100, 50, 25, '#FFD700', false
WHERE NOT EXISTS (SELECT 1 FROM public.vip_levels WHERE level = 3);

INSERT INTO public.vip_levels (level, name, points_required, benefits, cashback_rate, withdrawal_limit, deposit_match, free_spins, birthday_bonus, color, personal_manager, custom_gifts)
SELECT 4, 'Platinum', 15000, ARRAY['Daily Cashback', 'Birthday Bonus', 'Daily Free Spins', 'Personal Manager', 'Custom Bonuses'], 15, 25000, 150, 100, 50, '#E5E4E2', true, true
WHERE NOT EXISTS (SELECT 1 FROM public.vip_levels WHERE level = 4);

INSERT INTO public.vip_levels (level, name, points_required, benefits, cashback_rate, withdrawal_limit, deposit_match, free_spins, birthday_bonus, color, personal_manager, custom_gifts, special_promotions)
SELECT 5, 'Diamond', 50000, ARRAY['Daily Cashback', 'Birthday Bonus', 'Daily Free Spins', 'VIP Manager', 'Custom Bonuses', 'Exclusive Events'], 20, 50000, 200, 250, 100, '#B9F2FF', true, true, true
WHERE NOT EXISTS (SELECT 1 FROM public.vip_levels WHERE level = 5);

-- Create Row Level Security (RLS) policies
ALTER TABLE public.vip_levels ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read VIP levels
CREATE POLICY "Anyone can view VIP levels" 
ON public.vip_levels 
FOR SELECT 
USING (true);

-- Only allow admin users to modify VIP levels
CREATE POLICY "Only admins can modify VIP levels" 
ON public.vip_levels 
FOR ALL 
USING (
  auth.uid() IN (
    SELECT id FROM public.users WHERE role_id = 1
  )
);
