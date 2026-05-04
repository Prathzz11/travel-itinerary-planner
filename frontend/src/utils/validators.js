/**
 * Validates an email address.
 * @param {string} email
 * @returns {boolean}
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  // RFC 5322 standard-compliant regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
};

/**
 * Validates a password for strong complexity.
 * Minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 number, and 1 special character.
 * @param {string} pwd
 * @returns {boolean}
 */
export const validatePassword = (pwd) => {
  if (!pwd || typeof pwd !== 'string') return false;
  // Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(pwd);
};

/**
 * Validates a user's name (alphabetic, spaces, hyphens).
 * @param {string} name
 * @returns {boolean}
 */
export const validateName = (name) => {
  if (!name || typeof name !== 'string') return false;
  // Allow letters, spaces, hyphens, and apostrophes. Length 2-50.
  const nameRegex = /^[a-zA-Z\s\-']{2,50}$/;
  return nameRegex.test(name.trim());
};

/**
 * Validates generic form fields (not empty).
 * @param {string} value
 * @returns {boolean}
 */
export const validateRequired = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
};