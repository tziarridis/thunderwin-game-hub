
/**
 * Track an event in the analytics system
 * @param eventName The name of the event to track
 * @param properties Optional properties to include with the event
 */
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  // For now, just log the event to the console
  console.log(`[ANALYTICS] ${eventName}`, properties || {});
  
  // In a production system, you would send this to your analytics provider
  // Example:
  // if (window.gtag) {
  //   window.gtag('event', eventName, properties);
  // }
};

/**
 * Increment view count for a game
 * @param gameName The name of the game to increment views for
 */
export const incrementViews = async (gameName: string) => {
  trackEvent('game_viewed', { gameName });
  
  // You can also add server-side logic to increment views in the database
  // For now, we'll just log the event
  console.log(`[ANALYTICS] Incrementing views for game: ${gameName}`);
};

/**
 * Initialize analytics tracking
 */
export const initAnalytics = () => {
  console.log('[ANALYTICS] Initialized');
  
  // Track page views
  trackEvent('page_view', {
    page: window.location.pathname
  });
};

export default {
  trackEvent,
  incrementViews,
  initAnalytics
};
