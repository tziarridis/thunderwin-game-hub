import React from 'react';
import { Button } from '@/components/ui/button';

const Games = () => {
  // Inside your component:
  const mockProviders = [
    { id: "1", name: "Pragmatic Play", slug: "pragmatic" },
    { id: "2", name: "Evolution Gaming", slug: "evolution" },
    { id: "3", name: "NetEnt", slug: "netent" }
  ];

  const mockCategories = [
    { id: "1", name: "Slots", slug: "slots" },
    { id: "2", name: "Table Games", slug: "table-games" },
    { id: "3", name: "Live Casino", slug: "live-casino" }
  ];

  return (
    <div>
      <h1>Games Overview</h1>
      <p>List of games and providers will be displayed here.</p>
      {/* Display providers and categories */}
      <div>
        <h2>Providers</h2>
        <ul>
          {mockProviders.map(provider => (
            <li key={provider.id}>{provider.name}</li>
          ))}
        </ul>
      </div>
      <div>
        <h2>Categories</h2>
        <ul>
          {mockCategories.map(category => (
            <li key={category.id}>{category.name}</li>
          ))}
        </ul>
      </div>
      <Button>Add Game</Button>
    </div>
  );
};

export default Games;
