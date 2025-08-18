<template>
  <v-app>
   
    <AppHeader />
    <LeftSidebar />
    <RightSidebar />
    
    <v-main class="d-flex flex-column">
      <v-sheet 
        class="flex-grow-1 d-flex flex-column pl-2 pr-2 pb-2 pt-3" 
        color="transparent" 
        style="min-height: 0;"
      >
      <router-view />
      </v-sheet>
    </v-main>
  </v-app>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import useAuth from '@/composables/useAuth'
import AppHeader from '@/components/layout/AppHeader.vue'
import LeftSidebar from '@/components/layout/LeftSidebar.vue'
import RightSidebar from '@/components/layout/RightSidebar.vue'

const router = useRouter()
const route = useRoute()
const { isAuthenticated, isLoading, storeRedirectPage } = useAuth()

/*
onMounted(() => {
  // Check auth state once on mount - no watchers needed
  if (!isLoading.value && !isAuthenticated.value) {
    // Store current page for redirect after login
    storeRedirectPage(route.fullPath)
    router.push('/login')
  }
})
*/

onMounted(() => {
  console.log('Layout guard - Auth state:', {
    isAuthenticated: isAuthenticated.value,
    isLoading: isLoading.value,
    currentUser: currentUser.value?.email
  });
  
  if (!isLoading.value && !isAuthenticated.value) {
    console.log('Layout guard - Redirecting to login, storing:', route.fullPath);
    storeRedirectPage(route.fullPath)
    router.push('/login')
  } else {
    console.log('Layout guard - User authenticated, allowing access');
  }
})
</script>