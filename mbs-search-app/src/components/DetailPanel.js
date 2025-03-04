import React, { useEffect, useRef } from 'react';
import './DetailPanel.css';

// Helper function to format dates
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch (e) {
    return dateString;
  }
};

export const DetailPanel = ({ item, onClose }) => {
  const panelRef = useRef(null);
  
  // Handle escape key to close panel
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    // Focus the panel when it opens
    if (panelRef.current) {
      panelRef.current.focus();
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);
  
  if (!item) return null;
  
  // Format currency
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'N/A';
    return `$${parseFloat(amount).toFixed(2)}`;
  };
  
  return (
    <div className="detail-panel-overlay" role="dialog" aria-modal="true" aria-labelledby="detail-title">
      <div 
        className="detail-panel" 
        ref={panelRef} 
        tabIndex="-1"
        aria-label="Item details"
      >
        <div className="detail-header">
          <button 
            className="close-btn" 
            onClick={onClose} 
            aria-label="Close details"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h2 className="detail-title" id="detail-title">Item Details</h2>
        </div>
        
        <div className="detail-content">
          <div className="detail-section main-info">
            <div className="item-identifier">
              <div className="item-number-container">
                <span className="item-label">Item Number</span>
                <span className="item-number">{item.ItemNum}</span>
                {item.ItemNumAlias && <span className="item-alias">({item.ItemNumAlias})</span>}
              </div>
              <div className="item-fee-container">
                <span className="item-label">Schedule Fee</span>
                <span className="item-fee">{formatCurrency(item.ScheduleFee)}</span>
              </div>
            </div>
            
            <div className="item-description-container">
              <span className="item-label">Description</span>
              <p className="item-description">{item.Description}</p>
            </div>
            
            {item.NewItem === 'Y' && (
              <div className="detail-tag new" aria-label="New item">New</div>
            )}
          </div>
          
          <div className="detail-section">
            <h3 className="section-title">Classification</h3>
            <div className="detail-grid">
              <div className="detail-row">
                <div className="detail-label">Category</div>
                <div className="detail-value">{item.CategoryDescription || 'N/A'}</div>
              </div>
              
              <div className="detail-row">
                <div className="detail-label">Group</div>
                <div className="detail-value">{item.GroupDescription || item.Group || 'N/A'}</div>
              </div>
              
              {item.SubgroupDescription && (
                <div className="detail-row">
                  <div className="detail-label">Subgroup</div>
                  <div className="detail-value">{item.SubgroupDescription}</div>
                </div>
              )}
              
              <div className="detail-row">
                <div className="detail-label">Type</div>
                <div className="detail-value">{item.ItemType || 'N/A'}</div>
              </div>
              
              {item.SubType && (
                <div className="detail-row">
                  <div className="detail-label">Sub-Type</div>
                  <div className="detail-value">{item.SubType}</div>
                </div>
              )}
            </div>
          </div>
          
          <div className="detail-section">
            <h3 className="section-title">Fee Information</h3>
            <div className="detail-grid">
              {item.FeeType && (
                <div className="detail-row">
                  <div className="detail-label">Fee Type</div>
                  <div className="detail-value">{item.FeeType}</div>
                </div>
              )}
              
              {item.ScheduleFee && (
                <div className="detail-row">
                  <div className="detail-label">Schedule Fee</div>
                  <div className="detail-value">{formatCurrency(item.ScheduleFee)}</div>
                </div>
              )}
              
              {item.BenefitPercentage && (
                <div className="detail-row">
                  <div className="detail-label">Benefit %</div>
                  <div className="detail-value">{item.BenefitPercentage}%</div>
                </div>
              )}
              
              {item.BenefitType && (
                <div className="detail-row">
                  <div className="detail-label">Benefit Type</div>
                  <div className="detail-value">{item.BenefitType}</div>
                </div>
              )}
              
              {item.SpecialistService && (
                <div className="detail-row">
                  <div className="detail-label">Specialist Service</div>
                  <div className="detail-value">{item.SpecialistService === 'Y' ? 'Yes' : 'No'}</div>
                </div>
              )}
              
              {item.DerivedFee && (
                <div className="detail-row">
                  <div className="detail-label">Derived Fee</div>
                  <div className="detail-value">Yes</div>
                </div>
              )}
              
              {item.MultipleOperationRule && (
                <div className="detail-row">
                  <div className="detail-label">Multiple Operation Rule</div>
                  <div className="detail-value">Yes</div>
                </div>
              )}
              
              {item.AnaesthesiaTimeUnits && (
                <div className="detail-row">
                  <div className="detail-label">Anaesthesia Time Units</div>
                  <div className="detail-value">{item.AnaesthesiaTimeUnits}</div>
                </div>
              )}
            </div>
          </div>
          
          <div className="detail-section">
            <h3 className="section-title">Date Information</h3>
            <div className="detail-grid">
              <div className="detail-row">
                <div className="detail-label">Start Date</div>
                <div className="detail-value">{formatDate(item.ItemStartDate)}</div>
              </div>
              
              <div className="detail-row">
                <div className="detail-label">End Date</div>
                <div className="detail-value">{item.ItemEndDate ? formatDate(item.ItemEndDate) : 'Current'}</div>
              </div>
              
              {item.LastModified && (
                <div className="detail-row">
                  <div className="detail-label">Last Modified</div>
                  <div className="detail-value">{formatDate(item.LastModified)}</div>
                </div>
              )}
              
              {item.LastUpdated && (
                <div className="detail-row">
                  <div className="detail-label">Last Updated</div>
                  <div className="detail-value">{formatDate(item.LastUpdated)}</div>
                </div>
              )}
            </div>
          </div>
          
          {item.ExtendedDescription && (
            <div className="detail-section">
              <h3 className="section-title">Extended Description</h3>
              <p className="extended-description">{item.ExtendedDescription}</p>
            </div>
          )}
          
          <div className="detail-actions">
            <button 
              className="detail-action-button print-button" 
              onClick={() => window.print()}
              aria-label="Print item details"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 9V2H18V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 18H4C3.46957 18 2.96086 17.7893 2.58579 17.4142C2.21071 17.0391 2 16.5304 2 16V11C2 10.4696 2.21071 9.96086 2.58579 9.58579C2.96086 9.21071 3.46957 9 4 9H20C20.5304 9 21.0391 9.21071 21.4142 9.58579C21.7893 9.96086 22 10.4696 22 11V16C22 16.5304 21.7893 17.0391 21.4142 17.4142C21.0391 17.7893 20.5304 18 20 18H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18 14H6V22H18V14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Print
            </button>
            <button 
              className="detail-action-button close-button" 
              onClick={onClose}
              aria-label="Close details panel"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
