
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
    'live': '/casino/live',
    'live casino': '/casino/live',
    'table': '/casino/table',
    'table games': '/casino/table',
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
    'promotions': '/promotions',
    'promo': '/promotions',
    'vip': '/vip',
    'login': '/login',
    'sign in': '/login',
    'register': '/register',
    'sign up': '/register',
    'profile': '/user/profile',
    'account': '/user/profile',
    'deposit': '/user/deposit',
    'withdraw': '/user/withdraw',
    'transactions': '/user/transactions',
    'support': '/support',
    'help': '/support/help',
    'faq': '/support/faq',
    'contact': '/support/contact',
    'responsible gaming': '/support/responsible-gaming',
    'terms': '/legal/terms',
    'privacy': '/legal/privacy',
    'home': '/',
    'main': '/',
    'dashboard': '/'
  };
  
  // Find the matching route or default to home
  for (const [key, route] of Object.entries(routeMap)) {
    if (name.includes(key)) {
      navigate(route);
      return;
    }
  }
  
  // Default to home if no match
  navigate('/');
};

export default navigateByButtonName;
