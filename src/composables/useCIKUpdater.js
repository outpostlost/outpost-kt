// src/composables/useCIKUpdater.js

import { ref } from 'vue';
//import multiProjectDAL from '@/dal/multiProjectDal';
import useNotify from '@/composables/useNotify';

export default function useCIKUpdater() {
  const notify = useNotify();
  
  // Reactive state
  const isProcessing = ref(false);
  const progress = ref({
    total: 0,
    processed: 0,
    matched: 0,
    updated: 0,
    errors: 0
  });
  const skippedCompanies = ref([]);
  const errorLog = ref([]);

  /**
   * Main function to update CIK numbers for all companies
   */
  async function updateAllCIKs() {
    if (isProcessing.value) {
      notify.warning('CIK update process is already running');
      return;
    }

    // Reset state
    isProcessing.value = true;
    progress.value = { total: 0, processed: 0, matched: 0, updated: 0, errors: 0 };
    skippedCompanies.value = [];
    errorLog.value = [];

    try {
      notify.info('Starting CIK update process...');
      console.log('=== CIK UPDATE PROCESS STARTED ===');

      // Step 1: Fetch SEC ticker mapping data via serverless function
      console.log('Fetching SEC company tickers data via serverless function...');
      const secTickerMap = await fetchSECTickerMapping();
      console.log(`SEC ticker mapping loaded: ${Object.keys(secTickerMap).length} companies`);

      // Step 2: Get all existing company records
      console.log('Retrieving existing company records from Firestore...');
      const companies = await multiProjectDAL.getAllItems('dataFiliteredCompanyList');
      progress.value.total = companies.length;
      console.log(`Found ${companies.length} existing company records`);

      // Step 3: Process each company
      console.log('Starting company processing...');
      for (const company of companies) {
        await processCompanyRecord(company, secTickerMap);
        progress.value.processed++;
      }

      // Step 4: Show completion summary
      const summary = {
        total: progress.value.total,
        matched: progress.value.matched,
        updated: progress.value.updated,
        skipped: skippedCompanies.value.length,
        errors: progress.value.errors
      };

      console.log('=== CIK UPDATE PROCESS COMPLETED ===');
      console.log('Summary:', summary);
      
      notify.success(`CIK update completed! ${summary.updated} companies updated, ${summary.skipped} skipped`);

    } catch (error) {
      console.error('CIK Update Process Error:', error);
      errorLog.value.push({
        stage: 'Main Process',
        error: error.message,
        timestamp: new Date().toISOString()
      });
      notify.error(`CIK update failed: ${error.message}`);
    } finally {
      isProcessing.value = false;
    }
  }

  /**
   * Fetch and parse SEC ticker mapping data via serverless function
   */
  async function fetchSECTickerMapping() {
    try {
      console.log('Calling serverless function: /api/sec-tickers');
      const response = await fetch('/api/sec-tickers');
      
      if (!response.ok) {
        throw new Error(`Serverless function failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(`SEC data fetch failed: ${result.error}`);
      }

      console.log(`Serverless function returned ${result.count} companies at ${result.timestamp}`);
      
      // Convert SEC format to ticker -> CIK mapping
      const tickerMap = {};
      Object.values(result.data).forEach(company => {
        if (company.ticker && company.cik_str) {
          // Store both ticker formats (some might have different cases)
          tickerMap[company.ticker.toUpperCase()] = {
            cik: company.cik_str,
            title: company.title
          };
        }
      });

      console.log(`Processed ticker mapping: ${Object.keys(tickerMap).length} valid entries`);
      return tickerMap;

    } catch (error) {
      console.error('Error fetching SEC ticker mapping via serverless function:', error);
      throw new Error(`Failed to fetch SEC data: ${error.message}`);
    }
  }

  /**
   * Process individual company record
   */
  async function processCompanyRecord(company, secTickerMap) {
    try {
      const ticker = company.Ticker?.toUpperCase();
      
      if (!ticker) {
        console.warn(`Company ${company.Company} has no ticker symbol`);
        skippedCompanies.value.push({
          company: company.Company,
          reason: 'No ticker symbol',
          id: company.id
        });
        return;
      }

      // Check if CIK already exists
      if (company.cik) {
        console.log(`Company ${ticker} already has CIK: ${company.cik}`);
        progress.value.matched++;
        return;
      }

      // Look up CIK in SEC data
      const secMatch = secTickerMap[ticker];
      
      if (secMatch) {
        // Found match - update record
        progress.value.matched++;
        
        const updateData = {
          cik: secMatch.cik,
          secTitle: secMatch.title,
          cikUpdatedAt: new Date().toISOString()
        };

        await multiProjectDAL.updateItem('dataFiliteredCompanyList', company.id, updateData);
        progress.value.updated++;
        
        console.log(`Updated ${ticker} with CIK: ${secMatch.cik}`);

      } else {
        // No match found - add to skipped list
        skippedCompanies.value.push({
          company: company.Company,
          ticker: ticker,
          reason: 'Not found in SEC data',
          id: company.id
        });
      }

    } catch (error) {
      console.error(`Error processing company ${company.Company}:`, error);
      progress.value.errors++;
      errorLog.value.push({
        company: company.Company,
        ticker: company.Ticker,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  return {
    // State
    isProcessing,
    progress,
    skippedCompanies,
    errorLog,
    
    // Methods
    updateAllCIKs
  };
}