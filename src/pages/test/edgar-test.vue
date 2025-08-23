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
                    <v-card-title class="text-secondary">SEC EDGAR 10-K Reports Test</v-card-title>
                    <v-card-text>
                      <v-row>
                        <v-col cols="12">
                          <v-btn 
                            color="primary" 
                            @click="fetchTenKReports"
                            :loading="loading"
                            :disabled="loading"
                          >
                            Fetch 10-K Reports (Apple - CIK 0000320193)
                          </v-btn>
                        </v-col>
                      </v-row>
                      
                      <v-row v-if="loading">
                        <v-col cols="12">
                          <v-progress-linear indeterminate color="primary"></v-progress-linear>
                        </v-col>
                      </v-row>
                      
                      <v-row v-if="responseData && responseData.companyInfo">
                        <v-col cols="12">
                          <v-card variant="outlined" class="mt-4">
                            <v-card-title class="text-secondary">Company Information</v-card-title>
                            <v-card-text>
                              <v-row>
                                <v-col cols="6">
                                  <strong>Company:</strong> {{ responseData.companyInfo.name }}
                                </v-col>
                                <v-col cols="6">
                                  <strong>CIK:</strong> {{ responseData.companyInfo.cik }}
                                </v-col>
                              </v-row>
                              <v-row>
                                <v-col cols="6">
                                  <strong>Tickers:</strong> {{ responseData.companyInfo.tickers?.join(', ') }}
                                </v-col>
                                <v-col cols="6">
                                  <strong>Exchange:</strong> {{ responseData.companyInfo.exchanges?.join(', ') }}
                                </v-col>
                              </v-row>
                              <v-row>
                                <v-col cols="12">
                                  <strong>Industry:</strong> {{ responseData.companyInfo.sicDescription }} (SIC: {{ responseData.companyInfo.sic }})
                                </v-col>
                              </v-row>
                            </v-card-text>
                          </v-card>
                        </v-col>
                      </v-row>

                      <v-row v-if="responseData && responseData.tenKReports">
                        <v-col cols="12">
                          <v-card variant="outlined" class="mt-4">
                            <v-card-title class="text-secondary">
                              10-K Reports ({{ responseData.totalTenKReports }} of {{ responseData.totalAllFilings }} total filings)
                            </v-card-title>
                            <v-card-text>
                              <v-data-table
                                :headers="tableHeaders"
                                :items="responseData.tenKReports"
                                :items-per-page="10"
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
                              </v-data-table>
                            </v-card-text>
                          </v-card>
                        </v-col>
                      </v-row>

                      <v-row v-if="responseData">
                        <v-col cols="12">
                          <v-card variant="outlined" class="mt-4">
                            <v-card-title class="text-secondary">Raw API Response</v-card-title>
                            <v-card-text>
                              <pre style="white-space: pre-wrap; word-wrap: break-word; max-height: 400px; overflow-y: auto; font-size: 12px;">{{ formattedResponse }}</pre>
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

const PAGE_TITLE = 'SEC EDGAR 10-K Reports Test';

const route = useRoute();
const notify = useNotify();
const theme = useTheme();

const loading = ref(false);
const responseData = ref(null);

const tableHeaders = [
  { title: 'Filing Date', key: 'filingDate', sortable: true },
  { title: 'Report Date', key: 'reportDate', sortable: true },
  { title: 'Accession Number', key: 'accessionNumber', sortable: false },
  { title: 'Primary Document', key: 'primaryDocument', sortable: false },
  { title: 'XBRL', key: 'isXBRL', sortable: true },
  { title: 'File Number', key: 'fileNumber', sortable: false }
];

const dynamicBgClass = computed(() => {
  return theme.current.value.dark ? 'bg-charcoal' : 'bg-parchment';
});

const dynamicHeaderClass = computed(() => {
  return theme.current.value.dark ? 'text-stone-gray' : 'text-secondary';
});

const formattedResponse = computed(() => {
  if (!responseData.value) return '';
  return JSON.stringify(responseData.value, null, 2);
});

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString();
};

const { currentUser, updateUserEmail, updateUserPassword, logoutUser } = useAuth();

const pageMetaData = {
  title: "SEC EDGAR 10-K Reports Test"
}

const fetchTenKReports = async () => {
  loading.value = true;
  responseData.value = null;
  
  try {
    const response = await fetch('/api/edgar-company-facts');
    const data = await response.json();
    
    if (data.success) {
      responseData.value = data;
      notify.success(`Successfully fetched ${data.totalTenKReports} 10-K reports for ${data.companyInfo.name}`);
    } else {
      notify.error(`API Error: ${data.error}`);
    }
    
  } catch (error) {
    console.error('Error calling API:', error);
    notify.error(`Network Error: ${error.message}`);
  } finally {
    loading.value = false;
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