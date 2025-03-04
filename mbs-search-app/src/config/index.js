/**
 * Application Configuration
 * 
 * This file centralizes all configuration settings for the application.
 * Environment variables are accessed here and exported with defaults.
 */

// Azure Cognitive Search configuration
export const SEARCH_CONFIG = {
  API_ENDPOINT: process.env.REACT_APP_AZURE_SEARCH_SERVICE || 'https://testopenaiservice102.search.windows.net',
  API_KEY: process.env.REACT_APP_AZURE_SEARCH_API_KEY || 'cEbz7StL7nXVJ2wx6VNO9fXzw1m9hbhtdgTwkBFY90AzSeAQGwJ2',
  INDEX_NAME: process.env.REACT_APP_AZURE_SEARCH_INDEX_NAME || 'azuresql-index-v2',
  API_VERSION: '2021-04-30-Preview'
};

// Search configuration
export const SEARCH_SETTINGS = {
  PAGE_SIZE: 10,
  MAX_BATCH_SIZE: 1000,
  DEFAULT_SORT: 'ItemStartDate desc',
  SEARCH_FIELDS: ['Description','HumanReadableDescription','ItemNumAlias','CategoryDescription','GroupDescription'],
  SELECT_FIELDS: [
    'MBSItemId', 'ItemNum', 'ItemNumAlias', 'Description', 'HumanReadableDescription',
    'Category', 'CategoryDescription', 'Group', 'GroupDescription', 'ItemType',
    'ItemStartDate', 'ItemEndDate', 'ScheduleFee', 'NewItem', 'FeeType'
  ],
  FACET_FIELDS: ['CategoryDescription', 'GroupDescription'],
  HIGHLIGHT_SETTINGS: {
    FIELDS: ['Description'],
    PRE_TAG: '<mark>',
    POST_TAG: '</mark>'
  }
};

// Export configuration
export const EXPORT_CONFIG = {
  FORMATS: {
    CSV: 'csv',
    JSON: 'json'
  },
  FILENAME_PREFIX: 'mbs-search-results',
  CSV_HEADERS: [
    'Item Number', 
    'Description', 
    'Schedule Fee', 
    'Category', 
    'Group', 
    'Item Type', 
    'Start Date'
  ],
  JSON_FIELDS: {
    ItemNum: 'ItemNumber',
    Description: 'Description',
    ScheduleFee: 'ScheduleFee',
    CategoryDescription: 'Category',
    GroupDescription: 'Group',
    ItemType: 'ItemType',
    ItemStartDate: 'StartDate'
  }
};

// UI configuration
export const UI_CONFIG = {
  TOAST_DURATION: 5000, // milliseconds
  PROGRESS_ANIMATION_DURATION: 1000, // milliseconds
  ANIMATION_TIMING: {
    FAST: '0.2s ease',
    MEDIUM: '0.3s ease',
    SLOW: '0.5s ease'
  }
};
