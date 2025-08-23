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
              <v-row v-for="(row, rowIndex) in cardRows" :key="rowIndex">
                <v-col 
                  v-for="(card, colIndex) in row" 
                  :key="colIndex"
                  cols="2"
                >
                  <v-card
                    v-if="card"
                    :class="`bg-${card.colorName}`"
                    :title="card.label"
                    :text="card.description"
                    :prepend-icon="card.icon"
                    append-icon="mdi-open-in-new"
                    variant="flat"
                    height="150"
                    @click="navigateToPath(card.path)"
                    style="cursor: pointer;"
                  >
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
import { useRouter } from 'vue-router';
import useNotify from '@/composables/useNotify';
//import multiProjectDAL from '@/dal/multiProjectDal';

const router = useRouter();
const notify = useNotify();

// Configuration constants - easily changeable for different pages
const PAGE_DOC_ID = '1ew8gHo2lsqUHiDrQVlL';
const PAGE_TITLE = 'Test Section';

const pageData = ref(null);
const links = ref([]);

// Computed property to organize links into rows of 6
const cardRows = computed(() => {
  if (!links.value.length) return [];
  
  const rows = [];
  const itemsPerRow = 6;
  
  for (let i = 0; i < links.value.length; i += itemsPerRow) {
    const row = [];
    
    // Add actual cards
    for (let j = 0; j < itemsPerRow; j++) {
      const linkIndex = i + j;
      if (linkIndex < links.value.length) {
        row.push(links.value[linkIndex]);
      } else {
        row.push(null); // Empty slot
      }
    }
    
    rows.push(row);
  }
  
  return rows;
});

const fetchPageData = async () => {
  try {
    // Ensure we're using the operational project
    await multiProjectDAL.switchToProject('operational');
    
    const data = await multiProjectDAL.getItemById('adminMainPages', PAGE_DOC_ID);
    
    if (data && data.links) {
      pageData.value = data;
      links.value = data.links;
    } else {
      console.warn('No links found in page data');
      links.value = [];
    }
  } catch (error) {
    console.error('Error fetching page data:', error);
    notify.error('Failed to load page navigation data');
    links.value = [];
  }
};

const navigateToPath = (path) => {
  if (path) {
    router.push(path);
  }
};

onMounted(async () => {
  document.title = PAGE_TITLE;
  await fetchPageData();
});
</script>

<style scoped>
/* Add any specific styles for your dynamic page view */
</style>