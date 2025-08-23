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
                    <v-card-title class="text-secondary">Firestore Document Viewer</v-card-title>
                    <v-card-text>
                      <v-row>
                        <v-col cols="12" md="4">
                          <v-select
                            v-model="selectedProject"
                            :items="projectOptions"
                            item-title="label"
                            item-value="value"
                            label="Project"
                            variant="outlined"
                            density="compact"
                            :disabled="loading || projectLoading"
                            @update:model-value="onProjectChange"
                          />
                        </v-col>
                        <v-col cols="12" md="4">
                          <v-select
                            v-model="selectedCollection"
                            :items="collectionOptions"
                            item-title="label"
                            item-value="value"
                            label="Collection"
                            variant="outlined"
                            density="compact"
                            :disabled="loading || !selectedProject || collectionsLoading"
                            no-data-text="Select a project first"
                          />
                        </v-col>
                        <v-col cols="12" md="4">
                          <v-text-field
                            v-model="documentId"
                            label="Document ID"
                            variant="outlined"
                            density="compact"
                            :disabled="loading"
                            @keyup.enter="fetchDocument"
                          />
                        </v-col>
                      </v-row>
                      
                      <v-row>
                        <v-col cols="12" class="d-flex justify-end">
                          <v-btn
                            color="primary"
                            @click="fetchDocument"
                            :loading="loading"
                            :disabled="!selectedProject || !selectedCollection || !documentId"
                          >
                            Fetch Document
                          </v-btn>
                        </v-col>
                      </v-row>

                      <v-divider class="my-4" />

                      <v-card v-if="jsonData" class="bg-surface" variant="outlined">
                        <v-toolbar flat color="transparent">
                          <v-toolbar-title class="text-secondary">Document Data</v-toolbar-title>
                          <v-spacer />
                          <v-btn
                            color="secondary"
                            @click="copyJson"
                            prepend-icon="mdi-content-copy"
                          >
                            Copy JSON
                          </v-btn>
                        </v-toolbar>
                        <v-card-text>
                          <v-card variant="outlined">
                            <v-code tag="pre" class="pa-4"><code>{{ formattedJson }}</code></v-code>
                          </v-card>
                        </v-card-text>
                      </v-card>

                      <div v-else-if="!loading" class="text-center pa-4 text-grey-lighten-1">
                        <v-icon size="48">mdi-text-box-search-outline</v-icon>
                        <p class="mt-2">Select project, collection, and ID to fetch a document.</p>
                      </div>

                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12">
                  <v-card class="bg-surface" variant="outlined">
                    <v-card-title class="text-secondary">Replace Document Content</v-card-title>
                    <v-card-text>
                      <v-row>
                        <v-col cols="12" md="4">
                          <v-select
                            v-model="replaceProject"
                            :items="projectOptions"
                            item-title="label"
                            item-value="value"
                            label="Project"
                            variant="outlined"
                            density="compact"
                            :disabled="replaceLoading || projectLoading"
                            @update:model-value="onReplaceProjectChange"
                          />
                        </v-col>
                        <v-col cols="12" md="4">
                          <v-select
                            v-model="replaceCollection"
                            :items="replaceCollectionOptions"
                            item-title="label"
                            item-value="value"
                            label="Collection"
                            variant="outlined"
                            density="compact"
                            :disabled="replaceLoading || !replaceProject || replaceCollectionsLoading"
                            no-data-text="Select a project first"
                          />
                        </v-col>
                        <v-col cols="12" md="4">
                          <v-text-field
                            v-model="replaceDocumentId"
                            label="Document ID"
                            variant="outlined"
                            density="compact"
                            :disabled="replaceLoading"
                          />
                        </v-col>
                      </v-row>
                      
                      <v-textarea
                        v-model="replaceJsonContent"
                        label="New JSON Content"
                        variant="outlined"
                        rows="10"
                        auto-grow
                        :disabled="replaceLoading"
                        placeholder='{ "key": "value", "anotherKey": true }'
                      />
                      
                      <v-row>
                        <v-col cols="12" class="d-flex justify-end">
                          <v-btn
                            color="primary"
                            @click="replaceDocument"
                            :loading="replaceLoading"
                            :disabled="!replaceProject || !replaceCollection || !replaceDocumentId || !replaceJsonContent"
                          >
                            Replace Document
                          </v-btn>
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
//import multiProjectDAL from '@/dal/multiProjectDal';

const route = useRoute();
const notify = useNotify();
const pageModel = ref(null);
const pageData = ref(null);

const pageMetaData = {
  title: "Data Viewer"
};

// Available projects
const projectOptions = ref([
  { label: 'Business Data', value: 'bizData' },
  { label: 'Business Trends', value: 'bizTrends' },
  { label: 'Operational', value: 'operational' },
  { label: 'Audit', value: 'audit' }
]);

// Viewer state
const selectedProject = ref('');
const selectedCollection = ref('');
const documentId = ref('');
const jsonData = ref(null);
const loading = ref(false);
const projectLoading = ref(false);
const collectionsLoading = ref(false);
const collectionOptions = ref([]);

// Replacer state  
const replaceProject = ref('');
const replaceCollection = ref('');
const replaceDocumentId = ref('');
const replaceJsonContent = ref('');
const replaceLoading = ref(false);
const replaceCollectionsLoading = ref(false);
const replaceCollectionOptions = ref([]);

const formattedJson = computed(() => {
  return jsonData.value ? JSON.stringify(jsonData.value, null, 2) : '';
});

const loadCollections = async (projectId) => {
  try {
    // Switch to operational to get collections metadata
    await multiProjectDAL.switchToProject('operational');
    
    // Get all documents from collections
    const allProjectDocs = await multiProjectDAL.getAllItems('collections');
    
    // Find the document where projectId matches
    const projectDoc = allProjectDocs.find(doc => doc.projectId === projectId);
    
    if (projectDoc && projectDoc.collections) {
      const mappedCollections = projectDoc.collections.map(col => ({
        label: col.collectionLabel,
        value: col.collectionName
      }));
      return mappedCollections;
    } else {
      notify.warning(`No collections metadata found for project: ${projectId}`);
      return [];
    }
  } catch (error) {
    console.error('Error loading collections:', error);
    notify.error(`Failed to load collections for project: ${projectId}`);
    return [];
  }
};

const onProjectChange = async (projectId) => {
  if (!projectId) {
    collectionOptions.value = [];
    selectedCollection.value = '';
    return;
  }
  
  collectionsLoading.value = true;
  selectedCollection.value = '';
  
  try {
    collectionOptions.value = await loadCollections(projectId);
  } finally {
    collectionsLoading.value = false;
  }
};

const onReplaceProjectChange = async (projectId) => {
  if (!projectId) {
    replaceCollectionOptions.value = [];
    replaceCollection.value = '';
    return;
  }
  
  replaceCollectionsLoading.value = true;
  replaceCollection.value = '';
  
  try {
    replaceCollectionOptions.value = await loadCollections(projectId);
  } finally {
    replaceCollectionsLoading.value = false;
  }
};

const fetchDocument = async () => {
  if (!selectedProject.value || !selectedCollection.value || !documentId.value) {
    notify.warning('Please select project, collection, and enter document ID.');
    return;
  }
  
  loading.value = true;
  jsonData.value = null;
  
  try {
    // Switch to target project
    await multiProjectDAL.switchToProject(selectedProject.value);
    const result = await multiProjectDAL.getItemById(selectedCollection.value, documentId.value);
    
    if (result) {
      jsonData.value = result;
      notify.success('Document loaded successfully.');
    } else {
      notify.error(`Document not found in '${selectedCollection.value}' with ID '${documentId.value}'.`);
    }
  } catch (error) {
    console.error('Error fetching document:', error);
    notify.error(error.message || 'An unexpected error occurred while fetching the document.');
  } finally {
    // Switch back to operational
    try {
      await multiProjectDAL.switchToProject('operational');
    } catch (switchError) {
      console.error('Error switching back to operational:', switchError);
    }
    loading.value = false;
  }
};

const copyJson = async () => {
  if (!formattedJson.value) {
    notify.warning('There is no data to copy.');
    return;
  }
  
  try {
    await navigator.clipboard.writeText(formattedJson.value);
    notify.info('JSON copied to clipboard.');
  } catch (err) {
    console.error('Failed to copy text: ', err);
    notify.error('Failed to copy JSON to clipboard.');
  }
};

const replaceDocument = async () => {
  if (!replaceProject.value || !replaceCollection.value || !replaceDocumentId.value || !replaceJsonContent.value) {
    notify.warning('Please provide project, collection, ID, and JSON content.');
    return;
  }

  replaceLoading.value = true;
  let newJsonData;

  // Validate JSON format
  try {
    newJsonData = JSON.parse(replaceJsonContent.value);
  } catch (error) {
    console.error("JSON Parsing Error:", error);
    notify.error('Invalid JSON format. Please check the syntax and try again.');
    replaceLoading.value = false;
    return;
  }
  
  try {
    // Switch to target project
    await multiProjectDAL.switchToProject(replaceProject.value);
    await multiProjectDAL.setItem(replaceCollection.value, replaceDocumentId.value, newJsonData, false);
    
    notify.success('Document replaced successfully.');
    // Clear inputs on success
    replaceProject.value = '';
    replaceCollection.value = '';
    replaceDocumentId.value = '';
    replaceJsonContent.value = '';
    replaceCollectionOptions.value = [];
  } catch (error) {
    console.error('Error replacing document:', error);
    notify.error(error.message || 'An unexpected error occurred while replacing the document.');
  } finally {
    // Switch back to operational
    try {
      await multiProjectDAL.switchToProject('operational');
    } catch (switchError) {
      console.error('Error switching back to operational:', switchError);
    }
    replaceLoading.value = false;
  }
};

onMounted(() => {
  pageData.value = pageMetaData;
  if (pageData.value?.title) {
    document.title = pageData.value.title;
  }
});
</script>

<style scoped>
.v-code > code {
  white-space: pre-wrap;
  word-break: break-all;
}
</style>