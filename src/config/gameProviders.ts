
/**
 * Game Provider Configuration
 * These are game provider API configurations
 */

export interface GameProviderConfig {
  code: string;
  name: string;
  currency: string;
  credentials: {
    agentId: string;
    apiToken: string;
    secretKey: string;
    callbackUrl: string;
    apiEndpoint: string;
  };
}

// Define the game provider configurations
// These are only accessible in server-side code or secure environments
export const gameProviderConfigs: Record<string, GameProviderConfig> = {
  // Pragmatic Play - EUR currency
  "ppeur": {
    code: "PP",
    name: "Pragmatic Play",
    currency: "EUR",
    credentials: {
      agentId: "captaingambleEUR",
      apiToken: "275c535c8c014b59bedb2a2d6fe7d37b", 
      secretKey: "bbd0551e144c46d19975f985e037c9b0",
      callbackUrl: "https://captaingamble/casino/seamless",
      apiEndpoint: "apipg.slotgamesapi.com"
    }
  },
  // Add other providers as needed
};

// This is a public list of available providers without sensitive credentials
// This can be safely exposed to the frontend
export const availableProviders = Object.entries(gameProviderConfigs).map(([key, config]) => ({
  id: key,
  code: config.code,
  name: config.name,
  currency: config.currency
}));

// Helper function to get provider config by key (server-side only)
export function getProviderConfig(providerKey: string): GameProviderConfig | undefined {
  return gameProviderConfigs[providerKey];
}
