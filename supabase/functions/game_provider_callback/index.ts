
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

// Set up Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
const supabase = createClient(supabaseUrl, supabaseKey);

// CORS headers for browser access
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Check the endpoint path to determine the provider
  const url = new URL(req.url);
  const providerPath = url.pathname.split("/").pop();
  
  try {
    // Parse the request body as JSON
    const requestData = await req.json();
    console.log(`Received callback from ${providerPath}:`, requestData);
    
    // Handle each provider differently
    switch (providerPath) {
      case "pragmatic-play":
        return handlePragmaticPlayCallback(requestData);
      case "gitslotpark":
        return handleGitSlotParkCallback(requestData);
      default:
        // Generic handler for unknown providers
        return handleGenericCallback(requestData, providerPath);
    }
  } catch (error) {
    console.error(`Error processing ${providerPath} callback:`, error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: `Failed to process callback: ${error.message}`,
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});

// Pragmatic Play callback handler
async function handlePragmaticPlayCallback(data: any) {
  console.log("Processing Pragmatic Play callback");

  // Extract required data
  const {
    userId,
    gameId,
    roundId,
    amount,
    currency,
    transactionId,
    action,
  } = data;

  let response = {
    success: false,
    balance: 0,
    error: "",
  };

  // Get the user's wallet
  const { data: wallet, error: walletError } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (walletError) {
    console.error("Error fetching wallet:", walletError);
    response.error = "Wallet not found";
    return formatResponse(response);
  }

  // Process based on action type
  try {
    if (action === "bet") {
      // Process bet - deduct balance
      if (wallet.balance < amount) {
        response.error = "Insufficient funds";
        response.balance = wallet.balance;
        return formatResponse(response);
      }

      const newBalance = wallet.balance - amount;
      
      // Update wallet
      const { error: updateError } = await supabase
        .from("wallets")
        .update({ balance: newBalance })
        .eq("user_id", userId);
        
      if (updateError) throw updateError;
      
      // Record transaction
      await recordTransaction({
        player_id: userId,
        amount: amount,
        currency: currency,
        type: "bet",
        provider: "Pragmatic Play",
        game_id: gameId,
        round_id: roundId,
        balance_before: wallet.balance,
        balance_after: newBalance,
        status: "completed",
        reference_id: transactionId
      });
      
      response = {
        success: true,
        balance: newBalance,
        error: "",
      };
    } 
    else if (action === "win") {
      // Process win - add to balance
      const newBalance = wallet.balance + amount;
      
      // Update wallet
      const { error: updateError } = await supabase
        .from("wallets")
        .update({ balance: newBalance })
        .eq("user_id", userId);
        
      if (updateError) throw updateError;
      
      // Record transaction
      await recordTransaction({
        player_id: userId,
        amount: amount,
        currency: currency,
        type: "win",
        provider: "Pragmatic Play",
        game_id: gameId,
        round_id: roundId,
        balance_before: wallet.balance,
        balance_after: newBalance,
        status: "completed",
        reference_id: transactionId
      });
      
      response = {
        success: true,
        balance: newBalance,
        error: "",
      };
    }
    else if (action === "refund") {
      // Process refund - return bet amount
      const newBalance = wallet.balance + amount;
      
      // Update wallet
      const { error: updateError } = await supabase
        .from("wallets")
        .update({ balance: newBalance })
        .eq("user_id", userId);
        
      if (updateError) throw updateError;
      
      // Record transaction
      await recordTransaction({
        player_id: userId,
        amount: amount,
        currency: currency,
        type: "refund",
        provider: "Pragmatic Play",
        game_id: gameId,
        round_id: roundId,
        balance_before: wallet.balance,
        balance_after: newBalance,
        status: "completed",
        reference_id: transactionId
      });
      
      response = {
        success: true,
        balance: newBalance,
        error: "",
      };
    }
    else {
      response.error = `Unknown action: ${action}`;
    }
  } catch (error) {
    console.error("Error processing transaction:", error);
    response.error = `Transaction processing error: ${error.message}`;
  }

  return formatResponse(response);
}

// GitSlotPark callback handler
async function handleGitSlotParkCallback(data: any) {
  console.log("Processing GitSlotPark callback");
  
  // Extract required data from GitSlotPark format
  const {
    playerId,
    gameId,
    roundId,
    amount,
    currency,
    transactionId,
    action,
  } = data;

  // Similar logic to Pragmatic Play but with GitSlotPark specific adjustments
  let response = {
    success: false,
    balance: 0,
    error: "",
  };

  // Get the user's wallet
  const { data: wallet, error: walletError } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", playerId)
    .single();

  if (walletError) {
    console.error("Error fetching wallet:", walletError);
    response.error = "Wallet not found";
    return formatResponse(response);
  }

  // Process based on action type
  try {
    if (action === "bet" || action === "debit") {
      // Process bet - deduct balance
      if (wallet.balance < amount) {
        response.error = "Insufficient funds";
        response.balance = wallet.balance;
        return formatResponse(response);
      }

      const newBalance = wallet.balance - amount;
      
      // Update wallet
      const { error: updateError } = await supabase
        .from("wallets")
        .update({ balance: newBalance })
        .eq("user_id", playerId);
        
      if (updateError) throw updateError;
      
      // Record transaction
      await recordTransaction({
        player_id: playerId,
        amount: amount,
        currency: currency,
        type: "bet",
        provider: "GitSlotPark",
        game_id: gameId,
        round_id: roundId,
        balance_before: wallet.balance,
        balance_after: newBalance,
        status: "completed",
        reference_id: transactionId
      });
      
      response = {
        success: true,
        balance: newBalance,
        error: "",
      };
    } 
    else if (action === "win" || action === "credit") {
      // Process win - add to balance
      const newBalance = wallet.balance + amount;
      
      // Update wallet
      const { error: updateError } = await supabase
        .from("wallets")
        .update({ balance: newBalance })
        .eq("user_id", playerId);
        
      if (updateError) throw updateError;
      
      // Record transaction
      await recordTransaction({
        player_id: playerId,
        amount: amount,
        currency: currency,
        type: "win",
        provider: "GitSlotPark",
        game_id: gameId,
        round_id: roundId,
        balance_before: wallet.balance,
        balance_after: newBalance,
        status: "completed",
        reference_id: transactionId
      });
      
      response = {
        success: true,
        balance: newBalance,
        error: "",
      };
    }
    else {
      response.error = `Unknown action: ${action}`;
    }
  } catch (error) {
    console.error("Error processing transaction:", error);
    response.error = `Transaction processing error: ${error.message}`;
  }

  return formatResponse(response);
}

// Generic handler for other providers
async function handleGenericCallback(data: any, provider: string) {
  console.log(`Processing ${provider} callback`);
  
  // Log the callback data for debugging
  console.log("Callback data:", data);
  
  // Generic success response
  return formatResponse({
    success: true,
    balance: 1000, // Default balance
    error: "",
  });
}

// Helper to record a transaction in the database
async function recordTransaction(transactionData: any) {
  const { error } = await supabase
    .from("transactions")
    .insert(transactionData);
    
  if (error) {
    console.error("Error recording transaction:", error);
    throw error;
  }
}

// Helper to format the response with proper headers
function formatResponse(data: any) {
  return new Response(
    JSON.stringify(data),
    {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    }
  );
}
