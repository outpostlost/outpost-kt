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
                    <v-card-title class="text-secondary">Bulk 10-K Data Population</v-card-title>
                    <v-card-text>
                      
                      <v-row>
                        <v-col cols="12">
                          <v-card variant="flat" class="bg-info-lighten-4 pa-4">
                            <v-row>
                              <v-col cols="3">
                                <strong>Total Companies:</strong> {{ totalCompanies }}
                              </v-col>
                              <v-col cols="3">
                                <strong>Need Processing:</strong> {{ companiesNeedingProcessing }}
                              </v-col>
                              <v-col cols="3">
                                <strong>Already Have Data:</strong> {{ companiesWithData }}
                              </v-col>
                              <v-col cols="3">
                                <strong>Missing CIK:</strong> {{ errorCompanies.length }}
                              </v-col>
                            </v-row>
                          </v-card>
                        </v-col>
                      </v-row>

                      <v-row>
                        <v-col cols="12" class="d-flex gap-2 align-center">
                          <v-btn 
                            color="primary" 
                            @click="loadCompanies"
                            :loading="loadingCompanies"
                            :disabled="loadingCompanies || processing"
                          >
                            Load Companies
                          </v-btn>
                          <v-btn 
                            color="success" 
                            @click="startProcessing"
                            :disabled="!companiesLoaded || processing || companiesNeedingProcessing === 0"
                          >
                            Start Processing
                          </v-btn>
                          <v-btn 
                            color="error" 
                            @click="stopProcessing"
                            :disabled="!processing"
                          >
                            Stop Processing
                          </v-btn>
                        </v-col>
                      </v-row>

                      <v-row v-if="loadingCompanies">
                        <v-col cols="12">
                          <v-progress-linear indeterminate color="primary"></v-progress-linear>
                          <v-card variant="flat" class="text-center pa-2">Loading companies...</v-card>
                        </v-col>
                      </v-row>

                      <v-row v-if="processing">
                        <v-col cols="12">
                          <v-card variant="outlined" class="mt-4">
                            <v-card-title class="text-secondary">Processing Progress</v-card-title>
                            <v-card-text>
                              <v-row>
                                <v-col cols="12">
                                  <strong>Currently Processing:</strong> {{ currentCompany?.Company || 'N/A' }} ({{ currentCompany?.Ticker || 'N/A' }})
                                </v-col>
                              </v-row>
                              <v-row>
                                <v-col cols="12">
                                  <v-progress-linear 
                                    :model-value="progressPercentage" 
                                    color="success"
                                    height="20"
                                  >
                                    {{ processedCount }} of {{ companiesNeedingProcessing }} ({{ Math.round(progressPercentage) }}%)
                                  </v-progress-linear>
                                </v-col>
                              </v-row>
                              <v-row>
                                <v-col cols="4">
                                  <strong>Processed:</strong> {{ processedCount }}
                                </v-col>
                                <v-col cols="4">
                                  <strong>Successful:</strong> {{ successCount }}
                                </v-col>
                                <v-col cols="4">
                                  <strong>Failed:</strong> {{ failedCount }}
                                </v-col>
                              </v-row>
                            </v-card-text>
                          </v-card>
                        </v-col>
                      </v-row>

                      <v-row v-if="processingComplete">
                        <v-col cols="12">
                          <v-alert type="success" variant="outlined">
                            <strong>Processing Complete!</strong> 
                            Processed {{ processedCount }} companies. 
                            {{ successCount }} successful, {{ failedCount }} failed.
                          </v-alert>
                        </v-col>
                      </v-row>

                      <v-row v-if="errorCompanies.length > 0">
                        <v-col cols="12">
                          <v-card variant="outlined" class="mt-4">
                            <v-card-title class="text-secondary">Companies Missing CIK ({{ errorCompanies.length }})</v-card-title>
                            <v-card-text>
                              <v-data-table
                                :headers="errorHeaders"
                                :items="errorCompanies"
                                :items-per-page="10"
                                class="elevation-1"
                              >
                              </v-data-table>
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

const PAGE_TITLE = 'Populate 10-K Data';

const route = useRoute();
const notify = useNotify();
const theme = useTheme();

const loadingCompanies = ref(false);
const processing = ref(false);
const processingComplete = ref(false);
const companiesLoaded = ref(false);

const allCompanies = ref([]);
const companiesToProcess = ref([]);
const errorCompanies = ref([]);
const currentCompany = ref(null);

const processedCount = ref(0);
const successCount = ref(0);
const failedCount = ref(0);

const { fetchTenKReports } = useEdgarTenK();

const errorHeaders = [
  { title: 'Company', key: 'Company', sortable: true },
  { title: 'Ticker', key: 'Ticker', sortable: true },
  { title: 'Description', key: 'Description', sortable: false },
  { title: 'Document ID', key: 'id', sortable: false }
];

const dynamicBgClass = computed(() => {
  return theme.current.value.dark ? 'bg-charcoal' : 'bg-parchment';
});

const dynamicHeaderClass = computed(() => {
  return theme.current.value.dark ? 'text-stone-gray' : 'text-secondary';
});

const totalCompanies = computed(() => allCompanies.value.length);

const companiesWithData = computed(() => {
  return allCompanies.value.filter(company => company.tenKReports && company.tenKReports.length > 0).length;
});

const companiesNeedingProcessing = computed(() => companiesToProcess.value.length);

const progressPercentage = computed(() => {
  if (companiesNeedingProcessing.value === 0) return 0;
  return (processedCount.value / companiesNeedingProcessing.value) * 100;
});

const { currentUser, updateUserEmail, updateUserPassword, logoutUser } = useAuth();

const pageMetaData = {
  title: "Populate 10-K Data"
}

const loadCompanies = async () => {
  loadingCompanies.value = true;
  allCompanies.value = [];
  companiesToProcess.value = [];
  errorCompanies.value = [];
  companiesLoaded.value = false;

  try {
    // Load all companies from the collection
    const companies = await multiProjectDAL.getAllItems('dataFiliteredCompanyList', [], 'operational');
    allCompanies.value = companies;

    // Separate companies missing CIK
    const companiesWithCik = [];
    const companiesWithoutCik = [];

    companies.forEach(company => {
      if (!company.cik || company.cik === null || company.cik === undefined) {
        companiesWithoutCik.push(company);
      } else {
        companiesWithCik.push(company);
      }
    });

    // Store companies missing CIK in error array
    errorCompanies.value = companiesWithoutCik;

    // Filter companies that need processing (have CIK but no tenKReports data)
    companiesToProcess.value = companiesWithCik.filter(company => 
      !company.tenKReports || company.tenKReports.length === 0
    );

    companiesLoaded.value = true;
    notify.success(`Loaded ${companies.length} companies. ${companiesToProcess.value.length} need processing.`);

  } catch (error) {
    console.error('Error loading companies:', error);
    notify.error(`Error loading companies: ${error.message}`);
  } finally {
    loadingCompanies.value = false;
  }
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const startProcessing = async () => {
  if (companiesToProcess.value.length === 0) {
    notify.info('No companies need processing');
    return;
  }

  processing.value = true;
  processingComplete.value = false;
  processedCount.value = 0;
  successCount.value = 0;
  failedCount.value = 0;

  try {
    for (let i = 0; i < companiesToProcess.value.length; i++) {
      if (!processing.value) break; // Stop processing if user clicked stop

      const company = companiesToProcess.value[i];
      currentCompany.value = company;

      try {
        // Fetch 10-K reports using composable
        const tenKReports = await fetchTenKReports(company.cik);

        // Update the company record with 10-K reports and timestamp
        await multiProjectDAL.updateItem(
          'dataFiliteredCompanyList',
          company.id,
          {
            tenKReports: tenKReports,
            tenKReportsUpdatedAt: new Date().toISOString()
          },
          'operational'
        );

        successCount.value++;
        console.log(`✓ Processed ${company.Company} (${company.Ticker}) - ${tenKReports.length} reports`);

      } catch (error) {
        failedCount.value++;
        console.error(`✗ Failed to process ${company.Company} (${company.Ticker}):`, error);
      }

      processedCount.value++;

      // Rate limiting: 9 requests per second = ~111ms delay
      if (i < companiesToProcess.value.length - 1) {
        await delay(111);
      }
    }

    processingComplete.value = true;
    notify.success(`Processing complete! ${successCount.value} successful, ${failedCount.value} failed.`);

  } catch (error) {
    console.error('Error during bulk processing:', error);
    notify.error(`Processing error: ${error.message}`);
  } finally {
    processing.value = false;
    currentCompany.value = null;
  }
};

const stopProcessing = () => {
  processing.value = false;
  notify.info('Processing stopped by user');
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