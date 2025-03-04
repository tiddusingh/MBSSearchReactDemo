/**
 * Utility functions for the MBS Search application
 */

/**
 * Format a date string to Australian date format (DD/MM/YYYY)
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date string
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-AU');
};

/**
 * Create a file download from data
 * @param {Blob} blob - The blob to download
 * @param {string} filename - The filename
 */
export const downloadFile = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Convert data to CSV format
 * @param {Array} headers - CSV header row
 * @param {Array} data - Array of objects to convert
 * @param {Function} rowMapper - Function to map each object to a row array
 * @returns {string} - CSV content
 */
export const convertToCSV = (headers, data, rowMapper) => {
  const headerRow = headers.join(',');
  const rows = data.map(rowMapper);
  return [headerRow, ...rows].join('\n');
};

/**
 * Escape a string for CSV (handle quotes)
 * @param {string} str - String to escape
 * @returns {string} - Escaped string
 */
export const escapeCSV = (str) => {
  if (!str) return '';
  return `"${String(str).replace(/"/g, '""')}"`;
};

/**
 * Debounce a function call
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Get sort parameters for Azure Cognitive Search
 * @param {string} sortOption - Sort option string
 * @param {string} query - Search query
 * @returns {string} - Sort parameter for Azure Search
 */
export const getSortParams = (sortOption, query) => {
  if (sortOption !== 'relevance') {
    return sortOption;
  }
  
  // For non-empty queries, sort by search score by default
  if (query && query.trim() !== '') {
    return 'search.score() desc';
  }
  
  // For empty queries, sort by ItemNum by default
  return 'ItemNum asc';
};

/**
 * Create a custom event with progress information
 * @param {number} progress - Progress percentage (0-100)
 */
export const emitProgressEvent = (progress) => {
  window.dispatchEvent(
    new CustomEvent('export-progress', { 
      detail: { progress } 
    })
  );
};
