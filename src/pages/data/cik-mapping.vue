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
                     <v-card-title class="text-secondary">CIK Update Process</v-card-title>
                     <v-card-text>
                       <v-btn 
                         color="primary" 
                         size="large"
                         :loading="isProcessing"
                         :disabled="isProcessing"
                         @click="startCIKUpdate"
                       >
                         {{ isProcessing ? 'Processing...' : 'Start CIK Update Process' }}
                       </v-btn>
                       
                       <v-alert 
                         v-if="isProcessing"
                         type="info"
                         class="mt-4"
                       >
                         Processing company records... This may take several minutes.
                       </v-alert>
                     </v-card-text>
                   </v-card>
                 </v-col>
               </v-row>

               <v-row v-if="isProcessing || progress.total > 0">
                 <v-col cols="6">
                   <v-card class="bg-surface" variant="outlined">
                     <v-card-title class="text-secondary">Progress</v-card-title>
                     <v-card-text>
                       <v-progress-linear
                         :model-value="progressPercentage"
                         height="20"
                         color="primary"
                         class="mb-4"
                       >
                         <template v-slot:default="{ value }">
                           <strong>{{ Math.ceil(value) }}%</strong>
                         </template>
                       </v-progress-linear>
                       
                       <v-list density="compact">
                         <v-list-item>
                           <v-list-item-title>Total Companies: {{ progress.total }}</v-list-item-title>
                         </v-list-item>
                         <v-list-item>
                           <v-list-item-title>Processed: {{ progress.processed }}</v-list-item-title>
                         </v-list-item>
                         <v-list-item>
                           <v-list-item-title>Matched: {{ progress.matched }}</v-list-item-title>
                         </v-list-item>
                         <v-list-item>
                           <v-list-item-title>Updated: {{ progress.updated }}</v-list-item-title>
                         </v-list-item>
                         <v-list-item v-if="progress.errors > 0">
                           <v-list-item-title class="text-error">Errors: {{ progress.errors }}</v-list-item-title>
                         </v-list-item>
                       </v-list>
                     </v-card-text>
                   </v-card>
                 </v-col>
                 
                 <v-col cols="6">
                   <v-card class="bg-surface" variant="outlined">
                     <v-card-title class="text-secondary">Current Status</v-card-title>
                     <v-card-text>
                       <v-chip 
                         :color="isProcessing ? 'orange' : 'green'"
                         variant="flat"
                         size="large"
                       >
                         {{ isProcessing ? 'In Progress' : 'Completed' }}
                       </v-chip>
                       
                       <v-alert 
                         v-if="!isProcessing && progress.total > 0"
                         type="success"
                         class="mt-4"
                       >
                         Process completed! Check results below.
                       </v-alert>
                     </v-card-text>
                   </v-card>
                 </v-col>
               </v-row>

               <v-row v-if="!isProcessing && skippedCompanies.length > 0">
                 <v-col cols="12">
                   <v-card class="bg-surface" variant="outlined">
                     <v-card-title class="text-secondary">
                       Skipped Companies ({{ skippedCompanies.length }})
                     </v-card-title>
                     <v-card-text>
                       <v-data-table
                         :headers="skippedHeaders"
                         :items="skippedCompanies"
                         density="compact"
                         :items-per-page="10"
                       >
                       </v-data-table>
                     </v-card-text>
                   </v-card>
                 </v-col>
               </v-row>

               <v-row v-if="!isProcessing && errorLog.length > 0">
                 <v-col cols="12">
                   <v-card class="bg-surface" variant="outlined">
                     <v-card-title class="text-error">
                       Errors ({{ errorLog.length }})
                     </v-card-title>
                     <v-card-text>
                       <v-expansion-panels>
                         <v-expansion-panel
                           v-for="(error, index) in errorLog"
                           :key="index"
                         >
                           <v-expansion-panel-title>
                             {{ error.company || error.stage }} - {{ error.ticker }}
                           </v-expansion-panel-title>
                           <v-expansion-panel-text>
                             <v-alert type="error" variant="outlined">
                               <strong>Error:</strong> {{ error.error }}<br>
                               <strong>Time:</strong> {{ error.timestamp }}
                             </v-alert>
                           </v-expansion-panel-text>
                         </v-expansion-panel>
                       </v-expansion-panels>
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
import useAuth from '@/composables/useAuth';
import { useTheme } from 'vuetify';
import useCIKUpdater from '@/composables/useCIKUpdater';

const PAGE_TITLE = 'CIK Mapping';

const route = useRoute();
const notify = useNotify();
const theme = useTheme();

const dynamicBgClass = computed(() => {
  return theme.current.value.dark ? 'bg-charcoal' : 'bg-parchment';
});

const dynamicHeaderClass = computed(() => {
  return theme.current.value.dark ? 'text-stone-gray' : 'text-secondary';
});

const { currentUser, updateUserEmail, updateUserPassword, logoutUser } = useAuth();

// CIK Updater composable
const {
  isProcessing,
  progress,
  skippedCompanies,
  errorLog,
  updateAllCIKs
} = useCIKUpdater();

// Progress percentage calculation
const progressPercentage = computed(() => {
  if (progress.value.total === 0) return 0;
  return (progress.value.processed / progress.value.total) * 100;
});

// Table headers for skipped companies
const skippedHeaders = [
  { title: 'Company', value: 'company', sortable: true },
  { title: 'Ticker', value: 'ticker', sortable: true },
  { title: 'Reason', value: 'reason', sortable: false },
  { title: 'Record ID', value: 'id', sortable: false }
];

// Page metadata
const pageMetaData = {
  title: "CIK Mapping - Outpost KT"
};

/**
 * Start the CIK update process
 */
async function startCIKUpdate() {
  console.log('User initiated CIK update process');
  await updateAllCIKs();
}

onMounted(() => {
  if (pageMetaData?.title) {
    document.title = pageMetaData.title;
  }
});
</script>

<style scoped>
/* Add any specific styles for CIK mapping page */
</style>