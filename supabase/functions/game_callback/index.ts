
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // Get the provider from the URL
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const provider = pathParts[pathParts.length - 1] || 'default';
    
    console.log(`Received callback for provider: ${provider} via path: ${url.pathname}`);
    
    // Parse the request body
    let data;
    try {
      data = await req.json();
    } catch (error) {
      console.error('Failed to parse request body as JSON:', error);
      
      // Try to parse as form data if JSON parsing fails
      const formData = await req.formData();
      data = Object.fromEntries(formData.entries());
      
      console.log('Parsed callback data (form format):', data);
    }
    
    console.log(`Processing ${provider} callback:`, data);
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Determine transaction type
    const transactionType = determineTransactionType(provider, data);
    
    // Extract player ID
    const playerId = extractPlayerId(provider, data);
    
    if (!playerId) {
      return errorResponse(provider, 'INVALID_PLAYER', 'Player ID is missing or invalid');
    }
    
    // Get current wallet balance
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', playerId)
      .single();
      
    if (walletError) {
      console.error('Error fetching wallet:', walletError);
      return errorResponse(provider, 'DATABASE_ERROR', 'Failed to fetch wallet data');
    }
    
    const currentBalance = wallet?.balance || 0;
    
    // Extract amount
    const amount = extractAmount(provider, data);
    
    // Process transaction
    let newBalance = currentBalance;
    let transactionStatus = 'pending';
    
    if (transactionType === 'bet') {
      // Check if player has enough balance
      if (currentBalance < amount) {
        return errorResponse(
          provider, 
          'INSUFFICIENT_FUNDS', 
          'Insufficient funds', 
          currentBalance
        );
      }
      
      newBalance = currentBalance - amount;
      transactionStatus = 'completed';
    } 
    else if (transactionType === 'win') {
      newBalance = currentBalance + amount;
      transactionStatus = 'completed';
    }
    else if (transactionType === 'refund') {
      newBalance = currentBalance + amount;
      transactionStatus = 'completed';
    }
    else if (transactionType === 'balance') {
      // Just return current balance
      return successResponse(provider, currentBalance);
    }
    
    // Update wallet balance
    const { error: updateError } = await supabase
      .from('wallets')
      .update({ balance: newBalance })
      .eq('user_id', playerId);
      
    if (updateError) {
      console.error('Error updating wallet balance:', updateError);
      return errorResponse(
        provider, 
        'DATABASE_ERROR', 
        'Failed to update wallet balance', 
        currentBalance
      );
    }
    
    // Record transaction
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        player_id: playerId,
        type: transactionType,
        amount: amount,
        currency: extractCurrency(provider, data) || 'EUR',
        game_id: extractGameId(provider, data),
        round_id: extractRoundId(provider, data),
        session_id: extractSessionId(provider, data),
        provider: provider,
        balance_before: currentBalance,
        balance_after: newBalance,
        status: transactionStatus
      });
      
    if (transactionError) {
      console.error('Error recording transaction:', transactionError);
      // We succeeded in updating the balance but failed to record the transaction
      // In a production system, this should be handled more gracefully
    }
    
    // Return successful response
    return successResponse(provider, newBalance);
    
  } catch (error) {
    console.error('Error handling callback:', error);
    return errorResponse('default', 'INTERNAL_ERROR', 'Internal server error');
  }
});

// Helper functions
function determineTransactionType(provider: string, data: any): string {
  if (provider.includes('pragmatic') || provider.includes('pp')) {
    // Pragmatic Play format
    if (!data.type) return 'balance';
    return data.type === 'credit' ? 'win' : 
           data.type === 'debit' ? 'bet' : 
           data.type === 'rollback' ? 'refund' : 'unknown';
  } 
  else if (provider.includes('infin')) {
    // InfinGame format
    return data.type === 'credit' ? 'win' : 
           data.type === 'debit' ? 'bet' : 
           data.type === 'refund' ? 'refund' : 'balance';
  }
  else if (provider.includes('gsp') || provider.includes('gitslot')) {
    // GitSlotPark format
    return data.operation === 'win' ? 'win' : 
           data.operation === 'bet' ? 'bet' : 
           data.operation === 'refund' ? 'refund' : 
           data.operation === 'balance' ? 'balance' : 'bet';
  }
  // Default behavior
  return 'unknown';
}

function extractPlayerId(provider: string, data: any): string {
  if (provider.includes('pragmatic') || provider.includes('pp')) {
    return data.playerid || data.playerId || '';
  } 
  else if (provider.includes('infin')) {
    return data.player_id || data.playerId || '';
  }
  else if (provider.includes('gsp') || provider.includes('gitslot')) {
    return data.player_id || '';
  }
  return '';
}

function extractAmount(provider: string, data: any): number {
  if (provider.includes('pragmatic') || provider.includes('pp')) {
    return parseFloat(data.amount || '0');
  } 
  else if (provider.includes('infin')) {
    return parseFloat(data.amount || '0');
  }
  else if (provider.includes('gsp') || provider.includes('gitslot')) {
    return parseFloat(data.amount || '0');
  }
  return 0;
}

function extractCurrency(provider: string, data: any): string {
  if (provider.includes('pragmatic') || provider.includes('pp')) {
    return data.currency || 'EUR';
  } 
  else if (provider.includes('infin')) {
    return data.currency || 'EUR';
  }
  else if (provider.includes('gsp') || provider.includes('gitslot')) {
    return data.currency || 'EUR';
  }
  return 'EUR';
}

function extractGameId(provider: string, data: any): string {
  if (provider.includes('pragmatic') || provider.includes('pp')) {
    return data.gameref || data.gameId || '';
  } 
  else if (provider.includes('infin')) {
    return data.game_id || data.gameId || '';
  }
  else if (provider.includes('gsp') || provider.includes('gitslot')) {
    return data.game_id || '';
  }
  return '';
}

function extractRoundId(provider: string, data: any): string {
  if (provider.includes('pragmatic') || provider.includes('pp')) {
    return data.roundid || data.roundId || '';
  } 
  else if (provider.includes('infin')) {
    return data.round_id || data.roundId || '';
  }
  else if (provider.includes('gsp') || provider.includes('gitslot')) {
    return data.round_id || '';
  }
  return '';
}

function extractSessionId(provider: string, data: any): string {
  if (provider.includes('pragmatic') || provider.includes('pp')) {
    return data.sessionid || data.sessionId || '';
  } 
  else if (provider.includes('infin')) {
    return data.session_id || data.sessionId || '';
  }
  else if (provider.includes('gsp') || provider.includes('gitslot')) {
    return data.session_id || '';
  }
  return '';
}

function successResponse(provider: string, balance: number): Response {
  let responseBody: any;
  
  if (provider.includes('pragmatic') || provider.includes('pp')) {
    responseBody = {
      errorcode: "0",
      balance: balance
    };
  } else if (provider.includes('infin')) {
    responseBody = {
      success: true,
      balance: balance,
      error: ""
    };
  } else if (provider.includes('gsp') || provider.includes('gitslot')) {
    responseBody = {
      status: "success",
      balance: balance,
      currency: "EUR",
      message: "Success"
    };
  } else {
    // Generic format
    responseBody = {
      success: true,
      balance: balance,
      error: ""
    };
  }
  
  return new Response(JSON.stringify(responseBody), {
    headers: { 
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
    status: 200
  });
}

function errorResponse(
  provider: string, 
  errorCode: string, 
  errorMessage: string, 
  balance?: number
): Response {
  let responseBody: any;
  
  if (provider.includes('pragmatic') || provider.includes('pp')) {
    responseBody = {
      errorcode: "1",
      balance: balance || 0,
      error: errorMessage
    };
  } else if (provider.includes('infin')) {
    responseBody = {
      success: false,
      balance: balance || 0,
      error: errorMessage
    };
  } else if (provider.includes('gsp') || provider.includes('gitslot')) {
    responseBody = {
      status: "error",
      balance: balance || 0,
      currency: "EUR",
      message: errorMessage
    };
  } else {
    // Generic format
    responseBody = {
      success: false,
      balance: balance || 0,
      error: errorMessage
    };
  }
  
  return new Response(JSON.stringify(responseBody), {
    headers: { 
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
    status: 200 // Still return 200 status but with error in body as per gaming industry standards
  });
}
