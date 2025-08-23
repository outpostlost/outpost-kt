<template>
  <v-app>
   
    <AppHeader />
    <LeftSidebar />
    <RightSidebar />
    
    <v-main class="d-flex flex-column">
      <v-sheet 
        class="flex-grow-1 d-flex flex-column  pr-6 pb-6 pt-2" 
        color="surface" 
        style="min-height: 0;"
      >
      <router-view />
      </v-sheet>
    </v-main>
  </v-app>
</template>

<script setup>
import { onMounted, watchEffect } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import useAuth from '@/composables/useAuth';
import AppHeader from '@/components/layout/AppHeader.vue';
import LeftSidebar from '@/components/layout/LeftSidebar.vue';
import RightSidebar from '@/components/layout/RightSidebar.vue';
import { useLayoutStore } from '@/stores/useLayoutStore'; // Import the new store

const router = useRouter();
const route = useRoute();
const { isAuthenticated, isLoading, storeRedirectPage } = useAuth();
const layoutStore = useLayoutStore(); // Instantiate the store

// Fetch the dynamic menu when the layout component is mounted
onMounted(() => {
  layoutStore.fetchAppMenu();
});

watchEffect(() => {
  // Only runs when auth state actually changes
  if (!isLoading.value && !isAuthenticated.value) {
    console.log('Layout - Auth state changed, redirecting from:', route.fullPath);
    storeRedirectPage(route.fullPath);
    router.push('/login');
  }
});
</script>