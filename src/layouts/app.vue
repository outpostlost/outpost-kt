<template>
  <v-app>
    <!-- Always show authenticated layout - all auth mocked as true -->
    <AppHeader />
    <LeftSidebar />
    <RightSidebar />
    
    <v-main>
      <router-view />
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