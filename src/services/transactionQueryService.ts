
// Fix the count property usage in the response
// Change:
// return { transactions: response.data, total: response.count };
// To:
return { transactions: response.data, total: response.total };

// And in another place:
// Change:
// return { transactions: [], total: 0 };
// To:
return { transactions: [], total: 0 };
