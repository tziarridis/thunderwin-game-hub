import { NavigateFunction } from "react-router-dom";

/**
 * Navigate to the appropriate page based on the button name or content
 * @param buttonName Name of the button or text content
 * @param navigate React Router navigate function
 */
export const navigateByButtonName = (buttonName: string, navigate: NavigateFunction): void => {
  const name = buttonName.toLowerCase().trim();
  
  // Map of keywords to routes
  const routeMap: Record<string, string> = {
    // Casino routes
    'slots': '/casino/slots',
    'slot': '/casino/slots',
    'live': '/casino/live-casino',
    'live casino': '/casino/live-casino',
    'table': '/casino/table-games',
    'table games': '/casino/table-games',
    'jackpot': '/casino/jackpots',
    'jackpots': '/casino/jackpots',
    'casino': '/casino',
    'casino games': '/casino',
    
    // Sports routes
    'sport': '/sports',
    'sports': '/sports',
    'football': '/sports/football',
    'soccer': '/sports/football',
    'tennis': '/sports/tennis',
    'basketball': '/sports/basketball',
    'hockey': '/sports/hockey',
    'esports': '/sports/esports',
    
    // Other main sections
    'bonus': '/bonuses',
    'bonuses': '/bonuses',
    'claim bonus': '/bonuses',
    'promotions': '/promotions',
    'promo': '/promotions',
    'promotion': '/promotions',
    'vip': '/vip',
    'vip club': '/vip',
    
    // Authentication
    'login': '/auth/login',
    'sign in': '/auth/login',
    'register': '/auth/register',
    'sign up': '/auth/register',
    'join now': '/auth/register',
    
    // User account
    'profile': '/profile',
    'account': '/profile',
    'deposit': '/transactions',
    'withdraw': '/transactions',
    'transactions': '/transactions',
    
    // Support
    'support': '/support/help',
    'help': '/support/help',
    'help center': '/support/help',
    'faq': '/support/faq',
    'faqs': '/support/faq',
    'frequently asked questions': '/support/faq',
    'contact': '/support/contact',
    'contact us': '/support/contact',
    'responsible gaming': '/support/responsible-gaming',
    
    // Legal
    'terms': '/legal/terms',
    'terms & conditions': '/legal/terms',
    'privacy': '/legal/privacy',
    'privacy policy': '/legal/privacy',
    
    // Home and general
    'home': '/',
    'main': '/',
    'dashboard': '/',
    'play now': '/casino',
    'view all': '/casino',
    'claim now': '/bonuses',
    'all casino games': '/casino',
    'all sports': '/sports',
    
    // Specific sports
    'bet on football': '/sports/football',
    'bet on basketball': '/sports/basketball',
    'bet on tennis': '/sports/tennis',
    'bet on hockey': '/sports/hockey',
    'bet on esports': '/sports/esports',
    'football betting': '/sports/football',
    'basketball betting': '/sports/basketball',
    'tennis betting': '/sports/tennis',
    'hockey betting': '/sports/hockey',
    'esports betting': '/sports/esports',
    
    // Other specific pages 
    'new games': '/casino/new-games',
    'favorite games': '/casino/favorites',
    'favorites': '/casino/favorites',
    'providers': '/casino/providers',
    'crash games': '/casino/crash',
    'crash': '/casino/crash',
    'settings': '/settings',
    'admin': '/admin',
    'admin dashboard': '/admin',
    'admin login': '/admin/login',
  };
  
  // First check for exact matches
  if (routeMap[name]) {
    console.log(`Exact match: Navigating to ${routeMap[name]} based on button name: ${name}`);
    navigate(routeMap[name]);
    return;
  }
  
  // Try partial matching if no exact match
  for (const [key, route] of Object.entries(routeMap)) {
    if (name.includes(key)) {
      console.log(`Partial match: Navigating to ${route} based on button name: ${name} (matched with ${key})`);
      navigate(route);
      return;
    }
  }
  
  // Default to home if no match
  console.log(`No route match found for button name: ${name}. Defaulting to home.`);
  navigate('/');
};

export default navigateByButtonName;
