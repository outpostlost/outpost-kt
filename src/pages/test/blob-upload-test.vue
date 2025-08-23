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
                           <v-card-title class="text-secondary">Blob Upload Test</v-card-title>
                           <v-card-text>
                                
                              <v-form @submit.prevent="handleSubmit">
                                <v-file-input
                                  v-model="selectedFile"
                                  label="Select File"
                                  variant="outlined"
                                  required
                                />
                                
                                <v-text-field
                                  v-model="formData.fileName"
                                  label="File Name"
                                  variant="outlined"
                                  required
                                />
                                
                                <v-text-field
                                  v-model="formData.description"
                                  label="Description"
                                  variant="outlined"
                                  required
                                />
                                
                                <v-text-field
                                  v-model="formData.source"
                                  label="Source"
                                  variant="outlined"
                                  required
                                />
                                
                                <v-text-field
                                  v-model="formData.url"
                                  label="URL"
                                  variant="outlined"
                                />
                                
                                <v-textarea
                                  v-model="formData.notes"
                                  label="Notes (Optional)"
                                  variant="outlined"
                                />
                                
                                <v-btn
                                  type="submit"
                                  color="primary"
                                  :loading="isUploading"
                                  :disabled="!selectedFile || !formData.fileName || !formData.description || !formData.source"
                                >
                                  Upload File
                                </v-btn>
                              </v-form>

                           </v-card-text>
                   </v-card>
                   </v-col>
               </v-row>
               
               <v-row v-if="uploadResult">
                   <v-col cols="12">
                       <v-card class="bg-surface" variant="outlined">
                               <v-card-title class="text-secondary">Upload Success</v-card-title>
                               <v-card-text>
                                    
                               <v-text-field
                                 label="Blob URL"
                                 :model-value="uploadResult.blobUrl"
                                 readonly
                                 variant="outlined"
                               />
                               
                               <v-text-field
                                 label="Document ID"
                                 :model-value="uploadResult.documentId"
                                 readonly
                                 variant="outlined"
                               />
                               
                               <v-text-field
                                 label="File Size"
                                 :model-value="formatFileSize(uploadResult.fileSize)"
                                 readonly
                                 variant="outlined"
                               />
                               
                               <v-text-field
                                 label="File Type"
                                 :model-value="uploadResult.fileType"
                                 readonly
                                 variant="outlined"
                               />

                               </v-card-text>
                       </v-card>
                   </v-col>
               </v-row>
               
               <v-row v-if="uploadError">
                   <v-col cols="12">
                       <v-card class="bg-surface" variant="outlined">
                               <v-card-title class="text-secondary">Upload Error</v-card-title>
                               <v-card-text>
                                    
                               <v-alert type="error">
                                 {{ uploadError }}
                               </v-alert>

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
import useBlobUpload from '@/composables/useBlobUpload';

const { isUploading, uploadResult, uploadError, uploadFile, resetUpload } = useBlobUpload();

const selectedFile = ref(null);
const formData = ref({
  fileName: '',
  description: '',
  source: '',
  url: '',
  notes: ''
});

const pageMetaData = {
  title: "Blob Upload Test"
};

const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} bytes`;
  return `${Math.round(bytes / 1024)} KB`;
};

const handleSubmit = async () => {
  if (!selectedFile.value) return;
  
  try {
    await uploadFile(selectedFile.value, formData.value);
  } catch (error) {
    console.error('Upload failed:', error);
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