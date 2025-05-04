
import React from 'react';

const GamesAdmin = () => {
  const mockGames = [
    { id: 1, name: 'Slot Game 1', provider: 'Provider A', status: 'active' },
    { id: 2, name: 'Table Game 1', provider: 'Provider B', status: 'inactive' },
    { id: 3, name: 'Live Casino Game', provider: 'Provider C', status: 'active' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Games Administration</h1>
      
      <div className="flex justify-between items-center mb-4">
        <div>
          <input 
            type="text"
            placeholder="Search games..."
            className="px-4 py-2 border rounded-md"
          />
        </div>
        <button className="bg-green-500 text-white px-4 py-2 rounded-md">
          Add New Game
        </button>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left">ID</th>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Provider</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {mockGames.map((game) => (
              <tr key={game.id}>
                <td className="px-6 py-4">{game.id}</td>
                <td className="px-6 py-4">{game.name}</td>
                <td className="px-6 py-4">{game.provider}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    game.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {game.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-blue-500 mr-2">Edit</button>
                  <button className="text-red-500">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GamesAdmin;
