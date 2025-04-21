
/**
 * Browser-safe database adapter
 * Simulates database operations in the browser environment
 */

// Mock in-memory database for browser environment
const inMemoryDb: Record<string, any[]> = {
  games: []
};

/**
 * Execute a query in the browser environment
 */
export async function query(sql: string, params: any[] = []): Promise<any[]> {
  console.log('Browser DB Query:', sql, params);
  
  // Extract the table name from the SQL query (very basic parsing)
  const tableMatch = sql.match(/FROM\s+(\w+)/i);
  const table = tableMatch ? tableMatch[1] : null;
  
  // Handle SELECT queries
  if (sql.toUpperCase().startsWith('SELECT')) {
    if (table && inMemoryDb[table]) {
      // Very basic filtering (this is just a simulation)
      let results = [...inMemoryDb[table]];
      
      // Handle WHERE clause (very simple implementation)
      const whereMatch = sql.match(/WHERE\s+(.*?)(\s+ORDER BY|\s+LIMIT|$)/i);
      if (whereMatch && params.length > 0) {
        const whereClause = whereMatch[1];
        // Extract field names from the WHERE clause
        const fieldMatches = whereClause.match(/(\w+)\s*=/g);
        
        if (fieldMatches) {
          const fields = fieldMatches.map(f => f.replace(/\s*=/, '').trim());
          
          // Filter results based on the WHERE clause
          results = results.filter(row => {
            for (let i = 0; i < fields.length; i++) {
              if (row[fields[i]] !== params[i]) {
                return false;
              }
            }
            return true;
          });
        }
      }
      
      // Handle LIMIT clause
      const limitMatch = sql.match(/LIMIT\s+(\d+)/i);
      if (limitMatch) {
        const limit = parseInt(limitMatch[1]);
        results = results.slice(0, limit);
      }
      
      return results;
    }
    return [];
  }
  
  // Handle INSERT queries
  if (sql.toUpperCase().startsWith('INSERT')) {
    const tableMatch = sql.match(/INTO\s+(\w+)/i);
    const table = tableMatch ? tableMatch[1] : null;
    
    if (table) {
      if (!inMemoryDb[table]) {
        inMemoryDb[table] = [];
      }
      
      // Extract field names from the INSERT statement
      const fieldsMatch = sql.match(/\(([^)]+)\)/);
      if (fieldsMatch) {
        const fields = fieldsMatch[1].split(',').map(f => f.trim());
        
        // Create a new object with the provided values
        const newRow: Record<string, any> = {};
        fields.forEach((field, index) => {
          if (index < params.length) {
            newRow[field] = params[index];
          }
        });
        
        // Add an ID if it doesn't have one
        if (!newRow.id) {
          newRow.id = inMemoryDb[table].length + 1;
        }
        
        // Add timestamps if they exist in the schema
        if (fields.includes('created_at') && !newRow.created_at) {
          newRow.created_at = new Date().toISOString();
        }
        if (fields.includes('updated_at') && !newRow.updated_at) {
          newRow.updated_at = new Date().toISOString();
        }
        
        inMemoryDb[table].push(newRow);
        
        // Return the inserted row with the new ID
        return [{ insertId: newRow.id, ...newRow }];
      }
    }
    return [{ insertId: Math.floor(Math.random() * 1000) }];
  }
  
  // Handle UPDATE queries
  if (sql.toUpperCase().startsWith('UPDATE')) {
    const tableMatch = sql.match(/UPDATE\s+(\w+)/i);
    const table = tableMatch ? tableMatch[1] : null;
    
    if (table && inMemoryDb[table]) {
      // Extract the WHERE clause
      const whereMatch = sql.match(/WHERE\s+(.*)/i);
      if (whereMatch) {
        const whereClause = whereMatch[1];
        const fieldMatch = whereClause.match(/(\w+)\s*=\s*\?/);
        
        if (fieldMatch && params.length > 0) {
          const field = fieldMatch[1];
          const value = params[params.length - 1]; // Last param is usually the WHERE value
          
          // Extract SET clause
          const setMatch = sql.match(/SET\s+(.*?)\s+WHERE/i);
          if (setMatch) {
            const setClause = setMatch[1];
            const setFields = setClause.split(',').map(f => {
              const [fieldName] = f.split('=').map(part => part.trim());
              return fieldName;
            });
            
            // Update matching rows
            let updatedCount = 0;
            inMemoryDb[table].forEach((row, index) => {
              if (row[field] === value) {
                // Update the row with new values
                setFields.forEach((fieldName, i) => {
                  if (i < params.length - 1) { // Exclude the WHERE parameter
                    row[fieldName] = params[i];
                  }
                });
                
                // Update the updated_at timestamp if it exists
                if (row.hasOwnProperty('updated_at')) {
                  row.updated_at = new Date().toISOString();
                }
                
                updatedCount++;
              }
            });
            
            return [{ affectedRows: updatedCount }];
          }
        }
      }
    }
    return [{ affectedRows: 0 }];
  }
  
  // Handle DELETE queries
  if (sql.toUpperCase().startsWith('DELETE')) {
    const tableMatch = sql.match(/FROM\s+(\w+)/i);
    const table = tableMatch ? tableMatch[1] : null;
    
    if (table && inMemoryDb[table]) {
      // Extract the WHERE clause
      const whereMatch = sql.match(/WHERE\s+(.*)/i);
      if (whereMatch) {
        const whereClause = whereMatch[1];
        const fieldMatch = whereClause.match(/(\w+)\s*=\s*\?/);
        
        if (fieldMatch && params.length > 0) {
          const field = fieldMatch[1];
          const value = params[0];
          
          // Count rows before deletion
          const initialCount = inMemoryDb[table].length;
          
          // Remove matching rows
          inMemoryDb[table] = inMemoryDb[table].filter(row => row[field] !== value);
          
          // Calculate affected rows
          const affectedRows = initialCount - inMemoryDb[table].length;
          
          return [{ affectedRows }];
        }
      }
    }
    return [{ affectedRows: 0 }];
  }
  
  // Default return for unsupported queries
  return [];
}

/**
 * Get all rows from a table
 */
export async function getAll(table: string): Promise<any[]> {
  return inMemoryDb[table] || [];
}

/**
 * Reset the in-memory database (for testing)
 */
export function resetDb(): void {
  for (const table in inMemoryDb) {
    inMemoryDb[table] = [];
  }
}

/**
 * Initialize the in-memory database with some data
 */
export function initializeDb(data: Record<string, any[]>): void {
  for (const table in data) {
    inMemoryDb[table] = [...data[table]];
  }
}

/**
 * Get the database schema
 */
export function getDbSchema(): Record<string, string[]> {
  const schema: Record<string, string[]> = {};
  
  for (const table in inMemoryDb) {
    if (inMemoryDb[table].length > 0) {
      schema[table] = Object.keys(inMemoryDb[table][0]);
    } else {
      schema[table] = [];
    }
  }
  
  return schema;
}

export default {
  query,
  getAll,
  resetDb,
  initializeDb,
  getDbSchema
};
