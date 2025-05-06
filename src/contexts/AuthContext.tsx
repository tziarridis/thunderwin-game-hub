
// Only update the refreshWalletBalance method to fix the wallet handling
export const refreshWalletBalance = async () => {
  if (!user) return;
  
  try {
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (error) {
      console.error('Error refreshing wallet balance:', error);
      return;
    }
    
    if (data) {
      setWalletBalance(data.balance || 0);
      setVipLevel(data.vip_level || 0);
    }
  } catch (error) {
    console.error('Error refreshing wallet balance:', error);
  }
};
