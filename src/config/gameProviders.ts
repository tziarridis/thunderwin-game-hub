
export const availableProviders = [
  { id: 'pp', name: 'Pragmatic Play', code: 'PP', currency: 'EUR' },
  { id: 'eg', name: 'Evolution Gaming', code: 'EG', currency: 'EUR' },
  { id: 'ng', name: 'NetEnt', code: 'NG', currency: 'EUR' },
  { id: 'mg', name: 'Microgaming', code: 'MG', currency: 'EUR' },
  { id: 'pn', name: 'Playtech', code: 'PN', currency: 'EUR' },
  { id: 'bt', name: 'Betsoft', code: 'BT', currency: 'EUR' },
  { id: 'rt', name: 'Red Tiger', code: 'RT', currency: 'EUR' },
  { id: 'yg', name: 'Yggdrasil', code: 'YG', currency: 'EUR' }
];

export const getProviderById = (id: string) => {
  return availableProviders.find(provider => provider.id === id);
};

export const getProviderByName = (name: string) => {
  return availableProviders.find(provider => provider.name.toLowerCase() === name.toLowerCase());
};

export const getProviderConfig = (providerId: string) => {
  const provider = getProviderById(providerId);
  if (!provider) return null;

  const configs = {
    pp: {
      agentId: 'captaingambleEUR',
      apiToken: '275c535c8c014b59bedb2a2d6fe7d37b',
      secretKey: 'bbd0551e144c46d19975f985e037c9b0',
      callbackUrl: 'https://your-domain/casino/seamless',
      apiEndpoint: 'apipg.slotgamesapi.com',
      currency: 'EUR'
    },
    // Add more provider configs as needed
  };

  return configs[providerId] || null;
};
