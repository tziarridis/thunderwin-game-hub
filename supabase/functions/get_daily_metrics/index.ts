
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

    // Try to get data from materialized view first
    let { data, error } = await supabaseClient
      .rpc('get_daily_metrics_data')

    if (error || !data) {
      console.log('Materialized view not available, using fallback query')
      
      // Fallback to direct query from transactions table
      const { data: transactionData, error: transactionError } = await supabaseClient
        .from('transactions')
        .select('created_at, type, amount, player_id')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

      if (transactionError) {
        throw transactionError
      }

      // Process data into daily metrics
      const dailyData = new Map()
      
      transactionData?.forEach(transaction => {
        const date = transaction.created_at.split('T')[0]
        
        if (!dailyData.has(date)) {
          dailyData.set(date, {
            date,
            total_transactions: 0,
            total_deposits: 0,
            total_withdrawals: 0,
            total_bets: 0,
            total_wins: 0,
            unique_players: new Set()
          })
        }
        
        const dayData = dailyData.get(date)
        dayData.total_transactions++
        dayData.unique_players.add(transaction.player_id)
        
        switch (transaction.type) {
          case 'deposit':
            dayData.total_deposits += Number(transaction.amount)
            break
          case 'withdraw':
            dayData.total_withdrawals += Number(transaction.amount)
            break
          case 'bet':
            dayData.total_bets += Number(transaction.amount)
            break
          case 'win':
            dayData.total_wins += Number(transaction.amount)
            break
        }
      })

      data = Array.from(dailyData.values()).map(item => ({
        ...item,
        unique_players: item.unique_players.size
      })).sort((a, b) => b.date.localeCompare(a.date))
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
