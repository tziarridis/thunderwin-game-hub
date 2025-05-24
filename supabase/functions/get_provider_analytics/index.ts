
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

    // Try materialized view first, then fallback
    let { data, error } = await supabaseClient
      .rpc('get_provider_analytics_data')

    if (error || !data) {
      console.log('Using fallback query for provider analytics')
      
      const { data: providerData, error: providerError } = await supabaseClient
        .from('providers')
        .select(`
          id,
          name,
          games(
            id,
            transactions(type, amount, player_id, created_at)
          )
        `)

      if (providerError) {
        throw providerError
      }

      data = providerData?.map(provider => {
        const allTransactions = provider.games?.flatMap(game => 
          game.transactions?.filter(t => 
            new Date(t.created_at) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          ) || []
        ) || []

        return {
          id: provider.id,
          name: provider.name,
          total_transactions: allTransactions.length,
          total_bets: allTransactions
            .filter(t => t.type === 'bet')
            .reduce((sum, t) => sum + Number(t.amount), 0),
          total_wins: allTransactions
            .filter(t => t.type === 'win')
            .reduce((sum, t) => sum + Number(t.amount), 0),
          unique_players: new Set(allTransactions.map(t => t.player_id)).size,
          total_games: provider.games?.length || 0
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
