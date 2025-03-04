import React, { useState, useEffect } from 'react';
import { searchItems } from '../services/searchService';

const SearchHighlightTest = () => {
  const [query, setQuery] = useState('diabetes');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await searchItems(query);
      setResults(response.results);
      console.log('Search results:', response.results);
    } catch (err) {
      setError(err.message);
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Search Highlight Test</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ padding: '8px', width: '300px', marginRight: '10px' }}
        />
        <button 
          onClick={handleSearch}
          style={{ padding: '8px 16px', background: '#00558b', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Search
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      <div>
        <h3>Results ({results.length})</h3>
        {results.map(item => (
          <div key={item.MBSItemId} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #eee', borderRadius: '8px' }}>
            <h4>Item {item.ItemNum}</h4>
            
            <div style={{ marginBottom: '10px' }}>
              <strong>Original Description:</strong>
              <p>{item.Description}</p>
            </div>
            
            {item.highlightedDescription && (
              <div style={{ marginBottom: '10px' }}>
                <strong>Highlighted Description:</strong>
                <p dangerouslySetInnerHTML={{ __html: item.highlightedDescription }}></p>
              </div>
            )}
            
            <div>
              <strong>Raw Highlight Data:</strong>
              <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto', fontSize: '12px' }}>
                {JSON.stringify(item['@search.highlights'], null, 2)}
              </pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchHighlightTest;
