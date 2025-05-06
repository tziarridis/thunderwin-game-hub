
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    let requestData;
    try {
      requestData = await req.json();
    } catch (error) {
      // If JSON parsing fails, try to handle as form data
      const formData = await req.formData();
      requestData = Object.fromEntries(formData.entries());
    }
    
    console.log(`Received callback from ${providerPath}:`, requestData);
    
    // Handle each provider differently
    let response;
    switch (providerPath) {
      case "pragmatic-play":
        response = await handlePragmaticPlayCallback(requestData);
        break;
      case "gitslotpark":
        response = await handleGitSlotParkCallback(requestData);
        break;
      case "infin":
        response = await handleInfinCallback(requestData);
        break;
      default:
        // Generic handler for unknown providers
        response = await handleGenericCallback(requestData, providerPath);
    }
    
    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
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

  // Validate the request data according to Pragmatic Play documentation
  if (!data.playerid || !data.amount) {
    return {
      errorcode: "1",
      message: "Invalid request data",
      balance: 0
    };
  }

  // Mock successful transaction
  return {
    errorcode: "0",  // 0 means success
    balance: 100.00, // Mock balance
    error: ""
  };
}

// GitSlotPark callback handler according to docs: 
// https://documenter.getpostman.com/view/25695248/2sA3Qy7VR4#255da0c0-97a6-411d-a2eb-9f5460515084
async function handleGitSlotParkCallback(data: any) {
  console.log("Processing GitSlotPark callback");
  
  // Validate request according to GitSlotPark docs
  if (!data.userId || !data.operation) {
    return {
      success: false,
      errorCode: "INVALID_REQUEST",
      message: "Missing required fields"
    };
  }
  
  // Mock successful transaction
  if (data.operation === "balance") {
    return {
      success: true,
      balance: 100.00,
      currency: data.currency || "EUR"
    };
  }
  
  if (data.operation === "bet") {
    return {
      success: true,
      balance: 95.00, // Reduced after bet
      transactionId: `gsp-tx-${Date.now()}`
    };
  }
  
  if (data.operation === "win") {
    return {
      success: true,
      balance: 110.00, // Increased after win
      transactionId: `gsp-tx-${Date.now()}`
    };
  }
  
  return {
    success: true,
    balance: 100.00,
    transactionId: `gsp-tx-${Date.now()}`
  };
}

// InfinGame callback handler according to docs:
// https://infinapi-docs.axis-stage.infingame.com/wallet
async function handleInfinCallback(data: any) {
  console.log("Processing InfinGame callback");
  
  // Validate request according to InfinGame docs
  if (!data.userId || !data.operationType) {
    return {
      status: "error",
      errorCode: "INVALID_REQUEST",
      message: "Missing required fields"
    };
  }
  
  // Mock successful transaction based on operation type
  if (data.operationType === "getBalance") {
    return {
      status: "success",
      balance: 100.00,
      currency: data.currency || "EUR"
    };
  }
  
  if (data.operationType === "debit") {
    return {
      status: "success",
      balance: 95.00, // Reduced after debit
      transactionId: `infin-tx-${Date.now()}`
    };
  }
  
  if (data.operationType === "credit") {
    return {
      status: "success",
      balance: 110.00, // Increased after credit
      transactionId: `infin-tx-${Date.now()}`
    };
  }
  
  return {
    status: "success",
    balance: 100.00,
    transactionId: `infin-tx-${Date.now()}`
  };
}

// Generic handler for other providers
async function handleGenericCallback(data: any, provider: string) {
  console.log(`Processing ${provider} callback`);
  
  // Log the callback data for debugging
  console.log("Callback data:", data);
  
  // Generic success response
  return {
    success: true,
    balance: 100.00, // Default balance
    error: ""
  };
}
