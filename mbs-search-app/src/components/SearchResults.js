import React, { useState } from 'react';
import './SearchResults.css';

export const SearchResults = ({ results, loading, onItemSelect, selectedItem, fuzzyEnabled }) => {
  const [expandedItems, setExpandedItems] = useState({});

  if (loading) {
    return (
      <div className="search-results loading">
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
          <p>Searching...</p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return null;
  }

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'N/A';
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  // Toggle expanded state for an item
  const toggleExpanded = (itemId, event) => {
    event.stopPropagation(); // Prevent triggering the card click event
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Render description with highlights if available
  const renderDescription = (item) => {
    if (item.highlightedDescription) {
      return <h3 className="item-description" dangerouslySetInnerHTML={{ __html: item.highlightedDescription }} />;
    }
    return <h3 className="item-description">{item.Description}</h3>;
  };

  // Check if any results have a low search score (likely fuzzy matches)
  const hasFuzzyMatches = fuzzyEnabled && results.some(item => 
    item['@search.score'] && item['@search.score'] < 1.0
  );

  return (
    <div className="search-results">
      {fuzzyEnabled && hasFuzzyMatches && (
        <div className="fuzzy-search-notification">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>
            Showing results with similar spellings due to fuzzy search being enabled. 
            Some results may be approximate matches.
          </span>
        </div>
      )}
      
      {results.map((item) => {
        const isExpanded = expandedItems[item.MBSItemId] || false;
        
        return (
          <div 
            key={item.MBSItemId} 
            className={`result-item ${selectedItem?.MBSItemId === item.MBSItemId ? 'selected' : ''} ${fuzzyEnabled && item['@search.score'] < 1.0 ? 'fuzzy-match' : ''}`}
            onClick={() => onItemSelect(item)}
            tabIndex="0"
            role="button"
            aria-expanded={isExpanded}
          >
            <div className="result-header">
              <div className="result-title">
                <span className="item-number-plain">Item {item.ItemNum}</span>
                <span className="result-fee">{formatCurrency(item.ScheduleFee)}</span>
              </div>
            </div>
            
            <div className="result-content">
              {renderDescription(item)}
              
              <div className="result-metadata">
                <div className="metadata-item">
                  <span className="metadata-label">Category:</span>
                  <span className="metadata-value">{item.CategoryDescription || 'N/A'}</span>
                </div>
                
                <div className="metadata-item">
                  <span className="metadata-label">Group:</span>
                  <span className="metadata-value">{item.GroupDescription || 'N/A'}</span>
                </div>
                
                <div className="metadata-item">
                  <span className="metadata-label">Start Date:</span>
                  <span className="metadata-value">{formatDate(item.ItemStartDate)}</span>
                </div>
                
                <div className="metadata-item">
                  <span className="metadata-label">Item Type:</span>
                  <span className="metadata-value">{item.ItemType || 'N/A'}</span>
                </div>
              </div>
              
              {isExpanded && (
                <div className="expanded-content">
                  <h4>Additional Information</h4>
                  <div className="expanded-grid">
                    {/* First column */}
                    <div className="expanded-column">
                      <div className="metadata-item">
                        <span className="metadata-label">Subgroup:</span>
                        <span className="metadata-value">{item.SubgroupDescription || 'N/A'}</span>
                      </div>
                      
                      <div className="metadata-item">
                        <span className="metadata-label">End Date:</span>
                        <span className="metadata-value">{item.ItemEndDate ? formatDate(item.ItemEndDate) : 'Current'}</span>
                      </div>
                      
                      <div className="metadata-item">
                        <span className="metadata-label">Benefit Type:</span>
                        <span className="metadata-value">{item.BenefitType || 'N/A'}</span>
                      </div>
                      
                      <div className="metadata-item">
                        <span className="metadata-label">Benefit Percentage:</span>
                        <span className="metadata-value">{item.BenefitPercentage ? `${item.BenefitPercentage}%` : 'N/A'}</span>
                      </div>
                    </div>
                    
                    {/* Second column */}
                    <div className="expanded-column">
                      <div className="metadata-item">
                        <span className="metadata-label">Anaesthesia Time Units:</span>
                        <span className="metadata-value">{item.AnaesthesiaTimeUnits || 'N/A'}</span>
                      </div>
                      
                      <div className="metadata-item">
                        <span className="metadata-label">Derived Fee:</span>
                        <span className="metadata-value">{item.DerivedFee ? 'Yes' : 'No'}</span>
                      </div>
                      
                      <div className="metadata-item">
                        <span className="metadata-label">Multiple Operation Rule:</span>
                        <span className="metadata-value">{item.MultipleOperationRule ? 'Yes' : 'No'}</span>
                      </div>
                      
                      <div className="metadata-item">
                        <span className="metadata-label">Last Updated:</span>
                        <span className="metadata-value">{formatDate(item.LastUpdated)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {item.ExtendedDescription && (
                    <div className="extended-description">
                      <h4>Extended Description</h4>
                      <p>{item.ExtendedDescription}</p>
                    </div>
                  )}
                </div>
              )}
              
              <div className="tag-container">
                <span className="category-tag">Category {item.CategoryDescription?.split(' ')[1] || ''}</span>
                <span className="type-tag">Type {item.ItemType?.substring(0, 1) || ''}</span>
                {fuzzyEnabled && item['@search.score'] < 1.0 && (
                  <span className="fuzzy-tag">Fuzzy Match</span>
                )}
              </div>
            </div>
            
            <div className="result-action">
              <button 
                className="view-details-button"
                onClick={(e) => toggleExpanded(item.MBSItemId, e)}
                aria-label={isExpanded ? "Hide details" : "View details"}
              >
                {isExpanded ? "Hide Details" : "View Details"}
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  className={isExpanded ? "icon-rotated" : ""}
                  aria-hidden="true"
                >
                  <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
