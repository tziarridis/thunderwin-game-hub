
// This is a browser-safe version of the database service
// It provides mock implementations that are safe to use in browser environments

// Create mock functions that match the signature of the database service
export const mockQuery = (data: any) => {
  console.log('Executing mock query with:', data);
  return Promise.resolve([]);
};

export const mockTransaction = (queries: { sql: string; params?: any[] }[]) => {
  console.log('Executing mock transaction with:', queries);
  return Promise.resolve(queries.map(() => ({})));
};

// Export these mock functions to be used in place of the real database functions
export const browserDb = {
  query: (sql: string, params: any[] = []) => {
    console.log('Mock browser DB query:', sql, params);
    
    // Return empty results wrapped in a Promise
    return Promise.resolve([]);
  },
  transaction: mockTransaction,
  getConnection: () => Promise.resolve({
    query: () => Promise.resolve([[]]),
    release: () => {},
    beginTransaction: () => Promise.resolve({}),
    commit: () => Promise.resolve({}),
    rollback: () => Promise.resolve({})
  }),
  connect: () => Promise.resolve(true),
  status: () => Promise.resolve({ connected: true, message: "Mock database connected" }),
  disconnect: () => true
};
