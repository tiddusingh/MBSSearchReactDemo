import React, { useState, useEffect, useCallback } from 'react';
import { searchItems } from './services/searchService';
import useExport from './hooks/useExport';
import { SEARCH_SETTINGS, EXPORT_CONFIG, UI_CONFIG } from './config';
import { formatDate, debounce } from './utils';
import './App.css';

function App() {
  // State for search
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [facets, setFacets] = useState({});
  const [selectedFacets, setSelectedFacets] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [semanticAnswers, setSemanticAnswers] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState('ItemStartDate desc'); 
  const [queryType, setQueryType] = useState('simple');
  const [fuzzySearch, setFuzzySearch] = useState(false);
  const [fuzzyLevel, setFuzzyLevel] = useState(1);
  const [initialSearchDone, setInitialSearchDone] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Use the export hook for handling exports
  const { 
    exportData, 
    exportProgress, 
    exportStatus, 
    isExporting 
  } = useExport();

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query, facets, page, sort, qType, fuzzy) => {
      setIsLoading(true);
      try {
        const fuzzyLevel = fuzzy ? 1 : 0;
        const searchResults = await searchItems(query, facets, page, sort, qType, fuzzyLevel);
        setResults(searchResults.results);
        setFacets(searchResults.facets);
        setTotalResults(searchResults.count);
        setSemanticAnswers(searchResults.semanticAnswers);
      } catch (error) {
        console.error('Search error:', error);
        alert(`Search error: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  // Effect to perform search when inputs change
  useEffect(() => {
    // Skip initial render search if we've already done the initial search
    const shouldSkipSearch = initialSearchDone && 
      !searchQuery && 
      currentPage === 1 && 
      Object.keys(selectedFacets).length === 0 && 
      sortBy === 'ItemStartDate desc' && 
      queryType === 'simple' && 
      !fuzzySearch;
    
    if (!shouldSkipSearch) {
      debouncedSearch(
        searchQuery, 
        selectedFacets, 
        currentPage, 
        sortBy, 
        queryType, 
        fuzzySearch ? fuzzyLevel : 0
      );
      
      // Mark that we've done the initial search
      if (!initialSearchDone) {
        setInitialSearchDone(true);
      }
    }
  }, [searchQuery, selectedFacets, currentPage, sortBy, queryType, fuzzySearch, fuzzyLevel, debouncedSearch, initialSearchDone]);

  // Perform initial search when component mounts
  useEffect(() => {
    // Perform an initial search with empty query to show all results sorted by start date desc
    debouncedSearch('', {}, 1, 'ItemStartDate desc', 'simple', 0); 
    setInitialSearchDone(true);
  }, [debouncedSearch]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle search submission
  const handleSearchSubmit = () => {
    setCurrentPage(1); // Reset to first page on new search
    
    // If the search query is empty and we're using the default sort and simple query type,
    // use the default search settings
    if (!searchQuery && sortBy === 'ItemStartDate desc' && queryType === 'simple' && !fuzzySearch) { 
      debouncedSearch('', selectedFacets, 1, 'ItemStartDate desc', 'simple', 0); 
    } else {
      debouncedSearch(
        searchQuery, 
        selectedFacets, 
        1, 
        sortBy, 
        queryType, 
        fuzzySearch ? fuzzyLevel : 0
      );
    }
  };

  // Handle search on Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  // Handle facet selection
  const handleFacetChange = (facetName, facetValue) => {
    setSelectedFacets(prevFacets => {
      const newFacets = { ...prevFacets };
      
      if (!newFacets[facetName]) {
        newFacets[facetName] = [];
      }
      
      if (newFacets[facetName].includes(facetValue)) {
        // Remove if already selected
        newFacets[facetName] = newFacets[facetName].filter(value => value !== facetValue);
        if (newFacets[facetName].length === 0) {
          delete newFacets[facetName];
        }
      } else {
        // Add if not selected
        newFacets[facetName] = [...newFacets[facetName], facetValue];
      }
      
      return newFacets;
    });
    
    setCurrentPage(1); // Reset to first page when facets change
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
  };

  // Handle sort change
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1); // Reset to first page when sort changes
  };

  // Handle query type change
  const handleQueryTypeChange = (e) => {
    setQueryType(e.target.value);
    setCurrentPage(1); // Reset to first page when query type changes
  };

  // Handle fuzzy search toggle
  const handleFuzzySearchChange = (e) => {
    setFuzzySearch(e.target.checked);
    setCurrentPage(1); // Reset to first page when fuzzy search changes
  };

  // Handle fuzzy level change
  const handleFuzzyLevelChange = (e) => {
    setFuzzyLevel(parseInt(e.target.value, 10));
    setCurrentPage(1); // Reset to first page when fuzzy level changes
  };

  // Handle download
  const handleDownload = async (format) => {
    try {
      await exportData(
        searchQuery,
        selectedFacets,
        sortBy,
        queryType,
        fuzzySearch ? fuzzyLevel : 0,
        format
      );
    } catch (error) {
      console.error('Export error:', error);
      alert(`Export error: ${error.message}`);
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(totalResults / SEARCH_SETTINGS.PAGE_SIZE);
  const startItem = (currentPage - 1) * SEARCH_SETTINGS.PAGE_SIZE + 1;
  const endItem = Math.min(currentPage * SEARCH_SETTINGS.PAGE_SIZE, totalResults);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Medicare Benefits Schedule Search</h1>
      </header>
      
      <main className="App-main">
        <section className="search-section">
          <div className="search-container">
            <h2>Search Medicare Benefits Schedule</h2>
            <div className="search-form">
              <div className="search-input-wrapper">
                <input
                  type="text"
                  placeholder="Enter search terms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
                  className="search-input"
                />
                <button onClick={handleSearchSubmit} className="search-button">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="search-actions">
              <button 
                className="reset-search-button" 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedFacets({});
                  setQueryType('simple');
                  setFuzzySearch(false);
                  setFuzzyLevel(1);
                  // Reset to initial search with default sort
                  debouncedSearch('', {}, 1, 'ItemStartDate desc', 'simple', 0);
                }}
              >
                Reset All
              </button>
              <button
                className="advanced-toggle"
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              >
                {showAdvancedOptions ? 'Hide Advanced Options' : 'Show Advanced Options'}
              </button>
            </div>
            
            {showAdvancedOptions && (
              <div id="advanced-search-options" className="advanced-search-options">
                <div className="search-options-row">
                  <div className="option-group">
                    <label htmlFor="query-type">Query Type:</label>
                    <select id="query-type" value={queryType} onChange={handleQueryTypeChange} className="select-control">
                      <option value="simple">Simple</option>
                      <option value="semantic">Semantic</option>
                    </select>
                  </div>
                </div>
                
                <div className="search-options-row">
                  <div className="option-group fuzzy-search">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={fuzzySearch}
                        onChange={handleFuzzySearchChange}
                        id="fuzzy-search"
                      />
                      <span>Fuzzy Search</span>
                    </label>
                  </div>
                  
                  {fuzzySearch && (
                    <div className="option-group">
                      <label htmlFor="fuzzy-level">Fuzzy Level:</label>
                      <select id="fuzzy-level" value={fuzzyLevel} onChange={handleFuzzyLevelChange} className="select-control">
                        <option value="1">Low</option>
                        <option value="2">Medium</option>
                        <option value="3">High</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
        
        {semanticAnswers && semanticAnswers.length > 0 && (
          <section className="semantic-answers">
            <h3>Semantic Answers</h3>
            <div className="answers-container">
              {semanticAnswers.map((answer, index) => (
                <div key={index} className="answer-card">
                  <p dangerouslySetInnerHTML={{ __html: answer.text }}></p>
                  <div className="answer-score">Confidence: {Math.round(answer.score * 100)}%</div>
                </div>
              ))}
            </div>
          </section>
        )}
        
        <div className="content-container">
          <button 
            className="mobile-filter-toggle"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
          >
            {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          
          <aside className={`facets-panel ${showMobileFilters ? 'show-mobile' : ''}`}>
            <h3>Filter Results</h3>
            {Object.keys(selectedFacets).length > 0 && (
              <div className="reset-filters">
                <button 
                  className="reset-filters-button" 
                  onClick={() => setSelectedFacets({})}
                >
                  Reset All Filters
                </button>
              </div>
            )}
            {/* Render CategoryDescription facet first */}
            {facets['CategoryDescription'] && (
              <div key="CategoryDescription" className="facet-group">
                <h4>Category</h4>
                {facets['CategoryDescription'].some(facet => facet.selected) && (
                  <button 
                    className="reset-facet-button" 
                    onClick={() => {
                      setSelectedFacets(prev => {
                        const newFacets = { ...prev };
                        delete newFacets['CategoryDescription'];
                        return newFacets;
                      });
                    }}
                  >
                    Reset Category
                  </button>
                )}
                <ul>
                  {[...facets['CategoryDescription']]
                    .sort((a, b) => a.value.localeCompare(b.value))
                    .map(facet => (
                    <li key={facet.value}>
                      <label>
                        <input
                          type="checkbox"
                          checked={facet.selected}
                          onChange={() => handleFacetChange('CategoryDescription', facet.value)}
                        />
                        <span>{facet.value}</span>
                        <span className="facet-count">({facet.count})</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Render other facets */}
            {Object.entries(facets)
              .filter(([facetName]) => facetName !== 'CategoryDescription')
              .map(([facetName, facetValues]) => (
                <div key={facetName} className="facet-group">
                  <h4>{facetName === 'GroupDescription' ? 'Group' : facetName}</h4>
                  {facetValues.some(facet => facet.selected) && (
                    <button 
                      className="reset-facet-button" 
                      onClick={() => {
                        setSelectedFacets(prev => {
                          const newFacets = { ...prev };
                          delete newFacets[facetName];
                          return newFacets;
                        });
                      }}
                    >
                      Reset {facetName === 'GroupDescription' ? 'Group' : facetName}
                    </button>
                  )}
                  <ul>
                    {[...facetValues]
                      .sort((a, b) => a.value.localeCompare(b.value))
                      .map(facet => (
                      <li key={facet.value}>
                        <label>
                          <input
                            type="checkbox"
                            checked={facet.selected}
                            onChange={() => handleFacetChange(facetName, facet.value)}
                          />
                          <span>{facet.value}</span>
                          <span className="facet-count">({facet.count})</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </aside>
          
          <section className="results-section">
            <div className="results-header">
              <div className="results-count">
                {isLoading ? (
                  <span>Searching...</span>
                ) : (
                  <span>
                    {totalResults > 0
                      ? `Showing ${startItem}-${endItem} of ${totalResults} results`
                      : 'No results found'}
                  </span>
                )}
              </div>
              
              <div className="results-controls">
                <div className="sort-control">
                  <label htmlFor="sort-by">Sort By:</label>
                  <select id="sort-by" value={sortBy} onChange={handleSortChange} className="select-control">
                    <option value="relevance">Relevance</option>
                    <option value="ItemNum asc">Item Number (Asc)</option>
                    <option value="ItemNum desc">Item Number (Desc)</option>
                    <option value="ScheduleFee asc">Fee (Low to High)</option>
                    <option value="ScheduleFee desc">Fee (High to Low)</option>
                    <option value="ItemStartDate desc">Start Date (Newest)</option>
                    <option value="ItemStartDate asc">Start Date (Oldest)</option>
                  </select>
                </div>
                
                <div className="export-buttons">
                  <button 
                    onClick={() => handleDownload(EXPORT_CONFIG.FORMATS.CSV)}
                    disabled={isLoading || isExporting || totalResults === 0}
                    className={isExporting ? 'loading' : ''}
                  >
                    {isExporting ? 'Exporting...' : 'Export CSV'}
                  </button>
                  <button 
                    onClick={() => handleDownload(EXPORT_CONFIG.FORMATS.JSON)}
                    disabled={isLoading || isExporting || totalResults === 0}
                    className={isExporting ? 'loading' : ''}
                  >
                    {isExporting ? 'Exporting...' : 'Export JSON'}
                  </button>
                </div>
              </div>
            </div>
            
            {isExporting && (
              <div className="export-progress-container">
                <div className="export-status">{exportStatus}</div>
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar" 
                    style={{ width: `${exportProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            {isLoading ? (
              <div className="loading-spinner"></div>
            ) : (
              <>
                <div className="results-list">
                  {results.length > 0 ? (
                    results.map(item => (
                      <div key={item.MBSItemId} className="result-card">
                        <div className="result-header">
                          <h3>Item {item.ItemNum}</h3>
                          <div className="result-fee">${parseFloat(item.ScheduleFee).toFixed(2)}</div>
                        </div>
                        
                        <div className="result-details">
                          {item.highlightedDescription ? (
                            <p className="result-description" dangerouslySetInnerHTML={{ __html: item.highlightedDescription }}></p>
                          ) : (
                            <p className="result-description">{item.Description}</p>
                          )}
                          
                          {item.caption && (
                            <div className="result-caption">{item.caption}</div>
                          )}
                        </div>
                        
                        <div className="result-meta">
                          <span><strong>Category:</strong> {item.CategoryDescription}</span>
                          <span><strong>Group:</strong> {item.GroupDescription}</span>
                          <span><strong>Type:</strong> {item.ItemType}</span>
                          <span><strong>Start Date:</strong> {formatDate(item.ItemStartDate)}</span>
                          {item.NewItem === 'Y' && <span className="new-badge">New</span>}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-results">
                      <p>No results found. Try adjusting your search query or filters.</p>
                    </div>
                  )}
                </div>
                
                {totalPages > 1 && (
                  <div className="pagination">
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                    >
                      &laquo;
                    </button>
                    
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      &lt;
                    </button>
                    
                    <span className="page-info">
                      Page {currentPage} of {totalPages}
                    </span>
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      &gt;
                    </button>
                    
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      &raquo;
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>
      
      <footer className="App-footer">
        <p>&copy; {new Date().getFullYear()} Medicare Benefits Schedule Search</p>
      </footer>
    </div>
  );
}

export default App;