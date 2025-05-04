
import React from 'react';

const Transactions = () => {
  const mockTransactions = [
    { id: 1, type: 'deposit', amount: 100, date: '2025-05-01', status: 'completed' },
    { id: 2, type: 'withdrawal', amount: 50, date: '2025-05-02', status: 'pending' },
    { id: 3, type: 'deposit', amount: 200, date: '2025-05-03', status: 'completed' },
  ];

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Transactions</h1>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left">ID</th>
              <th className="px-6 py-3 text-left">Type</th>
              <th className="px-6 py-3 text-left">Amount</th>
              <th className="px-6 py-3 text-left">Date</th>
              <th className="px-6 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {mockTransactions.map((transaction) => (
              <tr key={transaction.id}>
                <td className="px-6 py-4">{transaction.id}</td>
                <td className="px-6 py-4 capitalize">{transaction.type}</td>
                <td className="px-6 py-4">${transaction.amount}</td>
                <td className="px-6 py-4">{transaction.date}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    transaction.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {transaction.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Transactions;
