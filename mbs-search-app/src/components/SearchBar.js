import React, { useState } from 'react';
import './SearchBar.css';

export const SearchBar = ({ onSearch, loading, searchTerm, setSearchTerm, fuzzyEnabled, setFuzzyEnabled }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch();
  };

  const handleChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleKeyDown = (e) => {
    // Submit on Enter key
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    // Focus back on the search input after clearing
    document.getElementById('search-input').focus();
  };

  const toggleAdvanced = () => {
    setShowAdvanced(!showAdvanced);
  };

  const toggleFuzzy = () => {
    setFuzzyEnabled(!fuzzyEnabled);
  };

  return (
    <div className="search-bar-container">
      <form onSubmit={handleSubmit} className="search-form" role="search">
        <div className="search-input-wrapper">
          <label htmlFor="search-input" className="visually-hidden">
            Search MBS items
          </label>
          <input
            id="search-input"
            type="search"
            className="search-input"
            placeholder="Search for MBS items, descriptions, or keywords..."
            value={searchTerm}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            aria-label="Search for Medicare Benefits Schedule items"
            autoComplete="off"
            autoFocus
          />
          {searchTerm && (
            <button 
              type="button" 
              className="clear-button" 
              onClick={handleClear}
              aria-label="Clear search"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>
        <button 
          type="submit" 
          className="search-button" 
          disabled={loading}
          aria-label="Search"
        >
          {loading ? (
            <div className="spinner" role="status" aria-label="Loading">
              <div className="spinner-inner"></div>
            </div>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
          <span className="search-button-text">Search</span>
        </button>
        <button 
          type="button"
          className={`advanced-toggle ${showAdvanced ? 'active' : ''}`}
          onClick={toggleAdvanced}
          aria-expanded={showAdvanced}
          aria-controls="advanced-options"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M12 3v18M3 12h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Advanced</span>
        </button>
      </form>
      
      {showAdvanced && (
        <div id="advanced-options" className="advanced-search-options">
          <div className="option-row">
            <label className="option-label">
              <input 
                type="checkbox" 
                checked={fuzzyEnabled} 
                onChange={toggleFuzzy}
                className="option-checkbox"
              />
              <span className="option-text">Enable fuzzy search</span>
              <span className="option-tooltip" title="Helps find results even with misspelled terms">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </span>
            </label>
          </div>
        </div>
      )}
      
      <div className="search-tips">
        <p>
          <strong>Search tips:</strong> Use specific terms like "consultation" or "procedure" for better results. 
          You can search by item number, description, or keywords.
          {fuzzyEnabled && <span className="fuzzy-enabled-tag"> Fuzzy search is enabled</span>}
        </p>
      </div>
    </div>
  );
};
