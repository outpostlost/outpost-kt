export default async function handler(req, res) {
  // Set CORS headers for frontend access
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    console.log('SEC Tickers API: Starting fetch from SEC.gov...');
    
    // Fetch SEC data server-side (no CORS restrictions)
    const response = await fetch('https://www.sec.gov/files/company_tickers.json', {
      headers: {
        'User-Agent': 'Outpost KT CIK Mapper (contact@outpostkt.com)',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.error(`SEC API Error: ${response.status} ${response.statusText}`);
      throw new Error(`SEC API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`SEC Tickers API: Successfully fetched ${Object.keys(data).length} companies`);

    // Return the data to frontend
    res.status(200).json({
      success: true,
      data: data,
      timestamp: new Date().toISOString(),
      count: Object.keys(data).length
    });

  } catch (error) {
    console.error('SEC Tickers API Error:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}