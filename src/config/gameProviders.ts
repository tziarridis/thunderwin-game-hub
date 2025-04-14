
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
      callbackUrl: "https://thunderwin.io/casino/gitslotpark-seamless",
      apiEndpoint: "apipg.slotgamesapi.com"
    }
  },
  // Pragmatic Play - BRL currency
  "ppbrl": {
    code: "PP",
    name: "Pragmatic Play",
    currency: "BRL",
    credentials: {
      agentId: "captaingambleBRL",
      apiToken: "6a72d79e7aab47d38b3d5cce9e0f33a0",
      secretKey: "51b22bb24f1a4d598324c76d9cf5e7b5",
      callbackUrl: "https://captaingamble/casino/seamless",
      apiEndpoint: "apipg.slotgamesapi.com"
    }
  },
  // PlayGo - EUR currency
  "pgeur": {
    code: "PG",
    name: "Play'n GO",
    currency: "EUR",
    credentials: {
      agentId: "captaingambleEUR",
      apiToken: "2e16cbc82b394b9ca2a1e0a54d5e5b11",
      secretKey: "ad7c45f04ce14bf783efcc20e22b6ca0",
      callbackUrl: "https://captaingamble/casino/seamless",
      apiEndpoint: "apigg.slotgamesapi.com"
    }
  },
  // PlayGo - BRL currency
  "pgbrl": {
    code: "PG",
    name: "Play'n GO",
    currency: "BRL",
    credentials: {
      agentId: "captaingambleBRL",
      apiToken: "3babff0022ca4f6296c81487d14c0fdb",
      secretKey: "4efb3a12e7f54d31a5c2dd7f1c6c5f80",
      callbackUrl: "https://captaingamble/casino/seamless",
      apiEndpoint: "apigg.slotgamesapi.com"
    }
  },
  // Amatic - EUR currency
  "ameur": {
    code: "AM",
    name: "Amatic",
    currency: "EUR",
    credentials: {
      agentId: "captaingambleEUR",
      apiToken: "77a06f2a86d94d5aa6b6654a7f3e1fbb",
      secretKey: "3c90d42fabb547dda2e5db6a0e17bc1e",
      callbackUrl: "https://captaingamble/casino/seamless",
      apiEndpoint: "api.amaticgame.net"
    }
  },
  // Amatic - BRL currency
  "ambrl": {
    code: "AM",
    name: "Amatic",
    currency: "BRL",
    credentials: {
      agentId: "captaingambleBRL",
      apiToken: "fbdb7c85cc9245f89fcb50f2ca2efc1c",
      secretKey: "1de0c876a67d4c37a90adf2ffecbbf0e",
      callbackUrl: "https://captaingamble/casino/seamless",
      apiEndpoint: "api.amaticgame.net"
    }
  },
  // GitSlotPark - EUR currency
  "gspeur": {
    code: "GSP",
    name: "GitSlotPark",
    currency: "EUR",
    credentials: {
      agentId: "Partner01",
      apiToken: "e5h2c84215935ebfc8371df59e679c773ea081f8edd273358c83ff9f16e024ce",
      secretKey: "1234567890",
      callbackUrl: "https://captaingamble/casino/seamless",
      apiEndpoint: "apiv2.gitslotpark.com"
    }
  },
  // GitSlotPark - BRL currency
  "gspbrl": {
    code: "GSP",
    name: "GitSlotPark",
    currency: "BRL",
    credentials: {
      agentId: "Partner01BRL",
      apiToken: "e5h2c84215935ebfc8371df59e679c773ea081f8edd273358c83ff9f16e024ce",
      secretKey: "1234567890",
      callbackUrl: "https://captaingamble/casino/seamless",
      apiEndpoint: "apiv2.gitslotpark.com"
    }
  }
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
