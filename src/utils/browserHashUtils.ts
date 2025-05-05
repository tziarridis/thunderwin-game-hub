
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
