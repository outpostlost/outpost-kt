<template>
  <v-app>
    <!-- Always show authenticated layout - all auth mocked as true -->
    <AppHeader />
    <LeftSidebar />
    <RightSidebar />
    
    <v-main class="d-flex flex-column">
      <v-sheet 
        class="flex-grow-1 d-flex flex-column pl-2 pr-2 pb-2" 
        color="transparent" 
        style="min-height: 0;"
      >
      <router-view />
      </v-sheet>
    </v-main>
  </v-app>
</template>

<script setup>
import AppHeader from '@/components/layout/AppHeader.vue'
import LeftSidebar from '@/components/layout/LeftSidebar.vue'
import RightSidebar from '@/components/layout/RightSidebar.vue'

// No auth imports, no auth composables, no auth logic
// Simply render the authenticated layout directly
// All the complex conditional auth logic from the original has been removed
</script>