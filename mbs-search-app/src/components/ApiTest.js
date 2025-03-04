import React, { useState } from 'react';

const ApiTest = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testApi = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const SEARCH_API_ENDPOINT = process.env.REACT_APP_AZURE_SEARCH_SERVICE || 'https://testopenaiservice102.search.windows.net';
      const SEARCH_API_KEY = process.env.REACT_APP_AZURE_SEARCH_API_KEY || 'cEbz7StL7nXVJ2wx6VNO9fXzw1m9hbhtdgTwkBFY90AzSeAQGwJ2'; 
      const SEARCH_INDEX_NAME = process.env.REACT_APP_AZURE_SEARCH_INDEX_NAME || 'azuresql-index-v2';
      const SEARCH_API_VERSION = '2021-04-30-Preview';
      
      console.log('Testing API with:', {
        endpoint: SEARCH_API_ENDPOINT,
        index: SEARCH_INDEX_NAME,
        apiKeySet: !!SEARCH_API_KEY
      });
      
      const searchRequest = {
        search: 'knee',
        queryType: 'simple',
        searchFields: 'Description',
        select: 'MBSItemId,ItemNum,Description,ScheduleFee',
        count: true,
        top: 3
      };
      
      const response = await fetch(
        `${SEARCH_API_ENDPOINT}/indexes/${SEARCH_INDEX_NAME}/docs/search?api-version=${SEARCH_API_VERSION}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': SEARCH_API_KEY
          },
          body: JSON.stringify(searchRequest)
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Test Error:', errorText);
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('API Test Response:', data);
      setResults(data);
    } catch (err) {
      console.error('API Test Failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', margin: '20px 0' }}>
      <h2>API Test</h2>
      <button 
        onClick={testApi}
        disabled={loading}
        style={{
          padding: '8px 16px',
          backgroundColor: '#5d2e62',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Testing...' : 'Test Azure Search API'}
      </button>
      
      {error && (
        <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#fff5f5', color: '#e53e3e', borderRadius: '4px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {results && (
        <div style={{ marginTop: '16px' }}>
          <h3>Results:</h3>
          <p>Total Count: {results['@odata.count']}</p>
          <div style={{ maxHeight: '300px', overflow: 'auto' }}>
            <pre style={{ backgroundColor: '#f5f5f5', padding: '12px', borderRadius: '4px' }}>
              {JSON.stringify(results.value, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiTest;
