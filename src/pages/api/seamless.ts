
import { gameAggregatorService } from '@/services/gameAggregatorService';

/**
 * Handles the seamless integration callback from the game provider
 * This would typically be an API route handled by your backend
 * 
 * For frontend-only implementations, this is a placeholder that can be
 * used when setting up a proper backend endpoint
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
      console.error('Failed to parse request body:', error);
      // If JSON parsing fails, try to get raw text
      const text = await req.text();
      console.log('Raw request body:', text);
      throw new Error('Invalid JSON in request body');
    }
    
    console.log(`Received seamless callback for provider: ${provider}`, data);
    
    // Process the callback using the game aggregator service
    const result = await gameAggregatorService.processCallback(provider, data);
    
    // Return the result
    return new Response(JSON.stringify(result), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      status: 500
    });
  }
}

// Handle preflight OPTIONS requests for CORS
export async function handleOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
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
