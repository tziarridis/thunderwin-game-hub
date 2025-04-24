
/**
 * Simple browser-safe hash function implementation
 * Note: This is NOT cryptographically secure and should only be used for demo purposes
 * In production, use a proper cryptographic library that works in browsers
 */
export const generateSimpleHash = (input: string): string => {
  let hash = 0;
  
  if (input.length === 0) {
    return hash.toString(16);
  }
  
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return Math.abs(hash).toString(16);
};

/**
 * Simple MD5-like hash function for browser
 * This is a simplified version and NOT a real MD5 implementation
 * For production use a proper crypto library that works in browsers
 */
export const simpleMD5 = (input: string): string => {
  // For demonstration purposes only
  return generateSimpleHash(input + "salt");
};
