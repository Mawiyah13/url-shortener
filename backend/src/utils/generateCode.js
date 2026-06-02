import crypto from 'crypto';

/**
 * Generates a random alphanumeric short code of specified length.
 * Uses a cryptographically strong random source for minimal collision probability.
 * @param {number} length 
 * @returns {string}
 */
export const generateShortCode = (length = 6) => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const charsLength = chars.length;
  let code = '';
  
  // Use crypto for higher randomness quality
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    code += chars.charAt(randomBytes[i] % charsLength);
  }
  
  return code;
};

export default generateShortCode;
