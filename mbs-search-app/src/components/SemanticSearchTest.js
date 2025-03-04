import React, { useState } from 'react';
import { searchItems } from '../services/searchService';

const SemanticSearchTest = () => {
  const [query, setQuery] = useState('');
  const [simpleResults, setSimpleResults] = useState([]);
  const [semanticResults, setSemanticResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Perform simple search
      const simpleResponse = await searchItems(query, {}, 1, 'relevance', 'simple');
      setSimpleResults(simpleResponse.results);
      
      // Perform semantic search
      const semanticResponse = await searchItems(query, {}, 1, 'relevance', 'semantic');
      setSemanticResults(semanticResponse.results);
      
      console.log('Simple search results:', simpleResponse.results);
      console.log('Semantic search results:', semanticResponse.results);
    } catch (err) {
      setError(err.message);
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>Semantic Search Test</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter a search query..."
          style={{ padding: '8px', width: '300px', marginRight: '10px' }}
        />
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

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      <div style={{ display: 'flex', gap: '20px' }}>
        {/* Simple Search Results */}
        <div style={{ flex: 1 }}>
          <h3>Simple Search Results ({simpleResults.length})</h3>
          {simpleResults.length === 0 ? (
            <p>No results to display. Try searching for something.</p>
          ) : (
            <div>
              {simpleResults.slice(0, 5).map(item => (
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
              {simpleResults.length > 5 && (
                <p>...and {simpleResults.length - 5} more results</p>
              )}
            </div>
          )}
        </div>
        
        {/* Semantic Search Results */}
        <div style={{ flex: 1 }}>
          <h3>Semantic Search Results ({semanticResults.length})</h3>
          {semanticResults.length === 0 ? (
            <p>No results to display. Try searching for something.</p>
          ) : (
            <div>
              {semanticResults.slice(0, 5).map(item => (
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
              {semanticResults.length > 5 && (
                <p>...and {semanticResults.length - 5} more results</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SemanticSearchTest;
