// ../outpost-kt/api/edgar-company-facts.js

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // SEC EDGAR Submissions API endpoint for Apple (CIK 0000320193)
    const edgarUrl = 'https://data.sec.gov/submissions/CIK0000320193.json';
    
    // Make request to SEC EDGAR API with required headers
    const response = await fetch(edgarUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Outpost KT edgar-test@outpost-kt.com',
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
            primaryDocDescription: filings.primaryDocDescription[i]
          });
        }
      }
    }

    // Set appropriate headers for the response
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache');

    // Return the filtered data focusing on 10-K reports
    return res.status(200).json({
      success: true,
      companyInfo: {
        cik: data.cik,
        entityType: data.entityType,
        sic: data.sic,
        sicDescription: data.sicDescription,
        name: data.name,
        tickers: data.tickers,
        exchanges: data.exchanges
      },
      tenKReports: tenKReports,
      totalTenKReports: tenKReports.length,
      totalAllFilings: filings ? filings.form.length : 0,
      timestamp: new Date().toISOString(),
      source: 'SEC EDGAR Submissions API - 10-K Reports Only'
    });

  } catch (error) {
    console.error('Error fetching SEC EDGAR data:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}