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
              <v-row v-for="(row, rowIndex) in cardRows" :key="rowIndex">
                <v-col 
                  v-for="(card, colIndex) in row" 
                  :key="colIndex"
                  cols="2"
                >
                  <v-card
                    v-if="card && card.colorType === 'system'"
                    :color="card.colorName"
                    :title="card.label"
                    :text="card.hexCode"
                    variant="flat"
                    height="150"
                  >
                  </v-card>
                  <v-card
                    v-else-if="card && card.colorType === 'custom'"
                    :class="`bg-${card.colorName}`"
                    :title="card.label"
                    :text="card.hexCode"
                    variant="flat"
                    height="150"
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
import useNotify from '@/composables/useNotify';
//import multiProjectDAL from '@/dal/multiProjectDal';
import { useTheme } from 'vuetify';

const notify = useNotify();

// Configuration constants
const PALETTE_DOC_ID = 'z0fy51ojWOcZCpnawbtU';
const PAGE_TITLE = 'Palette Colors';

const paletteData = ref(null);
const colors = ref([]);

const theme = useTheme();

const dynamicBgClass = computed(() => {
  return theme.current.value.dark ? 'bg-charcoal' : 'bg-parchment';
});



const dynamicHeaderClass = computed(() => {
  return theme.current.value.dark ? 'text-stone-gray' : 'text-secondary';
});

// Computed property to organize colors into rows of 6
const cardRows = computed(() => {
  if (!colors.value.length) return [];
  
  const rows = [];
  const itemsPerRow = 6;
  
  for (let i = 0; i < colors.value.length; i += itemsPerRow) {
    const row = [];
    
    // Add actual cards
    for (let j = 0; j < itemsPerRow; j++) {
      const colorIndex = i + j;
      if (colorIndex < colors.value.length) {
        row.push(colors.value[colorIndex]);
      } else {
        row.push(null); // Empty slot
      }
    }
    
    rows.push(row);
  }
  
  return rows;
});

const fetchPaletteData = async () => {
  try {
    // Ensure we're using the operational project
    await multiProjectDAL.switchToProject('operational');
    
    const data = await multiProjectDAL.getItemById('adminColorPalette', PALETTE_DOC_ID);
    
    if (data && data.colors) {
      paletteData.value = data;
      colors.value = data.colors;
    } else {
      console.warn('No colors found in palette data');
      colors.value = [];
    }
  } catch (error) {
    console.error('Error fetching palette data:', error);
    notify.error('Failed to load color palette data');
    colors.value = [];
  }
};

onMounted(async () => {
  document.title = PAGE_TITLE;
  await fetchPaletteData();
});
</script>

<style scoped>
/* Add any specific styles for your dynamic page view */
</style>