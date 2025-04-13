
// This is a browser-safe version of the database service
// It does not use mysql2 directly which causes issues in the browser

// Create mock functions that match the signature of the database service
export const mockQuery = (data: any) => {
  console.log('Executing mock query with:', data);
  return Promise.resolve(data);
};

export const mockTransaction = (queries: { sql: string; params?: any[] }[]) => {
  console.log('Executing mock transaction with:', queries);
  return Promise.resolve(queries.map(() => ({})));
};

// Export these mock functions to be used in place of the real database functions
export const browserDb = {
  query: mockQuery,
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
