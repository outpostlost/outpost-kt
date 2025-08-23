<template>
  <v-navigation-drawer
    v-model="layoutStore.rightDrawerOpen"
    location="right"
    temporary
    width="300"
  >
    <v-sheet class="d-flex flex-column h-100" color="transparent">
      <v-toolbar density="compact" flat>
        <v-toolbar-title class="text-subtitle-1">
          {{ drawerTitle }}
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon="mdi-close" @click="layoutStore.closeRightDrawer"></v-btn>
      </v-toolbar>
      
      <v-divider></v-divider>

      <div class="flex-grow-1 pa-2">
        <SettingsWindow v-if="layoutStore.rightDrawerContent === 'settings'" />
        <QuickMenuWindow v-else-if="layoutStore.rightDrawerContent === 'quick-menu'" />
      </div>
    </v-sheet>
  </v-navigation-drawer>
</template>

<script setup>
import { computed } from 'vue';
import { useLayoutStore } from '@/stores/useLayoutStore';
import SettingsWindow from './right-sidebar/SettingsWindow.vue';
import QuickMenuWindow from './right-sidebar/QuickMenuWindow.vue';

const layoutStore = useLayoutStore();

const drawerTitle = computed(() => {
  switch (layoutStore.rightDrawerContent) {
    case 'settings':
      return 'Settings';
    case 'quick-menu':
      return 'Quick Menu';
    default:
      return '';
  }
});
</script>