import DOMPurify from 'dompurify';

/**
 * Sanitizes an HTML string to prevent XSS attacks.
 * Uses DOMPurify under the hood.
 * 
 * @param {string} dirtyHtml - The unsanitized HTML/Text string
 * @param {Object} [options] - Optional DOMPurify configuration
 * @returns {string} The sanitized string safe for rendering
 */
export const sanitizeHtml = (dirtyHtml, options = {}) => {
  if (typeof dirtyHtml !== 'string') {
    return '';
  }

  // Default config allows safe HTML but strips dangerous tags like <script>, <object>, etc.
  const defaultConfig = {
    ALLOWED_TAGS: [
      'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'span', 'div'
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style'],
    // Ensure all links open securely
    ADD_ATTR: ['target="_blank"', 'rel="noopener noreferrer"']
  };

  const finalConfig = { ...defaultConfig, ...options };

  return DOMPurify.sanitize(dirtyHtml, finalConfig);
};

/**
 * Sanitizes a plain text input to remove any HTML entirely.
 * Useful for inputs that should strictly be text (names, titles).
 * 
 * @param {string} dirtyText - The unsanitized string
 * @returns {string} Text with all HTML tags stripped
 */
export const sanitizeText = (dirtyText) => {
  if (typeof dirtyText !== 'string') {
    return '';
  }
  
  // Strips all HTML tags
  return DOMPurify.sanitize(dirtyText, { ALLOWED_TAGS: [] });
};
