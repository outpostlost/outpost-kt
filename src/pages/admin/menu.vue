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
                           <v-card-title class="text-secondary">
                             Menu Administration
                             
                                <v-btn 
                                  color="primary" 
                                  @click="openAddDialog"
                                  
                                >
                                  Add Menu Item
                                </v-btn>
                             
                           </v-card-title>
                           <v-card-text>
                             <v-data-table
                               :headers="headers"
                               :items="menuItems"
                               :loading="loading"
                               density="compact"
                               :sort-by="[{ key: 'order', order: 'asc' }]"
                             >
                               <template v-slot:item.actions="{ item }">
                                 <v-btn
                                   icon="mdi-pencil"
                                   size="small"
                                   variant="text"
                                   @click="openEditDialog(item)"
                                 />
                                 <v-btn
                                   icon="mdi-delete"
                                   size="small"
                                   variant="text"
                                   color="error"
                                   @click="openDeleteDialog(item)"
                                 />
                               </template>
                             </v-data-table>
                           </v-card-text>
                   </v-card>
                   </v-col>     
               </v-row>
           </v-container>
           </v-card-text>
         </v-card>
       </v-col>
     </v-row>

     <!-- Add/Edit Dialog -->
     <v-dialog v-model="formDialog" max-width="600px">
       <v-card>
         <v-card-title>
           {{ isEditing ? 'Edit Menu Item' : 'Add Menu Item' }}
         </v-card-title>
         <v-card-text>
           <v-form ref="form">
             <v-text-field
               v-model="formData.title"
               label="Title"
               :error-messages="errors.title"
               required
             />
             <v-text-field
               v-model="formData.route"
               label="Route"
               :error-messages="errors.route"
               hint="Must start with '/'"
               required
             />
             <v-text-field
               v-model="formData.icon"
               label="Icon"
               :error-messages="errors.icon"
               hint="Material Design Icon (e.g., mdi-account)"
               required
             />
             <v-text-field
               v-model="formData.order"
               label="Order"
               type="number"
               :error-messages="errors.order"
               hint="Number for menu positioning"
               required
             />
           </v-form>
         </v-card-text>
         <v-card-actions>
           <v-spacer />
           <v-btn
             text
             @click="closeFormDialog"
             :disabled="saving"
           >
             Cancel
           </v-btn>
           <v-btn
             color="primary"
             @click="saveMenuItem"
             :loading="saving"
           >
             {{ isEditing ? 'Update' : 'Create' }}
           </v-btn>
         </v-card-actions>
       </v-card>
     </v-dialog>

     <!-- Delete Confirmation Dialog -->
     <v-dialog v-model="deleteDialog" max-width="400px">
       <v-card>
         <v-card-title>Confirm Delete</v-card-title>
         <v-card-text>
           Are you sure you want to delete the menu item "{{ itemToDelete?.title }}"?
         </v-card-text>
         <v-card-actions>
           <v-spacer />
           <v-btn
             text
             @click="closeDeleteDialog"
           >
             Cancel
           </v-btn>
           <v-btn
             color="error"
             @click="confirmDelete"
           >
             Delete
           </v-btn>
         </v-card-actions>
       </v-card>
     </v-dialog>
   </v-sheet>
 </template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import useNotify from '@/composables/useNotify';
import useMenuAdmin from '@/composables/useMenuAdmin';
import { useLayoutStore } from '@/stores/useLayoutStore';

const route = useRoute();
const notify = useNotify();
const layoutStore = useLayoutStore();

const {
  menuItems,
  loading,
  saving,
  formData,
  errors,
  loadMenuItems,
  clearForm,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  loadItemForEdit
} = useMenuAdmin();

// Dialog state
const formDialog = ref(false);
const deleteDialog = ref(false);
const itemToDelete = ref(null);

// Form state
const isEditing = computed(() => !!formData.id);

// Data table configuration
const headers = [
  { title: 'Title', key: 'title', sortable: true },
  { title: 'Route', key: 'route', sortable: true },
  { title: 'Icon', key: 'icon', sortable: true },
  { title: 'Order', key: 'order', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false }
];

const pageMetaData = {
  title: "Menu Administration"
};

// Dialog methods
const openAddDialog = () => {
  clearForm();
  formDialog.value = true;
};

const openEditDialog = (item) => {
  loadItemForEdit(item);
  formDialog.value = true;
};

const closeFormDialog = () => {
  formDialog.value = false;
  clearForm();
};

const openDeleteDialog = (item) => {
  itemToDelete.value = item;
  deleteDialog.value = true;
};

const closeDeleteDialog = () => {
  deleteDialog.value = false;
  itemToDelete.value = null;
};

// CRUD operations
const saveMenuItem = async () => {
  let success = false;
  
  if (isEditing.value) {
    success = await updateMenuItem();
  } else {
    success = await createMenuItem();
  }
  
  if (success) {
    formDialog.value = false;
    // Refresh the layout store menu items
    layoutStore.appMenuItems = [];
    await layoutStore.fetchAppMenu();
  }
};

const confirmDelete = async () => {
  if (itemToDelete.value) {
    const success = await deleteMenuItem(itemToDelete.value.id);
    if (success) {
      deleteDialog.value = false;
      itemToDelete.value = null;
      // Refresh the layout store menu items
      layoutStore.appMenuItems = [];
      await layoutStore.fetchAppMenu();
    }
  }
};

onMounted(async () => {
  if (pageMetaData?.title) {
    document.title = pageMetaData.title;
  }
  await loadMenuItems();
});
</script>

<style scoped>
/* Add any specific styles for your dynamic page view */
</style>