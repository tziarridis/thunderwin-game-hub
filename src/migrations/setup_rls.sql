
-- Enable Row Level Security for all tables
ALTER TABLE public.vip_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorite_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonus_templates ENABLE ROW LEVEL SECURITY;

-- VIP Levels policies (publicly viewable)
CREATE POLICY "Anyone can view VIP levels" ON public.vip_levels
  FOR SELECT USING (true);

CREATE POLICY "Only admins can edit VIP levels" ON public.vip_levels
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role_id = 1
    )
  );

-- Bonuses policies (users can only see their own)
CREATE POLICY "Users can view their own bonuses" ON public.bonuses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all bonuses" ON public.bonuses
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role_id = 1
    )
  );

CREATE POLICY "Only admins can edit bonuses" ON public.bonuses
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role_id = 1
    )
  );

-- Games policies (publicly viewable)
CREATE POLICY "Anyone can view games" ON public.games
  FOR SELECT USING (true);

CREATE POLICY "Only admins can edit games" ON public.games
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role_id = 1
    )
  );

-- Favorite Games policies (users can only manage their own)
CREATE POLICY "Users can manage their favorite games" ON public.favorite_games
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all favorite games" ON public.favorite_games
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role_id = 1
    )
  );

-- KYC Requests policies
CREATE POLICY "Users can view their own KYC requests" ON public.kyc_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own KYC requests" ON public.kyc_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can manage all KYC requests" ON public.kyc_requests
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role_id = 1
    )
  );

-- Bonus Templates policies
CREATE POLICY "Anyone can view active bonus templates" ON public.bonus_templates
  FOR SELECT USING (is_active = true);

CREATE POLICY "Only admins can manage bonus templates" ON public.bonus_templates
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role_id = 1
    )
  );
