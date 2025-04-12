
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
    'slots': '/casino/slots',
    'slot': '/casino/slots',
    'live': '/casino/live-casino',
    'live casino': '/casino/live-casino',
    'table': '/casino/table-games',
    'table games': '/casino/table-games',
    'jackpot': '/casino/jackpots',
    'jackpots': '/casino/jackpots',
    'sport': '/sports',
    'sports': '/sports',
    'football': '/sports/football',
    'soccer': '/sports/football',
    'tennis': '/sports/tennis',
    'basketball': '/sports/basketball',
    'hockey': '/sports/hockey',
    'esports': '/sports/esports',
    'bonus': '/bonuses',
    'bonuses': '/bonuses',
    'claim bonus': '/bonuses',
    'promotions': '/promotions',
    'promo': '/promotions',
    'vip': '/vip',
    'login': '/login',
    'sign in': '/login',
    'register': '/register',
    'sign up': '/register',
    'profile': '/profile',
    'account': '/profile',
    'deposit': '/transactions',
    'withdraw': '/transactions',
    'transactions': '/transactions',
    'support': '/support/contact',
    'help': '/support/help',
    'help center': '/support/help',
    'faq': '/support/faq',
    'contact': '/support/contact',
    'responsible gaming': '/support/responsible-gaming',
    'terms': '/legal/terms',
    'privacy': '/legal/privacy',
    'home': '/',
    'main': '/',
    'dashboard': '/',
    'play now': '/casino',
    'view all': '/casino',
    'claim now': '/bonuses',
    'all casino games': '/casino',
    'all sports': '/sports'
  };
  
  // Find the matching route or default to home
  for (const [key, route] of Object.entries(routeMap)) {
    if (name.includes(key)) {
      console.log(`Navigating to ${route} based on button name: ${name}`);
      navigate(route);
      return;
    }
  }
  
  // Default to home if no match
  console.log(`No route match found for button name: ${name}. Defaulting to home.`);
  navigate('/');
};

export default navigateByButtonName;
