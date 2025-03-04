import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Log environment variables on startup
console.log('Environment variables:');
console.log('REACT_APP_AZURE_SEARCH_SERVICE:', process.env.REACT_APP_AZURE_SEARCH_SERVICE);
console.log('REACT_APP_AZURE_SEARCH_INDEX_NAME:', process.env.REACT_APP_AZURE_SEARCH_INDEX_NAME);
console.log('API Key is set:', !!process.env.REACT_APP_AZURE_SEARCH_API_KEY);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
