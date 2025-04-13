
export const availableProviders = [
  { id: 'pp', name: 'Pragmatic Play' },
  { id: 'eg', name: 'Evolution Gaming' },
  { id: 'ng', name: 'NetEnt' },
  { id: 'mg', name: 'Microgaming' },
  { id: 'pn', name: 'Playtech' },
  { id: 'bt', name: 'Betsoft' },
  { id: 'rt', name: 'Red Tiger' },
  { id: 'yg', name: 'Yggdrasil' }
];

export const getProviderById = (id: string) => {
  return availableProviders.find(provider => provider.id === id);
};

export const getProviderByName = (name: string) => {
  return availableProviders.find(provider => provider.name.toLowerCase() === name.toLowerCase());
};
