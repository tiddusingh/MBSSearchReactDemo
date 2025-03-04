import React, { useState } from 'react';
import './FacetFilters.css';

export const FacetFilters = ({ facets, selectedFacets, onFacetChange }) => {
  const [expandedSections, setExpandedSections] = useState({});

  // Toggle section expansion
  const toggleSection = (facetName) => {
    setExpandedSections(prev => ({
      ...prev,
      [facetName]: !prev[facetName]
    }));
  };

  // Check if a section should be expanded by default
  const isSectionExpanded = (facetName) => {
    // If explicitly set in state, use that value
    if (expandedSections[facetName] !== undefined) {
      return expandedSections[facetName];
    }
    
    // Default: expand if any value in this facet is selected
    return selectedFacets[facetName]?.length > 0;
  };

  // If no facets, return null
  if (!facets || Object.keys(facets).length === 0) {
    return null;
  }

  return (
    <div className="facet-filters">
      <h2 className="filters-heading">Refine Results</h2>
      
      {Object.entries(facets).map(([facetName, facetData]) => {
        const isExpanded = isSectionExpanded(facetName);
        const hasSelectedValues = selectedFacets[facetName]?.length > 0;
        
        return (
          <div key={facetName} className={`facet-section ${hasSelectedValues ? 'has-selected' : ''}`}>
            <button 
              className="facet-header"
              onClick={() => toggleSection(facetName)}
              aria-expanded={isExpanded}
              aria-controls={`facet-values-${facetName}`}
            >
              <span className="facet-title">{facetData.displayName}</span>
              <span className="facet-toggle">
                {isExpanded ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 15L12 9L6 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </span>
            </button>
            
            <div 
              id={`facet-values-${facetName}`}
              className={`facet-values ${isExpanded ? 'expanded' : ''}`}
            >
              {facetData.values.map((facet, index) => (
                <div key={`${facetName}-${index}`} className="facet-value">
                  <button
                    className={`facet-value-button ${facet.selected ? 'selected' : ''}`}
                    onClick={() => onFacetChange(facetName, facet.value, !facet.selected)}
                    aria-pressed={facet.selected}
                  >
                    <span className="facet-label">
                      {facet.displayValue || facet.value}
                      <span className="facet-count">({facet.count})</span>
                    </span>
                    {facet.selected && (
                      <span className="selected-indicator" aria-hidden="true">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
