
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // Try materialized view first, then fallback to direct query
    let { data, error } = await supabaseClient
      .rpc('get_game_performance_data')

    if (error || !data) {
      console.log('Using fallback query for game performance')
      
      // Fallback query joining games with transactions
      const { data: gameData, error: gameError } = await supabaseClient
        .from('games')
        .select(`
          game_id,
          game_name,
          provider_id,
          transactions!inner(type, amount, player_id, created_at),
          game_sessions(id, duration_minutes)
        `)
        .gte('transactions.created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .limit(50)

      if (gameError) {
        throw gameError
      }

      // Process the data
      data = gameData?.map(game => {
        const transactions = game.transactions || []
        const sessions = game.game_sessions || []
        
        return {
          game_id: game.game_id,
          game_name: game.game_name,
          provider_id: game.provider_id,
          total_transactions: transactions.length,
          total_bets: transactions
            .filter(t => t.type === 'bet')
            .reduce((sum, t) => sum + Number(t.amount), 0),
          total_wins: transactions
            .filter(t => t.type === 'win')
            .reduce((sum, t) => sum + Number(t.amount), 0),
          unique_players: new Set(transactions.map(t => t.player_id)).size,
          total_sessions: sessions.length,
          avg_session_duration: sessions.length > 0 
            ? sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / sessions.length
            : 0
        }
      }) || []
    }

    return new Response(
      JSON.stringify({ data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      },
    )
  }
})
