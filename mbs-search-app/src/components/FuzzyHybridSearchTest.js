import React, { useState } from 'react';
import { searchItems } from '../services/searchService';

const FuzzyHybridSearchTest = () => {
  const [query, setQuery] = useState('');
  const [standardResults, setStandardResults] = useState([]);
  const [fuzzyResults, setFuzzyResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fuzzyLevel, setFuzzyLevel] = useState(1);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Perform standard search
      const standardResponse = await searchItems(query, {}, 1, 'relevance', 'simple', 0);
      setStandardResults(standardResponse.results);
      
      // Perform fuzzy search with the selected fuzzy level
      const fuzzyResponse = await searchItems(query, {}, 1, 'relevance', 'simple', fuzzyLevel);
      setFuzzyResults(fuzzyResponse.results);
      
      console.log('Standard search results:', standardResponse.results);
      console.log('Fuzzy search results:', fuzzyResponse.results);
    } catch (err) {
      setError(err.message);
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>Fuzzy Hybrid Search Test</h2>
      
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter a search query with potential misspellings..."
          style={{ padding: '8px', width: '400px' }}
        />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <label htmlFor="fuzzyLevel">Fuzzy Level:</label>
          <select 
            id="fuzzyLevel" 
            value={fuzzyLevel} 
            onChange={(e) => setFuzzyLevel(Number(e.target.value))}
            style={{ padding: '8px' }}
          >
            <option value="1">1 (Low)</option>
            <option value="2">2 (Medium)</option>
            <option value="3">3 (High)</option>
          </select>
        </div>
        
        <button 
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          style={{ 
            padding: '8px 16px', 
            background: '#00558b', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            opacity: loading || !query.trim() ? 0.7 : 1
          }}
        >
          {loading ? 'Searching...' : 'Compare Search Results'}
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <p><strong>Try these test queries:</strong></p>
        <ul style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', listStyle: 'none', padding: 0 }}>
          <li><button onClick={() => setQuery('diabtes')} style={{ padding: '5px 10px', background: '#f0f0f0', border: '1px solid #ddd', borderRadius: '4px' }}>diabtes (misspelled diabetes)</button></li>
          <li><button onClick={() => setQuery('arthrscopy')} style={{ padding: '5px 10px', background: '#f0f0f0', border: '1px solid #ddd', borderRadius: '4px' }}>arthrscopy (misspelled arthroscopy)</button></li>
          <li><button onClick={() => setQuery('colonscopy')} style={{ padding: '5px 10px', background: '#f0f0f0', border: '1px solid #ddd', borderRadius: '4px' }}>colonscopy (misspelled colonoscopy)</button></li>
          <li><button onClick={() => setQuery('mamogram')} style={{ padding: '5px 10px', background: '#f0f0f0', border: '1px solid #ddd', borderRadius: '4px' }}>mamogram (misspelled mammogram)</button></li>
        </ul>
      </div>

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      <div style={{ display: 'flex', gap: '20px' }}>
        {/* Standard Search Results */}
        <div style={{ flex: 1 }}>
          <h3>Standard Search Results ({standardResults.length})</h3>
          {standardResults.length === 0 ? (
            <p>No results to display. Try searching for something.</p>
          ) : (
            <div>
              {standardResults.slice(0, 5).map(item => (
                <div key={item.MBSItemId} style={{ 
                  marginBottom: '15px', 
                  padding: '15px', 
                  border: '1px solid #eee', 
                  borderRadius: '8px',
                  background: 'white'
                }}>
                  <h4>Item {item.ItemNum} {item['@search.score'] && <span style={{color: '#888', fontSize: '0.8em'}}>(Score: {item['@search.score'].toFixed(2)})</span>}</h4>
                  <p style={{ fontWeight: 'bold' }}>{item.Description}</p>
                  {item.highlightedDescription && (
                    <div>
                      <p dangerouslySetInnerHTML={{ __html: item.highlightedDescription }}></p>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <span style={{ 
                      background: '#e6f7ff', 
                      color: '#0070a8',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '0.8em'
                    }}>
                      {item.CategoryDescription || 'No Category'}
                    </span>
                    <span style={{ 
                      background: '#fff7e6', 
                      color: '#d48806',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '0.8em'
                    }}>
                      {item.ItemType || 'No Type'}
                    </span>
                  </div>
                </div>
              ))}
              {standardResults.length > 5 && (
                <p>...and {standardResults.length - 5} more results</p>
              )}
            </div>
          )}
        </div>
        
        {/* Fuzzy Search Results */}
        <div style={{ flex: 1 }}>
          <h3>Fuzzy Search Results (Level: {fuzzyLevel}) ({fuzzyResults.length})</h3>
          {fuzzyResults.length === 0 ? (
            <p>No results to display. Try searching for something.</p>
          ) : (
            <div>
              {fuzzyResults.slice(0, 5).map(item => (
                <div key={item.MBSItemId} style={{ 
                  marginBottom: '15px', 
                  padding: '15px', 
                  border: '1px solid #eee', 
                  borderRadius: '8px',
                  background: 'white'
                }}>
                  <h4>Item {item.ItemNum} {item['@search.score'] && <span style={{color: '#888', fontSize: '0.8em'}}>(Score: {item['@search.score'].toFixed(2)})</span>}</h4>
                  <p style={{ fontWeight: 'bold' }}>{item.Description}</p>
                  {item.highlightedDescription && (
                    <div>
                      <p dangerouslySetInnerHTML={{ __html: item.highlightedDescription }}></p>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <span style={{ 
                      background: '#e6f7ff', 
                      color: '#0070a8',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '0.8em'
                    }}>
                      {item.CategoryDescription || 'No Category'}
                    </span>
                    <span style={{ 
                      background: '#fff7e6', 
                      color: '#d48806',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '0.8em'
                    }}>
                      {item.ItemType || 'No Type'}
                    </span>
                  </div>
                </div>
              ))}
              {fuzzyResults.length > 5 && (
                <p>...and {fuzzyResults.length - 5} more results</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FuzzyHybridSearchTest;
