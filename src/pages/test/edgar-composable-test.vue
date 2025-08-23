<route lang="yaml">
  meta:
    layout: app
</route>

<template>
  <v-sheet class="flex-grow-1 d-flex flex-column" flat rounded color="surface">
    <v-row class="flex-grow-1 ma-0">
      <v-col class="d-flex flex-column pa-0">
        <v-card :class="['flex-grow-1', 'd-flex', 'flex-column', dynamicBgClass]" flat :border="0">
          <v-card-text class="flex-grow-1" style="overflow-y: auto;" :border="0">
            <v-container fluid>
              <v-row>
                <v-col cols="2">
                  <v-card variant="text" :class="[dynamicHeaderClass, 'text-h5', dynamicBgClass]" :border="0">{{ PAGE_TITLE || 'Loading...' }}</v-card>
                </v-col>
              </v-row>
              
              <v-row>
                <v-col cols="12">
                  <v-card class="bg-surface" variant="outlined">
                    <v-card-title class="text-secondary">Debug Database Connection</v-card-title>
                    <v-card-text>
                      <v-row>
                        <v-col cols="12" class="d-flex gap-2">
                          <v-btn 
                            color="info" 
                            @click="testDalStatus"
                            :loading="testingStatus"
                            :disabled="testingStatus"
                          >
                            Test DAL Status
                          </v-btn>
                          <v-btn 
                            color="warning" 
                            @click="testCollectionAccess"
                            :loading="testingCollection"
                            :disabled="testingCollection"
                          >
                            Test Collection Access
                          </v-btn>
                          <v-btn 
                            color="error" 
                            @click="testStaticQuery"
                            :loading="testingQuery"
                            :disabled="testingQuery"
                          >
                            Test CIK Query
                          </v-btn>
                        </v-col>
                      </v-row>

                      <v-row v-if="debugInfo">
                        <v-col cols="12">
                          <v-card variant="outlined" class="mt-4">
                            <v-card-title class="text-secondary">Debug Information</v-card-title>
                            <v-card-text>
                              <pre style="white-space: pre-wrap; word-wrap: break-word; max-height: 400px; overflow-y: auto; font-size: 12px;">{{ debugInfo }}</pre>
                            </v-card-text>
                          </v-card>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12">
                  <v-card class="bg-surface" variant="outlined">
                    <v-card-title class="text-secondary">Test useEdgarTenK Composable</v-card-title>
                    <v-card-text>
                      <v-row>
                        <v-col cols="6">
                          <v-text-field
                            v-model="testCik"
                            label="Enter CIK"
                            placeholder="e.g. 320193 for Apple"
                            variant="outlined"
                            :disabled="loading || saving"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="6" class="d-flex align-center ga-2">
                          <v-btn 
                            color="primary" 
                            @click="testComposable"
                            :loading="loading"
                            :disabled="loading || saving || !testCik"
                          >
                            Fetch 10-K Reports
                          </v-btn>
                          <v-btn 
                            color="success" 
                            @click="saveResults"
                            :loading="saving"
                            :disabled="loading || saving || !tenKReports || tenKReports.length === 0"
                          >
                            Save Results
                          </v-btn>
                        </v-col>
                      </v-row>

                      <v-row>
                        <v-col cols="12">
                          <v-card variant="flat" class="bg-info-lighten-4 pa-2">
                            <strong>Quick Test CIKs:</strong>
                            <v-btn variant="text" size="small" @click="testCik = '320193'" :disabled="loading || saving">Apple (320193)</v-btn>
                            <v-btn variant="text" size="small" @click="testCik = '789019'" :disabled="loading || saving">Microsoft (789019)</v-btn>
                            <v-btn variant="text" size="small" @click="testCik = '1652044'" :disabled="loading || saving">Google (1652044)</v-btn>
                            <v-btn variant="text" size="small" @click="testCik = '1018724'" :disabled="loading || saving">Amazon (1018724)</v-btn>
                          </v-card>
                        </v-col>
                      </v-row>
                      
                      <v-row v-if="loading">
                        <v-col cols="12">
                          <v-progress-linear indeterminate color="primary"></v-progress-linear>
                          <v-card variant="flat" class="text-center pa-2">Fetching 10-K reports...</v-card>
                        </v-col>
                      </v-row>

                      <v-row v-if="saving">
                        <v-col cols="12">
                          <v-progress-linear indeterminate color="success"></v-progress-linear>
                          <v-card variant="flat" class="text-center pa-2">Saving to database...</v-card>
                        </v-col>
                      </v-row>

                      <v-row v-if="errorMessage">
                        <v-col cols="12">
                          <v-alert type="error" variant="outlined">
                            {{ errorMessage }}
                          </v-alert>
                        </v-col>
                      </v-row>

                      <v-row v-if="savedCompanyInfo">
                        <v-col cols="12">
                          <v-alert type="success" variant="outlined">
                            <strong>Success!</strong> Saved {{ tenKReports.length }} 10-K reports to {{ savedCompanyInfo.Company }} ({{ savedCompanyInfo.Ticker }}) record
                          </v-alert>
                        </v-col>
                      </v-row>

                      <v-row v-if="tenKReports && tenKReports.length > 0">
                        <v-col cols="12">
                          <v-card variant="outlined" class="mt-4">
                            <v-card-title class="text-secondary">
                              Most Recent {{ tenKReports.length }} 10-K Reports (CIK: {{ formattedCik }})
                            </v-card-title>
                            <v-card-text>
                              <v-data-table
                                :headers="tableHeaders"
                                :items="tenKReports"
                                :items-per-page="5"
                                class="elevation-1"
                              >
                                <template v-slot:item.filingDate="{ item }">
                                  {{ formatDate(item.filingDate) }}
                                </template>
                                <template v-slot:item.reportDate="{ item }">
                                  {{ formatDate(item.reportDate) }}
                                </template>
                                <template v-slot:item.isXBRL="{ item }">
                                  <v-chip :color="item.isXBRL ? 'success' : 'warning'" size="small">
                                    {{ item.isXBRL ? 'Yes' : 'No' }}
                                  </v-chip>
                                </template>
                                <template v-slot:item.size="{ item }">
                                  {{ formatFileSize(item.size) }}
                                </template>
                              </v-data-table>
                            </v-card-text>
                          </v-card>
                        </v-col>
                      </v-row>

                      <v-row v-if="tenKReports && tenKReports.length === 0 && !loading && !errorMessage">
                        <v-col cols="12">
                          <v-alert type="info" variant="outlined">
                            No 10-K reports found for CIK: {{ formattedCik }}
                          </v-alert>
                        </v-col>
                      </v-row>

                      <v-row v-if="tenKReports && tenKReports.length > 0">
                        <v-col cols="12">
                          <v-card variant="outlined" class="mt-4">
                            <v-card-title class="text-secondary">Raw Composable Response</v-card-title>
                            <v-card-text>
                              <pre style="white-space: pre-wrap; word-wrap: break-word; max-height: 400px; overflow-y: auto; font-size: 12px;">{{ JSON.stringify(tenKReports, null, 2) }}</pre>
                            </v-card-text>
                          </v-card>
                        </v-col>
                      </v-row>
                      
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
              
            </v-container>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-sheet>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import useNotify from '@/composables/useNotify';
import useAuth from '@/composables/useAuth'
import { useTheme } from 'vuetify';
import useEdgarTenK from '@/composables/useEdgarTenK';
//import multiProjectDAL from '@/dal/multiProjectDal';
//import { where } from 'firebase/firestore';

const PAGE_TITLE = 'Edgar Composable Test';

const route = useRoute();
const notify = useNotify();
const theme = useTheme();

const testCik = ref('');
const loading = ref(false);
const saving = ref(false);
const testingStatus = ref(false);
const testingCollection = ref(false);
const testingQuery = ref(false);
const tenKReports = ref(null);
const errorMessage = ref('');
const formattedCik = ref('');
const savedCompanyInfo = ref(null);
const debugInfo = ref('');

const { fetchTenKReports } = useEdgarTenK();

const tableHeaders = [
  { title: 'Filing Date', key: 'filingDate', sortable: true },
  { title: 'Report Date', key: 'reportDate', sortable: true },
  { title: 'Accession Number', key: 'accessionNumber', sortable: false },
  { title: 'Primary Document', key: 'primaryDocument', sortable: false },
  { title: 'XBRL', key: 'isXBRL', sortable: true },
  { title: 'File Size', key: 'size', sortable: true },
  { title: 'File Number', key: 'fileNumber', sortable: false }
];

const dynamicBgClass = computed(() => {
  return theme.current.value.dark ? 'bg-charcoal' : 'bg-parchment';
});

const dynamicHeaderClass = computed(() => {
  return theme.current.value.dark ? 'text-stone-gray' : 'text-secondary';
});

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString();
};

const formatFileSize = (bytes) => {
  if (!bytes) return '';
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
};

const { currentUser, updateUserEmail, updateUserPassword, logoutUser } = useAuth();

const pageMetaData = {
  title: "Edgar Composable Test"
}

const testDalStatus = async () => {
  testingStatus.value = true;
  debugInfo.value = '';

  try {
    debugInfo.value = 'Testing multiProjectDAL status...\n\n';
    
    // Check DAL initialization
    debugInfo.value += `DAL initialized: ${multiProjectDAL.initialized}\n`;
    debugInfo.value += `Active project: ${multiProjectDAL.getActiveProjectId()}\n`;
    debugInfo.value += `Loaded projects: ${multiProjectDAL.getLoadedProjects().join(', ')}\n\n`;
    
    // Try to initialize if not already done
    await multiProjectDAL.initialize();
    debugInfo.value += 'DAL initialization completed\n';
    
    notify.success('DAL status check completed');
    
  } catch (error) {
    debugInfo.value += `DAL Error: ${error.message}\n`;
    notify.error(`DAL Error: ${error.message}`);
  } finally {
    testingStatus.value = false;
  }
};

const testCollectionAccess = async () => {
  testingCollection.value = true;
  
  try {
    debugInfo.value = 'Testing collection access...\n\n';
    
    // Get first 5 records from collection without filters
    const allRecords = await multiProjectDAL.getAllItems('dataFiliteredCompanyList', [], 'operational');
    
    debugInfo.value += `Collection 'dataFiliteredCompanyList' found\n`;
    debugInfo.value += `Total records: ${allRecords.length}\n\n`;
    
    if (allRecords.length > 0) {
      debugInfo.value += 'Sample record structure:\n';
      debugInfo.value += JSON.stringify(allRecords[0], null, 2) + '\n\n';
      
      // Check for records with CIK field
      const recordsWithCik = allRecords.filter(record => record.hasOwnProperty('cik'));
      debugInfo.value += `Records with 'cik' field: ${recordsWithCik.length}\n`;
      
      if (recordsWithCik.length > 0) {
        debugInfo.value += 'Sample CIK values and types:\n';
        recordsWithCik.slice(0, 5).forEach((record, index) => {
          debugInfo.value += `  ${index + 1}. CIK: ${record.cik} (${typeof record.cik}) - ${record.Company || 'Unknown'}\n`;
        });
      }
    }
    
    notify.success(`Collection access successful - ${allRecords.length} records found`);
    
  } catch (error) {
    debugInfo.value += `Collection Error: ${error.message}\n`;
    notify.error(`Collection Error: ${error.message}`);
  } finally {
    testingCollection.value = false;
  }
};

const testStaticQuery = async () => {
  testingQuery.value = true;
  
  try {
    debugInfo.value += '\nTesting static CIK query...\n\n';
    
    const staticCik = 320193;
    debugInfo.value += `Searching for CIK: ${staticCik} (${typeof staticCik})\n`;
    
    const companies = await multiProjectDAL.getAllItems(
      'dataFiliteredCompanyList', 
      [where('cik', '==', staticCik)], 
      'operational'
    );
    
    debugInfo.value += `Query result: ${companies.length} records found\n`;
    
    if (companies.length > 0) {
      debugInfo.value += 'Found records:\n';
      companies.forEach((company, index) => {
        debugInfo.value += `  ${index + 1}. ${company.Company} (${company.Ticker}) - CIK: ${company.cik}\n`;
      });
    } else {
      debugInfo.value += 'No records found with CIK 320193\n';
    }
    
    notify.info(`Query completed - ${companies.length} records found`);
    
  } catch (error) {
    debugInfo.value += `Query Error: ${error.message}\n`;
    notify.error(`Query Error: ${error.message}`);
  } finally {
    testingQuery.value = false;
  }
};

const testComposable = async () => {
  if (!testCik.value) return;
  
  loading.value = true;
  tenKReports.value = null;
  errorMessage.value = '';
  savedCompanyInfo.value = null;
  formattedCik.value = String(testCik.value).padStart(10, '0');
  
  try {
    const reports = await fetchTenKReports(testCik.value);
    tenKReports.value = reports;
    
    if (reports.length > 0) {
      notify.success(`Successfully fetched ${reports.length} 10-K reports for CIK ${formattedCik.value}`);
    } else {
      notify.info(`No 10-K reports found for CIK ${formattedCik.value}`);
    }
    
  } catch (error) {
    console.error('Error testing composable:', error);
    errorMessage.value = error.message;
    notify.error(`Error: ${error.message}`);
  } finally {
    loading.value = false;
  }
};

const saveResults = async () => {
  if (!tenKReports.value || tenKReports.value.length === 0 || !testCik.value) return;

  saving.value = true;
  errorMessage.value = '';
  savedCompanyInfo.value = null;

  try {
    const cikNumber = parseInt(testCik.value.trim(), 10);
    
    if (isNaN(cikNumber)) {
      throw new Error(`Invalid CIK format: ${testCik.value}`);
    }

    const companies = await multiProjectDAL.getAllItems(
      'dataFiliteredCompanyList', 
      [where('cik', '==', cikNumber)], 
      'operational'
    );

    if (companies.length === 0) {
      throw new Error(`No company record found for CIK ${cikNumber}`);
    }

    if (companies.length > 1) {
      throw new Error(`Multiple company records found for CIK ${cikNumber}`);
    }

    const company = companies[0];

    await multiProjectDAL.updateItem(
      'dataFiliteredCompanyList',
      company.id,
      {
        tenKReports: tenKReports.value,
        tenKReportsUpdatedAt: new Date().toISOString()
      },
      'operational'
    );

    savedCompanyInfo.value = {
      Company: company.Company,
      Ticker: company.Ticker
    };

    notify.success(`Saved ${tenKReports.value.length} 10-K reports to ${company.Company} (${company.Ticker}) record`);

  } catch (error) {
    console.error('Error saving to database:', error);
    errorMessage.value = error.message;
    notify.error(`Database Error: ${error.message}`);
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  if (pageMetaData?.title) {
    document.title = pageMetaData.title;
  }
});
</script>

<style scoped>
/* Add any specific styles for your dynamic page view */
</style>