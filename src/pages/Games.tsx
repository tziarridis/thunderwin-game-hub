
import React from 'react';

const Games = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Games</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="h-48 bg-gray-200"></div>
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-2">Game 1</h2>
            <p className="text-gray-600">Game description goes here.</p>
            <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">Play Now</button>
          </div>
        </div>
        
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="h-48 bg-gray-200"></div>
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-2">Game 2</h2>
            <p className="text-gray-600">Game description goes here.</p>
            <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">Play Now</button>
          </div>
        </div>
        
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="h-48 bg-gray-200"></div>
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-2">Game 3</h2>
            <p className="text-gray-600">Game description goes here.</p>
            <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">Play Now</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Games;
