
import { gameAggregatorService } from '@/services/gameAggregatorService';

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

/**
 * Handles the seamless integration callback from the game provider
 */
export async function handleSeamlessCallback(req: Request) {
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
    
    console.log(`Received seamless callback for provider: ${provider}`, data);
    
    // Process the callback using the game aggregator service
    const result = await gameAggregatorService.processCallback(provider, data);
    
    // Format the response according to provider expectations
    let responseBody;
    
    if (provider.includes('pragmatic') || provider.includes('pp')) {
      responseBody = {
        errorcode: result.success ? "0" : "1",
        balance: result.balance || 0
      };
    } else if (provider.includes('infin')) {
      responseBody = {
        success: result.success,
        balance: result.balance || 0,
        error: result.success ? "" : (result.errorMessage || "Unknown error")
      };
    } else if (provider.includes('gsp') || provider.includes('gitslot')) {
      responseBody = {
        status: result.success ? "success" : "error",
        balance: result.balance || 0,
        currency: result.currency || "EUR",
        message: result.success ? "Success" : (result.errorMessage || "Unknown error")
      };
    } else {
      // Generic format
      responseBody = {
        success: result.success,
        balance: result.balance || 0,
        error: result.success ? "" : (result.errorMessage || "Unknown error")
      };
    }
    
    // Return the result
    return new Response(JSON.stringify(responseBody), {
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      status: 200
    });
  } catch (error: any) {
    console.error('Error handling seamless callback:', error);
    
    // Return error response
    return new Response(JSON.stringify({
      success: false,
      errorCode: 'INTERNAL_ERROR',
      errorMessage: error.message || 'Unknown error'
    }), {
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      status: 500
    });
  }
}

// Handle preflight OPTIONS requests for CORS
export async function handleOptions() {
  return new Response(null, {
    headers: corsHeaders,
    status: 204, // No content
  });
}

// Export the handler as default
export default async function handler(req: Request) {
  // Handle OPTIONS requests
  if (req.method === 'OPTIONS') {
    return handleOptions();
  }
  
  // Handle GET/POST requests
  return handleSeamlessCallback(req);
}
