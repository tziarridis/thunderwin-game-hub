
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Set up CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Auth context of the logged-in user
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: { headers: { Authorization: req.headers.get("Authorization")! } },
      }
    );

    // Get the current user session
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized", message: "User not authenticated" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the request body
    const { userId, amount, type, provider, gameId } = await req.json();

    // Validate inputs
    if (!userId || !amount || amount <= 0 || !type) {
      return new Response(
        JSON.stringify({ error: "Bad Request", message: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the user's wallet
    const { data: wallet, error: walletError } = await supabaseClient
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (walletError || !wallet) {
      return new Response(
        JSON.stringify({ error: "Not Found", message: "Wallet not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate new balance
    const newBalance = wallet.balance + amount;

    // Start a Postgres transaction
    // Update wallet balance
    const { error: updateError } = await supabaseClient
      .from('wallets')
      .update({
        balance: newBalance,
        updated_at: new Date().toISOString(),
        total_won: type === 'win' ? wallet.total_won + amount : wallet.total_won,
        last_won: type === 'win' ? amount : wallet.last_won
      })
      .eq('id', wallet.id);

    if (updateError) {
      throw updateError;
    }

    // Create transaction record
    const { data: transaction, error: transactionError } = await supabaseClient
      .from('transactions')
      .insert({
        player_id: userId,
        amount,
        currency: wallet.currency,
        type,
        provider: provider || 'system',
        game_id: gameId,
        status: 'completed',
        balance_before: wallet.balance,
        balance_after: newBalance
      })
      .select()
      .single();

    if (transactionError) {
      throw transactionError;
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        transaction: transaction,
        newBalance
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in credit_wallet function:", error);
    
    return new Response(
      JSON.stringify({ error: "Internal Server Error", message: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
