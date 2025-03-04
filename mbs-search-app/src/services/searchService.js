// Azure Cognitive Search service configuration
import { SEARCH_CONFIG, SEARCH_SETTINGS } from '../config';
import { getSortParams, emitProgressEvent } from '../utils';

/**
 * Search for MBS items using Azure Cognitive Search
 * @param {string} query - The search query
 * @param {Object} selectedFacets - Selected facet filters
 * @param {number} page - Current page number
 * @param {string} sortBy - Sort option
 * @param {string} queryType - Query type (simple or semantic)
 * @param {number} fuzzyLevel - Fuzzy search level (0-3, where 0 means no fuzzy search)
 * @returns {Promise<Object>} - Search results, facets, and count
 */
export const searchItems = async (query, selectedFacets = {}, page = 1, sortBy = 'relevance', queryType = 'simple', fuzzyLevel = 0) => {
  try {
    console.log('Searching with query:', query);
    console.log('API Endpoint:', SEARCH_CONFIG.API_ENDPOINT);
    console.log('Index Name:', SEARCH_CONFIG.INDEX_NAME);
    console.log('Query Type:', queryType);
    console.log('Fuzzy Level:', fuzzyLevel);
    
    // Build the search request
    const searchRequest = {
      search: query || '*', // Use '*' for empty queries to return all results
      queryType: 'simple', // Default to simple query type
      searchFields: SEARCH_SETTINGS.SEARCH_FIELDS.join(','), // Search in configured fields
      select: SEARCH_SETTINGS.SELECT_FIELDS.join(','),
      count: true,
      facets: SEARCH_SETTINGS.FACET_FIELDS,
      skip: (page - 1) * SEARCH_SETTINGS.PAGE_SIZE,
      top: SEARCH_SETTINGS.PAGE_SIZE,
      highlight: SEARCH_SETTINGS.HIGHLIGHT_SETTINGS.FIELDS.join(','),
      highlightPreTag: SEARCH_SETTINGS.HIGHLIGHT_SETTINGS.PRE_TAG,
      highlightPostTag: SEARCH_SETTINGS.HIGHLIGHT_SETTINGS.POST_TAG
    };

    // Add fuzzy search if enabled
    if (fuzzyLevel > 0 && fuzzyLevel <= 3) {
      searchRequest.searchMode = 'all'; // Match all terms (AND operator)
      searchRequest.queryType = 'full'; // Use full Lucene query syntax for fuzzy search
      
      // Reformat query for fuzzy search if it's not empty
      if (query && query.trim() !== '') {
        // Split the query into words and add fuzzy operator to each
        const words = query.trim().split(/\s+/);
        const fuzzyQuery = words.map(word => `${word}~${fuzzyLevel}`).join(' ');
        searchRequest.search = fuzzyQuery;
        console.log('Fuzzy query:', fuzzyQuery);
      }
    } 
    // Add semantic search configuration if queryType is semantic and fuzzy search is not enabled
    else if (queryType === 'semantic') {
      searchRequest.queryType = 'semantic';
      searchRequest.queryLanguage = 'en-us';
      searchRequest.semanticConfiguration = 'default';
      searchRequest.answers = 'extractive|count-3';
      searchRequest.captions = 'extractive|highlight-false';
    }

    // Add filters based on selected facets
    if (Object.keys(selectedFacets).length > 0) {
      const filterExpressions = buildFilterExpressions(selectedFacets);
      if (filterExpressions.length > 0) {
        searchRequest.filter = filterExpressions.join(' and ');
      }
    }

    // Add sorting based on the selected option
    searchRequest.orderby = getSortParams(sortBy, query);

    console.log('Search request:', JSON.stringify(searchRequest, null, 2));

    // Make the search request
    const response = await fetch(
      `${SEARCH_CONFIG.API_ENDPOINT}/indexes/${SEARCH_CONFIG.INDEX_NAME}/docs/search?api-version=${SEARCH_CONFIG.API_VERSION}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': SEARCH_CONFIG.API_KEY
        },
        body: JSON.stringify(searchRequest)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Search API error response:', errorText);
      throw await handleApiError(response, errorText);
    }

    const data = await response.json();
    console.log('Search API response:', data);

    // Process facets
    const facets = processFacets(data['@search.facets'], selectedFacets);

    // Process results and add highlighted text if available
    const processedResults = processResults(data.value);

    // Process semantic answers if available
    let semanticAnswers = processSemanticAnswers(data['@search.answers']);

    // Process semantic captions if available
    if (data['@search.captions']) {
      processedResults.forEach((item, index) => {
        if (data.value[index]['@search.captions']) {
          item.caption = data.value[index]['@search.captions'].text;
        }
      });
    }

    return {
      results: processedResults,
      facets: facets,
      count: data['@odata.count'] || 0,
      semanticAnswers: semanticAnswers
    };
  } catch (error) {
    console.error('Error searching items:', error);
    throw error;
  }
};

/**
 * Fetch all search results for export
 * @param {string} query - The search query
 * @param {Object} selectedFacets - Selected facet filters
 * @param {string} sortBy - Sort option
 * @param {string} queryType - Query type (simple or semantic)
 * @param {number} fuzzyLevel - Fuzzy search level (0-3, where 0 means no fuzzy search)
 * @returns {Promise<Array>} - All search results
 */
export const fetchAllResultsForExport = async (query, selectedFacets = {}, sortBy = 'relevance', queryType = 'simple', fuzzyLevel = 0) => {
  try {
    console.log('Fetching all results for export with query:', query);
    
    // First, get the total count of results
    const totalCount = await getResultCount(query, selectedFacets, queryType, fuzzyLevel);
    
    // Emit progress event
    emitProgressEvent(10);
    
    // If no results, return empty array
    if (totalCount === 0) {
      return [];
    }
    
    // Now fetch all results in batches
    const batchSize = SEARCH_SETTINGS.MAX_BATCH_SIZE; // Azure Search max batch size
    const batches = Math.ceil(totalCount / batchSize);
    let allResults = [];
    
    // Build the base search request
    const baseSearchRequest = buildBaseSearchRequest(query, selectedFacets, sortBy, queryType, fuzzyLevel);
    
    // Fetch all batches
    for (let i = 0; i < batches; i++) {
      const skip = i * batchSize;
      const searchRequest = {
        ...baseSearchRequest,
        skip: skip
      };
      
      console.log(`Fetching batch ${i+1}/${batches} (skip: ${skip}, top: ${batchSize})`);
      
      // Calculate and emit progress (10-70% range for fetching)
      const progressPercent = 10 + Math.round((i / batches) * 60);
      emitProgressEvent(progressPercent);
      
      const response = await fetch(
        `${SEARCH_CONFIG.API_ENDPOINT}/indexes/${SEARCH_CONFIG.INDEX_NAME}/docs/search?api-version=${SEARCH_CONFIG.API_VERSION}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': SEARCH_CONFIG.API_KEY
          },
          body: JSON.stringify(searchRequest)
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Export API error response (batch ${i+1}):`, errorText);
        throw await handleApiError(response, errorText);
      }
      
      const data = await response.json();
      console.log(`Batch ${i+1} results: ${data.value.length}`);
      
      // Add results from this batch
      allResults = [...allResults, ...data.value];
    }
    
    console.log(`Total results fetched for export: ${allResults.length}`);
    return allResults;
  } catch (error) {
    console.error('Error fetching all results for export:', error);
    throw error;
  }
};

/**
 * Get the total count of results for a query
 * @param {string} query - The search query
 * @param {Object} selectedFacets - Selected facet filters
 * @param {string} queryType - Query type (simple or semantic)
 * @param {number} fuzzyLevel - Fuzzy search level
 * @returns {Promise<number>} - Total count of results
 */
async function getResultCount(query, selectedFacets, queryType, fuzzyLevel) {
  const countRequest = {
    search: query || '*',
    queryType: 'simple', // Default to simple query type
    searchFields: SEARCH_SETTINGS.SEARCH_FIELDS.join(','),
    select: 'MBSItemId', // Just need one field for count
    count: true,
    skip: 0,
    top: 1, // Just need one result to get the count
  };
  
  // Add fuzzy search if enabled
  if (fuzzyLevel > 0 && fuzzyLevel <= 3) {
    countRequest.searchMode = 'all';
    countRequest.queryType = 'full';
    
    if (query && query.trim() !== '') {
      const words = query.trim().split(/\s+/);
      const fuzzyQuery = words.map(word => `${word}~${fuzzyLevel}`).join(' ');
      countRequest.search = fuzzyQuery;
    }
  }
  // Add semantic search configuration if queryType is semantic and fuzzy search is not enabled
  else if (queryType === 'semantic') {
    countRequest.queryType = 'semantic';
    countRequest.queryLanguage = 'en-us';
    countRequest.semanticConfiguration = 'default';
    countRequest.answers = 'extractive|count-3';
    countRequest.captions = 'extractive|highlight-false';
  }
  
  // Add filters based on selected facets
  if (Object.keys(selectedFacets).length > 0) {
    const filterExpressions = buildFilterExpressions(selectedFacets);
    if (filterExpressions.length > 0) {
      countRequest.filter = filterExpressions.join(' and ');
    }
  }
  
  // Get the count
  const countResponse = await fetch(
    `${SEARCH_CONFIG.API_ENDPOINT}/indexes/${SEARCH_CONFIG.INDEX_NAME}/docs/search?api-version=${SEARCH_CONFIG.API_VERSION}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': SEARCH_CONFIG.API_KEY
      },
      body: JSON.stringify(countRequest)
    }
  );
  
  if (!countResponse.ok) {
    throw new Error(`Count API error: ${countResponse.status} ${countResponse.statusText}`);
  }
  
  const countData = await countResponse.json();
  const totalCount = countData['@odata.count'] || 0;
  console.log(`Total results to export: ${totalCount}`);
  
  return totalCount;
}

/**
 * Build base search request for export
 * @param {string} query - The search query
 * @param {Object} selectedFacets - Selected facet filters
 * @param {string} sortBy - Sort option
 * @param {string} queryType - Query type
 * @param {number} fuzzyLevel - Fuzzy search level
 * @returns {Object} - Base search request
 */
function buildBaseSearchRequest(query, selectedFacets, sortBy, queryType, fuzzyLevel) {
  const baseSearchRequest = {
    search: query || '*',
    queryType: 'simple', // Default to simple query type
    searchFields: SEARCH_SETTINGS.SEARCH_FIELDS.join(','),
    select: SEARCH_SETTINGS.SELECT_FIELDS.join(','),
    count: false,
    top: SEARCH_SETTINGS.MAX_BATCH_SIZE,
  };
  
  // Add fuzzy search if enabled
  if (fuzzyLevel > 0 && fuzzyLevel <= 3) {
    baseSearchRequest.searchMode = 'all';
    baseSearchRequest.queryType = 'full';
    
    if (query && query.trim() !== '') {
      const words = query.trim().split(/\s+/);
      const fuzzyQuery = words.map(word => `${word}~${fuzzyLevel}`).join(' ');
      baseSearchRequest.search = fuzzyQuery;
    }
  }
  // Add semantic search configuration if queryType is semantic and fuzzy search is not enabled
  else if (queryType === 'semantic') {
    baseSearchRequest.queryType = 'semantic';
    baseSearchRequest.queryLanguage = 'en-us';
    baseSearchRequest.semanticConfiguration = 'default';
    baseSearchRequest.answers = 'extractive|count-3';
    baseSearchRequest.captions = 'extractive|highlight-false';
  }
  
  // Add filters based on selected facets
  if (Object.keys(selectedFacets).length > 0) {
    const filterExpressions = buildFilterExpressions(selectedFacets);
    if (filterExpressions.length > 0) {
      baseSearchRequest.filter = filterExpressions.join(' and ');
    }
  }
  
  // Add sorting based on the selected option
  baseSearchRequest.orderby = getSortParams(sortBy, query);
  
  return baseSearchRequest;
}

/**
 * Build filter expressions for Azure Search
 * @param {Object} selectedFacets - Selected facet filters
 * @returns {Array} - Filter expressions
 */
function buildFilterExpressions(selectedFacets) {
  const filterExpressions = [];
  
  for (const [facetName, facetValues] of Object.entries(selectedFacets)) {
    if (facetValues.length > 0) {
      const facetFilters = facetValues.map(value => {
        if (facetName === 'NewItem' || facetName === 'FeeChange' || facetName === 'ItemChange') {
          return `${facetName} eq '${value}'`;
        } else {
          return `${facetName} eq '${value.replace(/'/g, "''")}'`;
        }
      });
      
      filterExpressions.push(`(${facetFilters.join(' or ')})`);
    }
  }
  
  return filterExpressions;
}

/**
 * Process facets from search results
 * @param {Object} searchFacets - Facets from search results
 * @param {Object} selectedFacets - Selected facet filters
 * @returns {Object} - Processed facets
 */
function processFacets(searchFacets, selectedFacets) {
  const facets = {};
  if (searchFacets) {
    for (const [facetName, facetValues] of Object.entries(searchFacets)) {
      if (SEARCH_SETTINGS.FACET_FIELDS.includes(facetName)) {
        facets[facetName] = facetValues.map(facet => ({
          value: facet.value,
          count: facet.count,
          selected: selectedFacets[facetName]?.includes(facet.value) || false
        }));
      }
    }
  }
  return facets;
}

/**
 * Process search results
 * @param {Array} results - Search results
 * @returns {Array} - Processed results
 */
function processResults(results) {
  return results.map(item => {
    // Check if this item has highlights in the response
    if (item['@search.highlights'] && 
        item['@search.highlights'].Description && 
        item['@search.highlights'].Description.length > 0) {
      return {
        ...item,
        highlightedDescription: item['@search.highlights'].Description[0]
      };
    }
    return item;
  });
}

/**
 * Process semantic answers from search results
 * @param {Array} answers - Semantic answers
 * @returns {Array|null} - Processed semantic answers
 */
function processSemanticAnswers(answers) {
  if (!answers) return null;
  
  return answers.map(answer => ({
    text: answer.text,
    highlights: answer.highlights,
    score: answer.score
  }));
}

/**
 * Handle API error responses
 * @param {Response} response - Fetch response
 * @param {string} errorText - Error text
 * @returns {Error} - Error object
 */
async function handleApiError(response, errorText) {
  try {
    const errorData = JSON.parse(errorText);
    return new Error(`API error: ${errorData.error?.message || response.statusText}`);
  } catch (parseError) {
    return new Error(`API error: ${response.status} ${response.statusText}`);
  }
}
