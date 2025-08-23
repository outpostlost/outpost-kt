// api/parse-10k.js
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    console.log('Fetching URL:', url);
    
    // Fetch the HTML content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SEC-Parser/1.0)'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    console.log('HTML fetched, length:', html.length);

    // Load HTML into Cheerio
    const $ = cheerio.load(html);

    // Remove page break elements and surrounding footer/header content
    removePageBreakElements($);

    // Extract Item 1 Business Section
    const item1Business = extractSectionByHeaderText($, 'Item 1', 'Item 1A');
    
    // Extract Item 1A Risk Factors Section  
    const item1ARiskFactors = extractSectionByHeaderText($, 'Item 1A', 'Item 1B');

    const result = {
      success: true,
      url: url,
      parsedAt: new Date().toISOString(),
      sections: {
        item1Business: {
          title: 'Item 1. Business',
          rawHtml: item1Business.rawHtml,
          cleanText: item1Business.cleanText,
          found: item1Business.found,
          headerElement: item1Business.headerElement
        },
        item1ARiskFactors: {
          title: 'Item 1A. Risk Factors', 
          rawHtml: item1ARiskFactors.rawHtml,
          cleanText: item1ARiskFactors.cleanText,
          found: item1ARiskFactors.found,
          headerElement: item1ARiskFactors.headerElement
        }
      }
    };

    console.log('Parsing complete. Item 1 found:', item1Business.found, 'Item 1A found:', item1ARiskFactors.found);

    return res.status(200).json(result);

  } catch (error) {
    console.error('Error parsing 10-K:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      url: url
    });
  }
}

function removePageBreakElements($) {
  try {
    console.log('Removing page break elements and surrounding content...');
    
    $('hr[style*="page-break-after:always"]').each((i, pageBreak) => {
      const $pageBreak = $(pageBreak);
      
      // Remove 1-3 elements before page break (footers/page numbers)
      let prev = $pageBreak.prev();
      let removeCount = 0;
      while (prev.length > 0 && removeCount < 3) {
        const text = prev.text().trim();
        // Remove short content likely to be footers
        if (text.length < 100) {
          const toRemove = prev;
          prev = prev.prev();
          toRemove.remove();
          removeCount++;
        } else break;
      }
      
      // Remove 1-3 elements after page break (spacers/headers)
      let next = $pageBreak.next();
      removeCount = 0;
      while (next.length > 0 && removeCount < 3) {
        const text = next.text().trim();
        // Remove empty or minimal content
        if (text.length < 20 || /^\s*$/.test(text)) {
          const toRemove = next;
          next = next.next();
          toRemove.remove();
          removeCount++;
        } else break;
      }
      
      // Remove the page break itself
      $pageBreak.remove();
    });
    
    console.log('Page break cleanup complete');
  } catch (error) {
    console.error('Error removing page break elements:', error);
  }
}

function extractSectionByHeaderText($, startSection, endSection) {
  try {
    console.log(`\n=== Searching for section: ${startSection} ===`);

    // Define header patterns for the start section
    const startPatterns = createHeaderPatterns(startSection);
    const endPatterns = createHeaderPatterns(endSection);

    console.log('Start patterns:', startPatterns);
    console.log('End patterns:', endPatterns);

    // Find the header element
    let headerElement = null;
    let matchedPattern = null;

    for (const pattern of startPatterns) {
      const elements = $('*').filter((i, el) => {
        const text = $(el).text().trim();
        return pattern.test(text) && text.length < 200; // Avoid matching large content blocks
      });

      if (elements.length > 0) {
        headerElement = elements.first();
        matchedPattern = pattern;
        console.log(`Found header with pattern: ${pattern} in element: ${headerElement.prop('tagName')}`);
        console.log(`Header text: "${headerElement.text().trim()}"`);
        break;
      }
    }

    if (!headerElement) {
      console.log(`Could not find header for: ${startSection}`);
      return {
        found: false,
        rawHtml: '',
        cleanText: `Could not locate "${startSection}" section header`,
        headerElement: null
      };
    }

    // Find the end section header (if exists)
    let endElement = null;
    if (endSection) {
      for (const pattern of endPatterns) {
        const elements = $('*').filter((i, el) => {
          const text = $(el).text().trim();
          return pattern.test(text) && text.length < 200;
        });

        if (elements.length > 0) {
          endElement = elements.first();
          console.log(`Found end header with pattern: ${pattern}`);
          break;
        }
      }
    }

    // Extract content from header element forward
    let current = headerElement;
    let rawHtml = '';
    let contentElements = [];
    let elementCount = 0;
    const maxElements = 1000; // Safety limit

    while (current.length > 0 && elementCount < maxElements) {
      
      // Check if we've hit the end section
      if (endElement && current.is(endElement)) {
        console.log('Reached end section, stopping extraction');
        break;
      }

      // Check if current element contains end section text
      if (endElement) {
        const currentText = current.text().trim();
        for (const pattern of endPatterns) {
          if (pattern.test(currentText) && currentText.length < 200) {
            console.log('Found end section in current element, stopping');
            current = $(); // Exit loop
            break;
          }
        }
      }

      if (current.length === 0) break;

      // Collect this element
      const htmlContent = $.html(current);
      rawHtml += htmlContent;
      contentElements.push(current);

      // Move to next sibling
      let next = current.next();
      if (next.length === 0) {
        // Try parent's next sibling if no direct sibling
        let parent = current.parent();
        while (parent.length > 0 && next.length === 0) {
          next = parent.next();
          if (next.length === 0) {
            parent = parent.parent();
          }
        }
      }

      current = next;
      elementCount++;

      // Safety check for substantial content
      if (elementCount > 100 && rawHtml.length > 50000) {
        console.log('Reached substantial content limit, stopping');
        break;
      }
    }

    // Extract and clean text
    let combinedText = '';
    contentElements.forEach(el => {
      const text = el.text();
      if (text && text.trim().length > 0) {
        combinedText += text + '\n';
      }
    });

    // Clean up the text
    const cleanText = combinedText
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .replace(/^\s+|\s+$/g, '')
      .trim();

    console.log(`Extracted ${elementCount} elements, ${cleanText.length} characters of text`);
    console.log(`First 200 chars: ${cleanText.substring(0, 200)}...`);

    return {
      found: cleanText.length > 100, // Reasonable minimum for actual content
      rawHtml: rawHtml,
      cleanText: cleanText,
      headerElement: headerElement.prop('tagName') + ': ' + headerElement.text().trim().substring(0, 50)
    };

  } catch (error) {
    console.error(`Error extracting section ${startSection}:`, error);
    return {
      found: false,
      rawHtml: '',
      cleanText: `Error extracting section: ${error.message}`,
      headerElement: null
    };
  }
}

function createHeaderPatterns(section) {
  const patterns = [];
  
  if (section === 'Item 1') {
    patterns.push(
      /^\s*Item\s*1\s*\.?\s*Business\s*$/i,
      /^\s*ITEM\s*1\s*\.?\s*BUSINESS\s*$/i,
      /^\s*Item\s*1\s*\.?\s*$/i,
      /^\s*ITEM\s*1\s*\.?\s*$/i,
      /Item\s*1\s*\.?\s*Business/i,
      /ITEM\s*1\s*\.?\s*BUSINESS/i
    );
  } else if (section === 'Item 1A') {
    patterns.push(
      /^\s*Item\s*1A\s*\.?\s*Risk\s*Factors\s*$/i,
      /^\s*ITEM\s*1A\s*\.?\s*RISK\s*FACTORS\s*$/i,
      /^\s*Item\s*1A\s*\.?\s*$/i,
      /^\s*ITEM\s*1A\s*\.?\s*$/i,
      /Item\s*1A\s*\.?\s*Risk\s*Factors/i,
      /ITEM\s*1A\s*\.?\s*RISK\s*FACTORS/i
    );
  } else if (section === 'Item 1B') {
    patterns.push(
      /^\s*Item\s*1B\s*\.?\s*/i,
      /^\s*ITEM\s*1B\s*\.?\s*/i,
      /Item\s*1B\s*\.?\s*/i,
      /ITEM\s*1B\s*\.?\s*/i
    );
  }
  
  return patterns;
}