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
                  <v-card variant="text" :class="[dynamicHeaderClass, 'text-h5', dynamicBgClass]" :border="0">{{ PAGE_TITLE }}</v-card>
                </v-col>
              </v-row>
              
              <v-row>
                <v-col cols="12">
                  <v-card class="bg-surface" variant="outlined">
                    <v-card-title class="text-secondary">10-K Filing URL</v-card-title>
                    <v-card-text>
                      <v-text-field
                        v-model="filingUrl"
                        label="SEC EDGAR 10-K URL"
                        variant="outlined"
                        readonly
                        hint="Static test URL for Apple 10-K filing"
                        persistent-hint
                      ></v-text-field>
                      
                      <v-btn
                        color="primary"
                        :loading="parsing"
                        :disabled="!filingUrl"
                        @click="parseDocument"
                        class="mt-4"
                      >
                        Parse Document
                      </v-btn>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>

              <v-row v-if="parseResult">
                <v-col cols="6">
                  <v-card class="bg-surface" variant="outlined">
                    <v-card-title class="text-secondary">
                      Item 1. Business Section
                      <v-chip 
                        :color="parseResult.sections?.item1Business?.found ? 'success' : 'error'" 
                        size="small" 
                        class="ml-2"
                      >
                        {{ parseResult.sections?.item1Business?.found ? 'Found' : 'Not Found' }}
                      </v-chip>
                    </v-card-title>
                    <v-card-text>
                      <v-expansion-panels>
                        <v-expansion-panel>
                          <v-expansion-panel-title>Clean Text ({{ parseResult.sections?.item1Business?.cleanText?.length || 0 }} chars)</v-expansion-panel-title>
                          <v-expansion-panel-text>
                            <v-textarea
                              :model-value="parseResult.sections?.item1Business?.cleanText || 'No content'"
                              readonly
                              variant="outlined"
                              rows="10"
                              no-resize
                            ></v-textarea>
                          </v-expansion-panel-text>
                        </v-expansion-panel>
                        
                        <v-expansion-panel>
                          <v-expansion-panel-title>Raw HTML ({{ parseResult.sections?.item1Business?.rawHtml?.length || 0 }} chars)</v-expansion-panel-title>
                          <v-expansion-panel-text>
                            <v-textarea
                              :model-value="parseResult.sections?.item1Business?.rawHtml || 'No content'"
                              readonly
                              variant="outlined"
                              rows="8"
                              no-resize
                            ></v-textarea>
                          </v-expansion-panel-text>
                        </v-expansion-panel>
                      </v-expansion-panels>
                    </v-card-text>
                  </v-card>
                </v-col>

                <v-col cols="6">
                  <v-card class="bg-surface" variant="outlined">
                    <v-card-title class="text-secondary">
                      Item 1A. Risk Factors Section
                      <v-chip 
                        :color="parseResult.sections?.item1ARiskFactors?.found ? 'success' : 'error'" 
                        size="small" 
                        class="ml-2"
                      >
                        {{ parseResult.sections?.item1ARiskFactors?.found ? 'Found' : 'Not Found' }}
                      </v-chip>
                    </v-card-title>
                    <v-card-text>
                      <v-expansion-panels>
                        <v-expansion-panel>
                          <v-expansion-panel-title>Clean Text ({{ parseResult.sections?.item1ARiskFactors?.cleanText?.length || 0 }} chars)</v-expansion-panel-title>
                          <v-expansion-panel-text>
                            <v-textarea
                              :model-value="parseResult.sections?.item1ARiskFactors?.cleanText || 'No content'"
                              readonly
                              variant="outlined"
                              rows="10"
                              no-resize
                            ></v-textarea>
                          </v-expansion-panel-text>
                        </v-expansion-panel>
                        
                        <v-expansion-panel>
                          <v-expansion-panel-title>Raw HTML ({{ parseResult.sections?.item1ARiskFactors?.rawHtml?.length || 0 }} chars)</v-expansion-panel-title>
                          <v-expansion-panel-text>
                            <v-textarea
                              :model-value="parseResult.sections?.item1ARiskFactors?.rawHtml || 'No content'"
                              readonly
                              variant="outlined"
                              rows="8"
                              no-resize
                            ></v-textarea>
                          </v-expansion-panel-text>
                        </v-expansion-panel>
                      </v-expansion-panels>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>

              <v-row v-if="parseResult">
                <v-col cols="12">
                  <v-card class="bg-surface" variant="outlined">
                    <v-card-title class="text-secondary">Full API Response</v-card-title>
                    <v-card-text>
                      <v-textarea
                        :model-value="JSON.stringify(parseResult, null, 2)"
                        readonly
                        variant="outlined"
                        rows="12"
                        no-resize
                      ></v-textarea>
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
import { useTheme } from 'vuetify';
import { parse10K } from '@/api/parsingClient';

const PAGE_TITLE = '10-K Parser Test';

const route = useRoute();
const notify = useNotify();
const theme = useTheme();

const filingUrl = ref('https://www.sec.gov/Archives/edgar/data/320193/000032019323000106/aapl-20230930.htm');
//const filingUrl = ref('https://www.sec.gov/Archives/edgar/data/789019/000095017023035122/msft-20230630.htm');
const parsing = ref(false);
const parseResult = ref(null);

const dynamicBgClass = computed(() => {
  return theme.current.value.dark ? 'bg-charcoal' : 'bg-parchment';
});

const dynamicHeaderClass = computed(() => {
  return theme.current.value.dark ? 'text-stone-gray' : 'text-secondary';
});

const parseDocument = async () => {
  if (!filingUrl.value) {
    notify.error('Please enter a filing URL');
    return;
  }

  parsing.value = true;
  parseResult.value = null;

  try {
    notify.info('Starting document parse...');
    
    const result = await parse10K(filingUrl.value);
    parseResult.value = result;

    if (result.success) {
      const item1Found = result.sections?.item1Business?.found;
      const item1AFound = result.sections?.item1ARiskFactors?.found;
      
      if (item1Found && item1AFound) {
        notify.success('Both sections parsed successfully!');
      } else if (item1Found || item1AFound) {
        notify.warning('Partial parsing success - check results below');
      } else {
        notify.error('No sections found - check parsing logic');
      }
    } else {
      notify.error(`Parse failed: ${result.error}`);
    }

  } catch (error) {
    console.error('Parse error:', error);
    notify.error(`Parse error: ${error.message}`);
    parseResult.value = {
      success: false,
      error: error.message,
      url: filingUrl.value
    };
  } finally {
    parsing.value = false;
  }
};

onMounted(() => {
  document.title = PAGE_TITLE;
});
</script>

<style scoped>
/* Add any specific styles for your dynamic page view */
</style>