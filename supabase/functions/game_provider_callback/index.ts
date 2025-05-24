
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

  // Mock successful transaction
  return {
    success: true,
    balance: 100.00, // Mock balance
    error: ""
  };
}

// GitSlotPark callback handler
async function handleGitSlotParkCallback(data: any) {
  console.log("Processing GitSlotPark callback");
  
  // Mock successful transaction
  return {
    success: true,
    balance: 100.00, // Mock balance
    error: ""
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
