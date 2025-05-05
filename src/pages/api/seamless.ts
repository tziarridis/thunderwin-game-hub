
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
    // Parse the request body
    const data = await req.json();
    
    // Process the callback using the game aggregator service
    const result = await gameAggregatorService.processCallback(data);
    
    // Return the result
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
}

// Export the handler as default
export default handleSeamlessCallback;
