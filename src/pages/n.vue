<route lang="yaml">
    meta:
      layout: app
    </route>
    <template>
    <v-sheet class="flex-grow-1 d-flex flex-column" flat rounded color="transparent">
      <v-row class="flex-grow-1 ma-0">
        <v-col class="d-flex flex-column pa-0">
          <v-card class="flex-grow-1 d-flex flex-column card-surface-dark" flat>
            <v-toolbar color="primary" dark flat density="compact">
              <v-toolbar-title>
                {{ pageData?.title || 'Default Title' }}
              </v-toolbar-title>
            </v-toolbar>
  
            <v-card-text class="flex-grow-1" style="overflow-y: auto;">
              
              <v-container fluid>
      <v-card border="primary thin" variant="outlined">
        <v-toolbar color="secondary" dark>
          <v-toolbar-title>Manage Sites</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn color="white" outlined @click="openAddDialog">
            <v-icon left>mdi-plus</v-icon>
            Add Site
          </v-btn>
        </v-toolbar>
  
        <v-card-text>
          <v-data-table
            :headers="headers"
            :items="formattedSites"
            :loading="isLoading"
            :search="search"
            item-key="id"
            flat
            density="compact"
          >
            <template v-slot:top>
              <v-text-field
                v-model="search"
                label="Search sites..."
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="compact"
                single-line
                hide-details
                clearable
                class="mb-4"
              ></v-text-field>
            </template>
            <template v-slot:item.name="{ item }">
              <a :href="`http://localhost:${item.port || 'unknown'}`" target="_blank" style="color: inherit; text-decoration: underline;">
                {{ item.name }}
              </a>
            </template>
            <template v-slot:item.actions="{ item }">
              <v-btn 
                color="secondary" 
                variant="flat" 
                size="small" 
                @click="openEditDialog(item)"
              >
                edit
              </v-btn>
            </template>
            <template v-slot:no-data>
              <v-alert :value="true" color="info" icon="mdi-information-outline">
                No sites found. Click "Add Site" to create one.
              </v-alert>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
  
      <v-dialog v-model="dialog" persistent max-width="600px">
        <v-card>
          <v-card-title>
            <span class="text-h5">{{ isNew ? 'Add New Site' : 'Edit Site' }}</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="editedItem.name"
                    label="Site Name*"
                    required
                    variant="outlined"
                    :rules="[rules.required]"
                    density="compact"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="editedItem.basePath"
                    label="Base path"
                    variant="outlined"
                    required
                    :rules="[rules.required]"
                    density="compact"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-select
                    v-model="editedItem.type"
                    :items="siteTypes"
                    label="Site Type*"
                    variant="outlined"
                    required
                    :rules="[rules.required]"
                    density="compact"
                  ></v-select>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="editedItem.port"
                    label="Port*"
                    required
                    variant="outlined"
                    :rules="[rules.required]"
                    density="compact"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="editedItem.description"
                    label="Description"
                    variant="outlined"
                    hint="Optional: address or notes about the site"
                    rows="3"
                    density="compact"
                  ></v-textarea>
                </v-col>
              </v-row>
            </v-container>
            <small>*indicates required field</small>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="closeDialog">Cancel</v-btn>
            <v-btn color="blue darken-1" text @click="saveSite" :disabled="!isFormValid">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  
  
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-sheet>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, } from 'vue';
  const pageMetaData = {
  title: "Site Manager"
}

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