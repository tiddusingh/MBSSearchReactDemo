import { useState, useEffect, useCallback } from 'react';
import { fetchAllResultsForExport } from '../services/searchService';
import { downloadFile, convertToCSV, escapeCSV, formatDate } from '../utils';
import { EXPORT_CONFIG, UI_CONFIG } from '../config';

/**
 * Custom hook for handling data exports
 * @returns {Object} Export methods and state
 */
const useExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatus, setExportStatus] = useState('');

  // Listen for progress events
  useEffect(() => {
    const progressListener = (event) => {
      if (event.detail && typeof event.detail.progress === 'number') {
        setExportProgress(event.detail.progress);
      }
    };
    
    window.addEventListener('export-progress', progressListener);
    
    return () => {
      window.removeEventListener('export-progress', progressListener);
    };
  }, []);

  /**
   * Export search results to a file
   * @param {string} query - Search query
   * @param {Object} selectedFacets - Selected facet filters
   * @param {string} sortBy - Sort option
   * @param {string} queryType - Query type (simple or semantic)
   * @param {number} fuzzyLevel - Fuzzy search level
   * @param {string} format - Export format (csv or json)
   * @returns {Promise<void>}
   */
  const exportData = useCallback(async (
    query, 
    selectedFacets, 
    sortBy, 
    queryType = 'simple', 
    fuzzyLevel = 0,
    format
  ) => {
    try {
      setIsExporting(true);
      setExportProgress(5);
      setExportStatus('Preparing export...');
      
      // Fetch all results for export
      const allResults = await fetchAllResultsForExport(
        query, 
        selectedFacets, 
        sortBy, 
        queryType, 
        fuzzyLevel
      );
      
      if (allResults.length === 0) {
        setExportStatus('No results to export');
        return;
      }
      
      setExportProgress(75);
      setExportStatus(`Processing ${allResults.length} results...`);
      
      const filename = `${EXPORT_CONFIG.FILENAME_PREFIX}-${new Date().toISOString().slice(0, 10)}`;
      
      if (format === EXPORT_CONFIG.FORMATS.CSV) {
        // Map each item to a CSV row
        const rowMapper = (item) => [
          item.ItemNum || '',
          escapeCSV(item.Description || ''),
          item.ScheduleFee || '',
          escapeCSV(item.CategoryDescription || ''),
          escapeCSV(item.GroupDescription || ''),
          item.ItemType || '',
          formatDate(item.ItemStartDate)
        ].join(',');
        
        // Create CSV content
        const csvContent = convertToCSV(
          EXPORT_CONFIG.CSV_HEADERS,
          allResults,
          rowMapper
        );
        
        setExportProgress(90);
        setExportStatus('Creating CSV file...');
        
        // Create a blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        downloadFile(blob, `${filename}.csv`);
        
        setExportStatus(`Successfully exported ${allResults.length} items to CSV`);
      } else if (format === EXPORT_CONFIG.FORMATS.JSON) {
        // Create a simplified version of the results for JSON export
        const jsonData = allResults.map(item => {
          const result = {};
          
          // Map fields according to the configuration
          Object.entries(EXPORT_CONFIG.JSON_FIELDS).forEach(([sourceField, targetField]) => {
            result[targetField] = sourceField === 'ItemStartDate' 
              ? formatDate(item[sourceField])
              : item[sourceField];
          });
          
          return result;
        });
        
        setExportProgress(90);
        setExportStatus('Creating JSON file...');
        
        // Create a blob and download
        const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
        downloadFile(blob, `${filename}.json`);
        
        setExportStatus(`Successfully exported ${allResults.length} items to JSON`);
      }
      
      setExportProgress(100);
      
      // Reset export state after a delay
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
        setExportStatus('');
      }, UI_CONFIG.TOAST_DURATION);
    } catch (error) {
      console.error('Error exporting results:', error);
      setExportProgress(0);
      setExportStatus(`Error exporting results: ${error.message}`);
      
      // Reset export state after a delay
      setTimeout(() => {
        setIsExporting(false);
        setExportStatus('');
      }, UI_CONFIG.TOAST_DURATION);
    }
  }, []);

  return {
    exportData,
    exportProgress,
    exportStatus,
    isExporting
  };
};

export default useExport;
