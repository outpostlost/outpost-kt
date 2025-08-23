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
                    <v-card-title class="text-secondary">Gemini API Test</v-card-title>
                    <v-card-text>
                      <v-form @submit.prevent="submitPrompt">
                        <v-textarea
                          v-model="promptText"
                          label="Enter your prompt"
                          placeholder="write a short poem about dogs"
                          variant="outlined"
                          rows="3"
                          :disabled="loading"
                        ></v-textarea>
                        
                        <v-btn
                          type="submit"
                          color="primary"
                          :loading="loading"
                          :disabled="!promptText.trim()"
                          class="mt-3"
                        >
                          Submit to Gemini2
                        </v-btn>
                      </v-form>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>

              <v-row v-if="apiResponse || errorMessage">
                <v-col cols="12">
                  <v-card class="bg-surface" variant="outlined">
                    <v-card-title class="text-secondary">API Response</v-card-title>
                    <v-card-text>
                      <v-alert
                        v-if="errorMessage"
                        type="error"
                        variant="tonal"
                        class="mb-4"
                      >
                        {{ errorMessage }}
                      </v-alert>

                      <v-card
                        v-if="apiResponse"
                        variant="tonal"
                        color="success"
                      >
                        <v-card-text>
                          <v-row>
                            <v-col cols="12">
                              <strong>Model Used:</strong> {{ apiResponse.modelUsed }}
                            </v-col>
                            <v-col cols="12">
                              <strong>Provider:</strong> {{ apiResponse.provider }}
                            </v-col>
                            <v-col cols="12">
                              <strong>Prompt:</strong> {{ apiResponse.prompt }}
                            </v-col>
                            <v-col cols="12">
                              <strong>Response:</strong>
                              <v-card variant="outlined" class="mt-2">
                                <v-card-text style="white-space: pre-wrap;">{{ apiResponse.response }}</v-card-text>
                              </v-card>
                            </v-col>
                            <v-col cols="12">
                              <strong>Timestamp:</strong> {{ formatTimestamp(apiResponse.timestamp) }}
                            </v-col>
                          </v-row>
                        </v-card-text>
                      </v-card>
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

const PAGE_TITLE = 'Gemini LLM Test';

const route = useRoute();
const notify = useNotify();
const theme = useTheme();

const promptText = ref('write a short poem about dogs');
const loading = ref(false);
const apiResponse = ref(null);
const errorMessage = ref('');

const dynamicBgClass = computed(() => {
  return theme.current.value.dark ? 'bg-charcoal' : 'bg-parchment';
});

const dynamicHeaderClass = computed(() => {
  return theme.current.value.dark ? 'text-stone-gray' : 'text-secondary';
});

const { currentUser, updateUserEmail, updateUserPassword, logoutUser } = useAuth();

const pageMetaData = {
  title: "Gemini LLM Test"
}

const formatTimestamp = (timestamp) => {
  return new Date(timestamp).toLocaleString();
};

const submitPrompt = async () => {
  if (!promptText.value.trim()) {
    notify.warning('Please enter a prompt');
    return;
  }

  loading.value = true;
  apiResponse.value = null;
  errorMessage.value = '';

  try {
    const response = await fetch('/api/llm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        modelId: 'gemini-2.0-flash',
        prompt: promptText.value.trim()
      })
    });

    const data = await response.json();

    if (data.success) {
      apiResponse.value = data.data;
      notify.success('Response received from Gemini!');
    } else {
      errorMessage.value = data.error || 'Unknown error occurred';
      notify.error('Failed to get response from Gemini');
    }

  } catch (error) {
    console.error('Frontend error:', error);
    errorMessage.value = 'Network error: Unable to connect to API';
    notify.error('Network error occurred');
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