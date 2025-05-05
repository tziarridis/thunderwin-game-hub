
/**
 * Utility functions for generating hashes in the browser environment
 */

/**
 * Generate a simple hash for use as a reference ID
 * @returns A string hash that can be used as a reference ID
 */
export const generateHash = (): string => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${random}`;
};

/**
 * Generate a secure random string that can be used for cryptographic purposes
 * @param length The length of the random string
 * @returns A secure random string
 */
export const generateSecureRandomString = (length: number = 32): string => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Simple MD5 hash implementation for browser environment
 * This is a simplified version suitable for non-cryptographic purposes
 * @param input The string to hash
 * @returns A string representation of the hash
 */
export const simpleMD5 = (input: string): string => {
  // This is a simple implementation for demo purposes
  // In a real production environment, you would use a proper crypto library
  let hash = 0;
  if (input.length === 0) return hash.toString(16);
  
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Convert to hex string and ensure it's 32 characters long
  const hexHash = Math.abs(hash).toString(16).padStart(8, '0');
  return hexHash.repeat(4).substring(0, 32);
};
