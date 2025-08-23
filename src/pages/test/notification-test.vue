<route lang="yaml">
meta:
  layout: app
</route>

<template>
  <v-sheet class="flex-grow-1 d-flex flex-column" flat rounded color="surface">
    <v-row class="flex-grow-1 ma-0">
      <v-col class="d-flex flex-column pa-0">
        <v-card class="bg-sand flex-grow-1 d-flex flex-column" flat :border="0">
          <v-card-text class="flex-grow-1" style="overflow-y: auto;" :border="0">
            <v-container fluid>
              <v-row>
                <v-col cols="12">
                  <v-card class="bg-surface" variant="outlined">
                    <v-card-title class="text-secondary">Notification Tests</v-card-title>
                    <v-card-text>
                      <v-btn @click="testSuccess" variant="outlined">Test Success</v-btn>
                      <v-btn @click="testInfo" variant="outlined">Test Info</v-btn>
                      <v-btn @click="testWarning" variant="outlined">Test Warning</v-btn>
                      <v-btn @click="testError" variant="outlined">Test Error (with Copy)</v-btn>
                      <v-btn @click="testClearAll" variant="outlined">Clear All</v-btn>
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
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import useNotify from '@/composables/useNotify';

const route = useRoute();
const notify = useNotify();
const pageModel = ref(null);
const pageData = ref(null);

const pageMetaData = {
  title: "Notification Test"
};

const testSuccess = () => {
  notify.success("Success notification test message");
};

const testInfo = () => {
  notify.info("Info notification test message");
};

const testWarning = () => {
  notify.warning("Warning notification test message");
};

const testError = () => {
  notify.error("Error notification test message - click copy icon to test clipboard functionality");
};

const testClearAll = () => {
  notify.clearAll();
};

onMounted(() => {
  pageData.value = pageMetaData;
  if (pageData.value?.title) {
    document.title = pageData.value.title;
  }
});
</script>

<style scoped>
/* Add any specific styles for your dynamic page view */
</style>