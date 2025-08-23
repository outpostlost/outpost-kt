// src/api/parsingClient.js

/**
 * Parse a 10-K filing from SEC EDGAR URL
 * @param {string} url - The SEC EDGAR filing URL to parse
 * @returns {Promise<Object>} Parsed sections data or error
 */
export async function parse10K(url) {
  try {
    console.log('Calling parse-10k API with URL:', url);
    
    const response = await fetch('/api/parse-10k', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    console.log('Parse-10k API response:', data.success ? 'Success' : 'Failed');
    return data;

  } catch (error) {
    console.error('Error calling parse-10k API:', error);
    
    // Return standardized error format
    return {
      success: false,
      error: error.message,
      url: url,
      sections: {
        item1Business: {
          title: 'Item 1. Business',
          rawHtml: '',
          cleanText: `Error: ${error.message}`,
          found: false
        },
        item1ARiskFactors: {
          title: 'Item 1A. Risk Factors',
          rawHtml: '',
          cleanText: `Error: ${error.message}`,
          found: false
        }
      }
    };
  }
}

export default {
  parse10K
};