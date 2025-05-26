
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

console.log("ml-fraud-detection function initializing");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // const supabaseClient = createClient(
    //   Deno.env.get('SUPABASE_URL') ?? '',
    //   Deno.env.get('SUPABASE_ANON_KEY') ?? '', // Use ANON_KEY if function is called from client-side service with user's JWT
    //                                           // Use SERVICE_ROLE_KEY if it needs elevated privileges not tied to a user
    //   { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    // );
    
    // const { data: { user } } = await supabaseClient.auth.getUser();
    // if (!user && Deno.env.get("VERIFY_JWT") !== "false") { // VERIFY_JWT env var might not be standard, check config.toml logic
    //   return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    // }

    const { userId, betData } = await req.json();
    console.log(`[ml-fraud-detection] Received request for userId: ${userId}, betData:`, betData);

    // Mock ML model processing
    const anomalyScore = Math.random() * 0.5 + (betData?.amount > 1000 ? 0.3 : 0); // Higher anomaly for large bets
    const confidence = Math.random() * 0.2 + 0.75; // High confidence
    const factors = ['bet_size_variance', 'timing_pattern'];
    if (betData?.amount > 1000) factors.push('large_bet_amount');
    if (Math.random() > 0.8) factors.push('unusual_game_choice');


    const mockPrediction = {
      anomalyScore: parseFloat(anomalyScore.toFixed(2)),
      confidence: parseFloat(confidence.toFixed(2)),
      factors,
      modelType: "mock_v1"
    };

    console.log(`[ml-fraud-detection] Mock prediction for userId ${userId}:`, mockPrediction);
    
    return new Response(JSON.stringify(mockPrediction), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('[ml-fraud-detection] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
