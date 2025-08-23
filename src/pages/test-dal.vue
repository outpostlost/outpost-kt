<template>
  <v-container fluid>
    <h1 class="text-h4 mb-4">DAL Refactor Test Page 4</h1>
    <v-row>
      <v-col cols="12" md="6">
        <v-card variant="outlined">
          <v-card-title>Controls</v-card-title>
          <v-card-text>
            <v-radio-group v-model="pageModel.selectedProject" label="Target Project" inline>
              <v-radio v-for="project in projects" :key="project" :label="project" :value="project"></v-radio>
            </v-radio-group>
            <v-text-field v-model="pageModel.collectionName" label="Collection Name" variant="outlined" density="compact" class="mb-4"></v-text-field>
            <v-text-field v-model="pageModel.documentId" label="Document ID (for Get/Update/Set/Delete)" variant="outlined" density="compact" class="mb-4"></v-text-field>
            <v-textarea v-model="pageModel.dataPayload" label="Data Payload (JSON for Add/Update/Set)" variant="outlined" auto-grow rows="5" :error-messages="jsonError ? [jsonError] : []"></v-textarea>
          </v-card-text>
        </v-card>

        <v-card variant="outlined" class="mt-4">
          <v-card-title>Actions</v-card-title>
          <v-card-text>
            <v-btn @click="handleGetAllItems" color="primary" class="mr-2 mb-2">Get All Items</v-btn>
            <v-btn @click="handleGetItemById" color="primary" class="mr-2 mb-2" :disabled="!pageModel.documentId">Get Item by ID</v-btn>
            <v-btn @click="handleAddItem" color="secondary" class="mr-2 mb-2" :disabled="!parsedPayload">Add Item</v-btn>
            <v-btn @click="handleSetItem" color="secondary" class="mr-2 mb-2" :disabled="!pageModel.documentId || !parsedPayload">Set Item (Overwrite)</v-btn>
            <v-btn @click="handleUpdateItem" color="secondary" class="mr-2 mb-2" :disabled="!pageModel.documentId || !parsedPayload">Update Item (Merge)</v-btn>
            <v-btn @click="handleDeleteDocument" color="error" class="mr-2 mb-2" :disabled="!pageModel.documentId">Delete Document</v-btn>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card variant="outlined">
          <v-card-title class="d-flex align-center">
            API Response
            <v-progress-circular v-if="pageModel.loading" indeterminate color="primary" size="20" class="ml-4"></v-progress-circular>
          </v-card-title>
          <v-card-text>
            <pre>{{ pageModel.apiResponse }}</pre>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import useNotify from '@/composables/useNotify';
import multiProjectDAL from '@/dal/multiProjectDal';

const notify = useNotify();

const projects = ['operational', 'bizData', 'bizTrends', 'audit'];

const pageModel = reactive({
  selectedProject: 'operational',
  collectionName: 'users',
  documentId: '',
  dataPayload: JSON.stringify({ name: 'Test User', role: 'tester' }, null, 2),
  apiResponse: 'No request sent yet.',
  loading: false,
});

const jsonError = ref('');
const parsedPayload = computed(() => {
  jsonError.value = '';
  if (!pageModel.dataPayload) return null;
  try {
    return JSON.parse(pageModel.dataPayload);
  } catch (e) {
    jsonError.value = 'Invalid JSON in data payload.';
    return null;
  }
});

watch(() => pageModel.selectedProject, (newProject) => {
  if (newProject) {
    multiProjectDAL.switchToProject(newProject);
    notify.info(`Switched to '${newProject}' project context.`);
  }
});

async function executeDalAction(action) {
  pageModel.loading = true;
  pageModel.apiResponse = 'Loading...';
  try {
    const result = await action();
    pageModel.apiResponse = JSON.stringify(result, null, 2);
    notify.success('DAL action completed successfully.');
  } catch (error) {
    pageModel.apiResponse = `Error: ${error.message}\n\n${JSON.stringify(error, null, 2)}`;
    notify.error('DAL action failed. See response for details.');
  } finally {
    pageModel.loading = false;
  }
}

const handleGetAllItems = () => {
  executeDalAction(() => multiProjectDAL.getAllItems(pageModel.collectionName));
};

const handleGetItemById = () => {
  executeDalAction(() => multiProjectDAL.getItemById(pageModel.collectionName, pageModel.documentId));
};

const handleAddItem = () => {
  executeDalAction(() => multiProjectDAL.addItem(pageModel.collectionName, parsedPayload.value));
};

const handleSetItem = () => {
  executeDalAction(() => multiProjectDAL.setItem(pageModel.collectionName, pageModel.documentId, parsedPayload.value));
};

const handleUpdateItem = () => {
  executeDalAction(() => multiProjectDAL.updateItem(pageModel.collectionName, pageModel.documentId, parsedPayload.value));
};

const handleDeleteDocument = () => {
  executeDalAction(() => multiProjectDAL.deleteDocument(pageModel.collectionName, pageModel.documentId));
};
</script>

<style scoped>
pre {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 10px;
  border-radius: 4px;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>