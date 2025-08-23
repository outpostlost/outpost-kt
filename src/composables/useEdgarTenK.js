// ../outpost-kt/src/composables/useEdgarTenK.js

import { ref } from 'vue';

export default function useEdgarTenK() {
  
  /**
   * Fetch the most recent 5 10-K reports for a given CIK
   * @param {string|number} cik - The company's CIK (will be formatted to 10 digits with leading zeros)
   * @returns {Promise<Array>} Array of up to 5 most recent 10-K report objects
   */
  const fetchTenKReports = async (cik) => {
    if (!cik) {
      throw new Error('CIK is required');
    }

    try {
      // Format CIK to 10 digits with leading zeros for API call
      const formattedCik = String(cik).padStart(10, '0');
      // Keep original CIK number for URL construction
      const cikNumber = Number(cik);
      
      // SEC EDGAR Submissions API endpoint
      const edgarUrl = `https://data.sec.gov/submissions/CIK${formattedCik}.json`;
      
      // Make request to SEC EDGAR API with required headers
      const response = await fetch(edgarUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Outpost KT edgar-composable@outpost-kt.com',
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate'
        }
      });

      // Check if the request was successful
      if (!response.ok) {
        throw new Error(`SEC API responded with status: ${response.status}`);
      }

      // Parse the JSON response
      const data = await response.json();

      // Filter for 10-K reports only
      const filings = data.filings?.recent;
      const tenKReports = [];

      if (filings && filings.form && filings.accessionNumber) {
        for (let i = 0; i < filings.form.length; i++) {
          if (filings.form[i] === '10-K') {
            
            // Construct URL and determine if successful
            let constructedUrl = '';
            let hasUrl = false;
            
            try {
              const accessionNumber = filings.accessionNumber[i];
              const primaryDocument = filings.primaryDocument[i];
              
              // Check if we have required data for URL construction
              if (accessionNumber && primaryDocument && cikNumber) {
                // Remove dashes from accession number for URL path
                const accessionNumberNoDashes = accessionNumber.replace(/-/g, '');
                constructedUrl = `https://www.sec.gov/Archives/edgar/data/${cikNumber}/${accessionNumberNoDashes}/${primaryDocument}`;
                hasUrl = true;
              }
            } catch (urlError) {
              // URL construction failed, hasUrl remains false
              console.warn('URL construction failed for filing:', filings.accessionNumber[i], urlError);
            }
            
            tenKReports.push({
              form: filings.form[i],
              accessionNumber: filings.accessionNumber[i],
              filingDate: filings.filingDate[i],
              reportDate: filings.reportDate[i],
              acceptanceDateTime: filings.acceptanceDateTime[i],
              act: filings.act[i],
              fileNumber: filings.fileNumber[i],
              filmNumber: filings.filmNumber[i],
              items: filings.items[i],
              size: filings.size[i],
              isXBRL: filings.isXBRL[i],
              isInlineXBRL: filings.isInlineXBRL[i],
              primaryDocument: filings.primaryDocument[i],
              primaryDocDescription: filings.primaryDocDescription[i],
              constructedUrl: constructedUrl,
              hasUrl: hasUrl
            });
          }
        }
      }

      // Sort by filing date (most recent first) and return up to 5 reports
      const sortedReports = tenKReports.sort((a, b) => new Date(b.filingDate) - new Date(a.filingDate));
      
      return sortedReports.slice(0, 5);

    } catch (error) {
      console.error('Error fetching 10-K reports:', error);
      throw error;
    }
  };

  return {
    fetchTenKReports
  };
}