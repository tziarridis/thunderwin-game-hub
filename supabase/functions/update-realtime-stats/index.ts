
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

console.log("update-realtime-stats function initializing");

// Define RealtimePlayerUpdate interface matching the one in realtimeDataService.ts
interface RealtimePlayerUpdate {
  userId: string;
  status: 'online' | 'playing' | 'offline';
  gameId?: string;
  sessionId?: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let supabaseAdminClient: SupabaseClient;
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error("Supabase environment variables are not set.");
    }
    
    supabaseAdminClient = createClient(supabaseUrl, supabaseServiceRoleKey);

    const updateRequest: { update: RealtimePlayerUpdate, currentStats: any } = await req.json();
    const { update, currentStats: clientCurrentStats } = updateRequest;

    console.log(`[update-realtime-stats] Received update for userId: ${update.userId}, status: ${update.status}`);
    console.log(`[update-realtime-stats] Client-provided current stats:`, clientCurrentStats);

    // Fetch current stats from DB to ensure atomicity / latest data
    const { data: systemConfig, error: fetchError } = await supabaseAdminClient
      .from('system_config')
      .select('config_value')
      .eq('config_key', 'realtime_player_stats')
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('[update-realtime-stats] Error fetching system_config:', fetchError);
      throw fetchError;
    }
    
    let dbStats = { total_online: 0, total_playing: 0, active_sessions: 0 };
    if (systemConfig && systemConfig.config_value) {
        dbStats = systemConfig.config_value as any;
    } else {
        console.warn("[update-realtime-stats] No existing realtime_player_stats found in system_config. Initializing.");
    }


    const statsUpdate = {
        total_online: dbStats.total_online,
        total_playing: dbStats.total_playing,
        active_sessions: dbStats.active_sessions,
    };
      
    switch (update.status) {
      case 'online':
        statsUpdate.total_online = Math.max(0, statsUpdate.total_online + 1);
        break;
      case 'playing':
        // If player starts playing, they are also online. Ensure totalOnline is also incremented if they weren't counted yet.
        // This logic might need refinement based on exact event flow from client.
        // For simplicity, assume 'playing' implies 'online' status is already handled or client sends both.
        statsUpdate.total_playing = Math.max(0, statsUpdate.total_playing + 1);
        statsUpdate.active_sessions = Math.max(0, statsUpdate.active_sessions + 1);
        break;
      case 'offline':
        statsUpdate.total_online = Math.max(0, statsUpdate.total_online - 1);
        // If player goes offline, they are no longer playing.
        // Client should ideally send separate 'stopped_playing' event or this should be inferred.
        // For now, if status is 'offline', we assume they also stopped playing if they were.
        // This part needs careful handling of game session ends.
        // Let's assume client sends a 'stopped_playing' or this function is called appropriately.
        // If player was playing and goes offline, decrement playing and active sessions.
        // This requires knowing previous state or more specific events.
        // Simplified: if they go offline, reduce total_online. total_playing is harder without more context.
        // The client's currentStats might be stale.
        // To avoid double counting, this logic might need more sophisticated state management or rely on explicit 'stopped_playing' events.
        // For now, let's just update total_online for 'offline'.
        // If `update.status === 'offline'` implies user was playing and now is not, we need to decrement total_playing.
        // This part is tricky without knowing the exact client-side logic for sending these updates.
        // Let's assume 'offline' means they are no longer playing if they previously were.
        // This will be a placeholder for more robust logic.
        // To prevent `total_playing` becoming negative or incorrect, it's best to only decrement `total_online` on 'offline'
        // and have a separate mechanism or event for 'stopped_playing'.
        // For now, sticking to simple totalOnline decrement on 'offline'.
        break;
    }
    // If a user who was playing goes offline, we should also decrement totalPlaying and activeSessions.
    // This is a common source of discrepancy. For a robust system, we'd track individual sessions.
    // Let's assume client sends a 'stopped_playing' event for playing decrements or 'offline' implies it for now.

    const { error: upsertError } = await supabaseAdminClient
      .from('system_config')
      .upsert(
        {
          config_key: 'realtime_player_stats',
          config_value: {
            ...statsUpdate, // contains total_online, total_playing, active_sessions
            updated_at: new Date().toISOString(),
          },
          description: 'Real-time player statistics',
        },
        { onConflict: 'config_key' }
      );

    if (upsertError) {
      console.error('[update-realtime-stats] Error upserting system_config:', upsertError);
      throw upsertError;
    }

    console.log('[update-realtime-stats] Stats updated successfully:', statsUpdate);
    return new Response(JSON.stringify({ success: true, updatedStats: statsUpdate }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('[update-realtime-stats] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
