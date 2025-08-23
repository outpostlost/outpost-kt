<template>
  <v-app-bar app fixed dense color="surface" :class="[dynamicHeaderClass]" elevation="0" >
    <v-btn icon="mdi-menu" @click="layoutStore.toggleLeftDrawer" class="mr-2"></v-btn>
    <v-app-bar-title>Outpost KT
    </v-app-bar-title>

    <template v-if="!appStore.searchActive">
      <v-btn text>Link 1</v-btn>
      <v-btn text>Link 2</v-btn>
      <v-btn text>Link 3</v-btn>
      <v-btn text>Link 4</v-btn>
    </template>

    <v-text-field
      v-if="appStore.searchActive"
      ref="searchFieldRef"
      v-model="appStore.searchText"
      @keyup.enter="appStore.handleSearchSubmit"
      density="compact"
      variant="solo-filled"
      rounded
      placeholder="Search..."
      hide-details
      autofocus
      class="mx-4 search-field"
    ></v-text-field>

    <v-spacer></v-spacer>

    <v-btn icon="mdi-magnify" @click="appStore.toggleSearch"></v-btn>
    <v-btn icon="mdi-menu" @click="layoutStore.toggleRightDrawer('quick-menu')"></v-btn>
    <v-btn icon="mdi-cog" @click="layoutStore.toggleRightDrawer('settings')"></v-btn>
    <v-btn 
      icon="mdi-account-circle-outline"
      to="/account"
    ></v-btn>
    <v-btn icon="mdi-logout-variant" @click="handleLogout"></v-btn>
  </v-app-bar>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router'; // Imported useRouter for logout
import { useAppStore } from '@/stores/app'; // Kept for search functionality
import { useLayoutStore } from '@/stores/useLayoutStore'; // Added new layout store
import useAuth from '@/composables/useAuth';
import { useTheme } from 'vuetify';

const appStore = useAppStore(); 
const layoutStore = useLayoutStore(); // Instantiate the new store
const router = useRouter(); // Instantiate router for navigation
const searchFieldRef = ref(null);

const { logoutUser } = useAuth();
const theme = useTheme();

const dynamicHeaderClass = computed(() => {
  return theme.current.value.dark ? 'text-sand' : 'text-primary';
});

// Handle logout
const handleLogout = async () => {
  const result = await logoutUser();
  if (result.success) {
    router.replace('/login'); // Use replace instead of push
  }
};
</script>

<style scoped>
.search-field {
  max-width: 400px;
}
</style>