// File structure for our React Azure Search application

// src/App.js
import React, { useState, useEffect } from 'react';
import { SearchBar } from './components/SearchBar';
import { SearchResults } from './components/SearchResults';
import { FacetFilters } from './components/FacetFilters';
import { DetailPanel } from './components/DetailPanel';
import { searchService } from './services/searchService';
import './App.css';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [facets, setFacets] = useState({});
  const [selectedFilters, setSelectedFilters] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const resultsPerPage = 10;

  useEffect(() => {
    // Initial search with empty query to load all results
    handleSearch('*', 1);
  }, []);

  const handleSearch = async (query, page = 1, newFilters = null) => {
    setIsLoading(true);
    const filtersToUse = newFilters || selectedFilters;
    
    try {
      const response = await searchService.search(
        query || '*', 
        page, 
        resultsPerPage, 
        filtersToUse,
        sortBy
      );
      
      setResults(response.results);
      setFacets(response.facets);
      setTotalResults(response.count);
      setCurrentPage(page);
      setIsLoading(false);
    } catch (error) {
      console.error('Search error:', error);
      setIsLoading(false);
    }
  };

  const handleQueryChange = (newQuery) => {
    setSearchQuery(newQuery);
    setSelectedItem(null);
    handleSearch(newQuery, 1);
  };

  const handleFilterChange = (facetName, facetValue, isChecked) => {
    const newFilters = { ...selectedFilters };
    
    if (!newFilters[facetName]) {
      newFilters[facetName] = [];
    }
    
    if (isChecked) {
      newFilters[facetName] = [...newFilters[facetName], facetValue];
    } else {
      newFilters[facetName] = newFilters[facetName].filter(value => value !== facetValue);
      if (newFilters[facetName].length === 0) {
        delete newFilters[facetName];
      }
    }
    
    setSelectedFilters(newFilters);
    handleSearch(searchQuery, 1, newFilters);
  };

  const handleSortChange = (sortField) => {
    setSortBy(sortField);
    handleSearch(searchQuery, 1, selectedFilters);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= Math.ceil(totalResults / resultsPerPage)) {
      setCurrentPage(page);
      handleSearch(searchQuery, page);
    }
  };

  const handleItemSelect = (item) => {
    setSelectedItem(item);
    // On mobile, close sidebar when item is selected
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const clearFilters = () => {
    setSelectedFilters({});
    handleSearch(searchQuery, 1, {});
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo">
          <h1>MBS Search</h1>
          <button className="mobile-menu-btn" onClick={toggleSidebar}>
            {isSidebarOpen ? '✕' : '☰'}
          </button>
        </div>
        <SearchBar 
          query={searchQuery} 
          onQueryChange={handleQueryChange} 
          isLoading={isLoading}
        />
      </header>
      
      <div className="main-content">
        <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
          <div className="filters-header">
            <h2>Filters</h2>
            {Object.keys(selectedFilters).length > 0 && (
              <button onClick={clearFilters} className="clear-filters-btn">
                Clear all
              </button>
            )}
          </div>
          <FacetFilters 
            facets={facets} 
            selectedFilters={selectedFilters} 
            onFilterChange={handleFilterChange} 
          />
        </aside>
        
        <main className="content">
          <div className="results-header">
            <div className="results-count">
              {totalResults > 0 ? (
                <span>{totalResults} results found</span>
              ) : (
                <span>No results found</span>
              )}
            </div>
            <div className="sort-options">
              <label htmlFor="sort-select">Sort by:</label>
              <select 
                id="sort-select" 
                value={sortBy} 
                onChange={(e) => handleSortChange(e.target.value)}
              >
                <option value="">Relevance</option>
                <option value="ItemNum asc">Item Number (asc)</option>
                <option value="ItemNum desc">Item Number (desc)</option>
                <option value="ScheduleFee asc">Fee (low to high)</option>
                <option value="ScheduleFee desc">Fee (high to low)</option>
                <option value="ItemStartDate desc">Start Date (newest first)</option>
                <option value="ItemStartDate asc">Start Date (oldest first)</option>
              </select>
            </div>
          </div>
          
          <div className="search-results-container">
            <SearchResults 
              results={results} 
              selectedItem={selectedItem}
              onItemSelect={handleItemSelect}
              isLoading={isLoading}
            />
            
            {totalResults > resultsPerPage && (
              <div className="pagination">
                <button 
                  disabled={currentPage === 1} 
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Previous
                </button>
                <span className="page-info">
                  Page {currentPage} of {Math.ceil(totalResults / resultsPerPage)}
                </span>
                <button 
                  disabled={currentPage >= Math.ceil(totalResults / resultsPerPage)} 
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </main>
        
        {selectedItem && (
          <DetailPanel item={selectedItem} onClose={() => setSelectedItem(null)} />
        )}
      </div>
      
      <footer className="app-footer">
        <p>© 2025 MBS Search App</p>
      </footer>
    </div>
  );
}

export default App;

// src/components/SearchBar.js
import React, { useState } from 'react';
import './SearchBar.css';

export const SearchBar = ({ query, onQueryChange, isLoading }) => {
  const [inputValue, setInputValue] = useState(query);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onQueryChange(inputValue);
  };
  
  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Search MBS items..."
        className="search-input"
      />
      <button type="submit" className="search-button" disabled={isLoading}>
        {isLoading ? (
          <span className="loader"></span>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.5 6.5 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
        )}
      </button>
    </form>
  );
};

// src/components/SearchResults.js
import React from 'react';
import './SearchResults.css';

export const SearchResults = ({ results, selectedItem, onItemSelect, isLoading }) => {
  if (isLoading) {
    return (
      <div className="search-results loading">
        <div className="loading-spinner"></div>
        <p>Loading results...</p>
      </div>
    );
  }
  
  if (results.length === 0) {
    return (
      <div className="search-results empty">
        <p>No results found. Try adjusting your search terms or filters.</p>
      </div>
    );
  }
  
  return (
    <div className="search-results">
      {results.map((item) => (
        <div 
          key={item.MBSItemId}
          className={`result-item ${selectedItem && selectedItem.MBSItemId === item.MBSItemId ? 'selected' : ''}`}
          onClick={() => onItemSelect(item)}
        >
          <div className="result-header">
            <span className="item-id">{item.ItemNumAlias || item.ItemNum}</span>
            <span className="item-category">{item.CategoryDescription}</span>
          </div>
          
          <h3 className="item-description">
            {item.HumanReadableDescription || item.Description}
          </h3>
          
          <div className="result-meta">
            <div className="meta-item">
              <span className="meta-label">Fee:</span>
              <span className="meta-value">${item.ScheduleFee ? item.ScheduleFee.toFixed(2) : 'N/A'}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Type:</span>
              <span className="meta-value">{item.ItemType || 'N/A'}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Group:</span>
              <span className="meta-value">{item.GroupDescription || item.Group || 'N/A'}</span>
            </div>
          </div>
          
          {item.NewItem === 'Y' && (
            <span className="result-tag new">New</span>
          )}
          {item.ItemChange === 'Y' && (
            <span className="result-tag changed">Changed</span>
          )}
        </div>
      ))}
    </div>
  );
};

// src/components/FacetFilters.js
import React, { useState } from 'react';
import './FacetFilters.css';

export const FacetFilters = ({ facets, selectedFilters, onFilterChange }) => {
  const [expandedSections, setExpandedSections] = useState({
    CategoryDescription: true,
    GroupDescription: true,
    ItemType: true,
    FeeType: true,
    ProviderType: true,
  });
  
  const toggleSection = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    });
  };
  
  if (!facets || Object.keys(facets).length === 0) {
    return <div className="facet-filters empty">Loading filters...</div>;
  }
  
  // Map of facet fields to their display names
  const facetDisplayNames = {
    CategoryDescription: 'Category',
    GroupDescription: 'Group', 
    ItemType: 'Item Type',
    FeeType: 'Fee Type',
    ProviderType: 'Provider Type',
    BenefitType: 'Benefit Type',
    FeeTypeName: 'Fee Type Name',
    ItemTypeDesciption: 'Item Type Description',
    NewItem: 'New Items',
    ItemChange: 'Changed Items',
    FeeChange: 'Fee Changes',
  };
  
  return (
    <div className="facet-filters">
      {Object.entries(facets).map(([facetName, facetValues]) => {
        // Skip facets with no values or non-filterable facets
        if (!facetValues || facetValues.length === 0) return null;
        
        const displayName = facetDisplayNames[facetName] || facetName;
        const isExpanded = expandedSections[facetName] !== false;
        
        return (
          <div key={facetName} className="facet-section">
            <div 
              className="facet-header" 
              onClick={() => toggleSection(facetName)}
            >
              <h3>{displayName}</h3>
              <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
                {isExpanded ? '−' : '+'}
              </span>
            </div>
            
            {isExpanded && (
              <div className="facet-values">
                {facetValues.map((facet) => {
                  const isSelected = selectedFilters[facetName]?.includes(facet.value);
                  
                  // Handle special cases for boolean facets
                  let displayValue = facet.value;
                  if (facetName === 'NewItem' || facetName === 'ItemChange' || facetName === 'FeeChange') {
                    displayValue = facet.value === 'Y' ? 'Yes' : 'No';
                  }
                  
                  return (
                    <div key={facet.value} className="facet-value">
                      <label className="facet-checkbox">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => onFilterChange(facetName, facet.value, e.target.checked)}
                        />
                        <span className="checkbox-custom"></span>
                        <span className="facet-label">
                          {displayValue} 
                          <span className="facet-count">({facet.count})</span>
                        </span>
                      </label>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// src/components/DetailPanel.js
import React from 'react';
import './DetailPanel.css';

export const DetailPanel = ({ item, onClose }) => {
  if (!item) return null;
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    // Handle both date string formats and Date objects
    let date;
    if (typeof dateString === 'string') {
      if (dateString === 'null' || dateString === '') return 'N/A';
      date = new Date(dateString);
    } else {
      date = new Date(dateString);
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) return dateString;
    
    return date.toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Group detail sections
  const generalInfo = [
    { label: 'Item Number', value: item.ItemNum },
    { label: 'Item Alias', value: item.ItemNumAlias || 'N/A' },
    { label: 'Category', value: item.CategoryDescription || 'N/A' },
    { label: 'Group', value: item.GroupDescription || item.Group || 'N/A' },
    { label: 'Item Type', value: item.ItemTypeDesciption || item.ItemType || 'N/A' },
    { label: 'Start Date', value: formatDate(item.ItemStartDate) },
    { label: 'End Date', value: formatDate(item.ItemEndDate) },
    { label: 'New Item', value: item.NewItem === 'Y' ? 'Yes' : 'No' },
    { label: 'Item Change', value: item.ItemChange === 'Y' ? 'Yes' : 'No' },
  ];
  
  const feeInfo = [
    { label: 'Fee Type', value: item.FeeTypeName || item.FeeType || 'N/A' },
    { label: 'Schedule Fee', value: item.ScheduleFee !== null ? `$${item.ScheduleFee.toFixed(2)}` : 'N/A' },
    { label: 'Fee Start Date', value: formatDate(item.FeeStartDate) },
    { label: 'Derived Fee', value: item.DerivedFee || 'N/A' },
    { label: 'Fee Change', value: item.FeeChange === 'Y' ? 'Yes' : 'No' },
  ];
  
  const benefitInfo = [
    { label: 'Benefit Type', value: item.BenefitType || 'N/A' },
    { label: 'Benefit Start Date', value: formatDate(item.BenefitStartDate) },
    { label: 'Benefit 75%', value: item.Benefit75 !== null ? `$${item.Benefit75.toFixed(2)}` : 'N/A' },
    { label: 'Benefit 85%', value: item.Benefit85 !== null ? `$${item.Benefit85.toFixed(2)}` : 'N/A' },
    { label: 'Benefit 100%', value: item.Benefit100 !== null ? `$${item.Benefit100.toFixed(2)}` : 'N/A' },
  ];
  
  const emsnInfo = [
    { label: 'EMSN Cap', value: item.EMSNCap || 'N/A' },
    { label: 'EMSN Start Date', value: formatDate(item.EMSNStartDate) },
    { label: 'EMSN End Date', value: formatDate(item.EMSNEndDate) },
    { label: 'EMSN Fixed Cap Amount', value: item.EMSNFixedCapAmount || 'N/A' },
    { label: 'EMSN Maximum Cap', value: item.EMSNMaximumCap !== null ? `$${item.EMSNMaximumCap.toFixed(2)}` : 'N/A' },
    { label: 'EMSN Percentage Cap', value: item.EMSNPercentageCap !== null ? `${item.EMSNPercentageCap}%` : 'N/A' },
    { label: 'EMSN Description', value: item.EMSNDescription || 'N/A' },
    { label: 'EMSN Change', value: item.EMSNChange === 'Y' ? 'Yes' : 'No' },
  ];
  
  return (
    <div className="detail-panel">
      <div className="detail-header">
        <h2>{item.HumanReadableDescription || item.Description || `Item ${item.ItemNum}`}</h2>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      
      <div className="detail-content">
        <div className="detail-section">
          <h3>General Information</h3>
          <div className="detail-grid">
            {generalInfo.map((info, index) => (
              <div key={index} className="detail-item">
                <span className="detail-label">{info.label}:</span>
                <span className="detail-value">{info.value}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="detail-section">
          <h3>Fee Information</h3>
          <div className="detail-grid">
            {feeInfo.map((info, index) => (
              <div key={index} className="detail-item">
                <span className="detail-label">{info.label}:</span>
                <span className="detail-value">{info.value}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="detail-section">
          <h3>Benefit Information</h3>
          <div className="detail-grid">
            {benefitInfo.map((info, index) => (
              <div key={index} className="detail-item">
                <span className="detail-label">{info.label}:</span>
                <span className="detail-value">{info.value}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="detail-section">
          <h3>EMSN Information</h3>
          <div className="detail-grid">
            {emsnInfo.map((info, index) => (
              <div key={index} className="detail-item">
                <span className="detail-label">{info.label}:</span>
                <span className="detail-value">{info.value}</span>
              </div>
            ))}
          </div>
        </div>
        
        {item.Description && (
          <div className="detail-section">
            <h3>Full Description</h3>
            <div className="full-description">
              {item.Description}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// src/services/searchService.js
const AZURE_SEARCH_ENDPOINT = 'https://testopenaiservice102.search.windows.net';
const AZURE_SEARCH_API_KEY = 'cEbz7StL7nXVJ2wx6VNO9fXzw1m9hbhtdgTwkBFY90AzSeAQGwJ2';
const AZURE_SEARCH_INDEX = 'azuresql-index-v2';

const buildFilterString = (filters) => {
  if (!filters || Object.keys(filters).length === 0) {
    return '';
  }
  
  const filterParts = [];
  
  Object.entries(filters).forEach(([field, values]) => {
    if (values && values.length > 0) {
      const fieldFilters = values.map(value => {
        // Check if the field is a string type and needs quotes
        if (['Category', 'SubGroup', 'SubHeading', 'ScheduleId', 'ItemNum'].includes(field)) {
          return `${field} eq ${value}`;
        } else {
          return `${field} eq '${value}'`;
        }
      });
      
      if (fieldFilters.length === 1) {
        filterParts.push(fieldFilters[0]);
      } else {
        filterParts.push(`(${fieldFilters.join(' or ')})`);
      }
    }
  });
  
  return filterParts.join(' and ');
};

const getFacetableFields = () => {
  return [
    'CategoryDescription',
    'GroupDescription',
    'ItemType',
    'ItemTypeDesciption',
    'ProviderType',
    'FeeType',
    'FeeTypeName',
    'BenefitType',
    'NewItem',
    'ItemChange',
    'FeeChange'
  ];
};

export const searchService = {
  search: async (query, page = 1, pageSize = 10, filters = {}, sortBy = '') => {
    const skip = (page - 1) * pageSize;
    const filterString = buildFilterString(filters);
    const facetString = getFacetableFields().join(',');
    
    // Build request parameters
    const params = new URLSearchParams({
      'api-version': '2020-06-30',
      'search': query,
      'searchFields': 'Description,HumanReadableDescription,ItemNumAlias,CategoryDescription,GroupDescription',
      'searchMode': 'all',
      'queryType': 'semantic',
      'semanticConfiguration': 'SematicConfig1',
      'count': 'true',
      'facets': facetString,
      '$skip': skip.toString(),
      '$top': pageSize.toString(),
      '$select': '*'
    });
    
    // Add filter if present
    if (filterString) {
      params.append('$filter', filterString);
    }
    
    // Add orderby if present
    if (sortBy) {
      params.append('$orderby', sortBy);
    }
    
    try {
      const response = await fetch(`${AZURE_SEARCH_ENDPOINT}/indexes/${AZURE_SEARCH_INDEX}/docs/search?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'api-key': AZURE_SEARCH_API_KEY
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Search API error: ${errorData.error?.message || response.statusText}`);
      }
      
      const data = await response.json();
      
      // Process facets
      const processedFacets = {};
      if (data['@search.facets']) {
        Object.entries(data['@search.facets']).forEach(([facetName, facetValues]) => {
          processedFacets[facetName] = facetValues.map(facet => ({
            value: facet.value,
            count: facet.count
          }));
        });
      }
      
      return {
        results: data.value,
        facets: processedFacets,
        count: data['@odata.count'] || 0
      };
    } catch (error) {
      console.error('Search service error:', error);
      throw error;
    }
  }
};

// src/App.css
/*
  Main Application Styles
*/
:root {
  --primary-color: #2563eb;
  --primary-hover: #1d4ed8;
  --secondary-color: #64748b;
  --background-color: #f8fafc;
  --surface-color: #ffffff;
  --border-color: #e2e8f0;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --text-tertiary: #94a3b8;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --error-color: #ef4444;
  --box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  --border-radius: 6px;
  --sidebar-width: 280px;
  --header-height: 64px;
  --footer-height: 48px;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  color: var(--text-primary);
  background-color: var(--background-color);
  line-height: 1.5;
}

.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-header {
  height: var(--header-height);
  background-color: var(--surface-color);
  box-shadow: var(--box-shadow);
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  padding: 0 1.5rem;
}

.logo {
  display: flex;
  align-items: center;
}

.logo h1 {
  margin-right: 2rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--primary-color);
}

.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 1.25rem;
  cursor: pointer;
  margin-left: 1rem;
}

.main-content {
  display: flex;
  flex: 1;
  position: relative;
}

.sidebar {
  width: var(--sidebar-width);
  background-color: var(--surface-color);
  border-right: 1px solid var(--border-color);
  padding: 1.5rem;
  overflow-y: auto;
  height: calc(100vh - var(--header-height) - var(--footer-height));
  position: sticky;
  top: var(--header-height);
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.filters-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
}

.clear-filters-btn {
  font-size: 0.875rem;
  color: var(--primary-color);
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 500;
}

.clear-filters-btn:hover {
  text-decoration: underline;
}

.content {
  flex: 1;
  padding: 1.5rem;
  min-width: 0;
  height: calc(100vh - var(--header-height) - var(--footer-height));
  overflow-y: auto;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.results-count {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.sort-options {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sort-options label {
  font-size: 0.875rem;