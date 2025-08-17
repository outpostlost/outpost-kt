<template>
    <v-app-bar app fixed dense color="primary" elevation="0">
      <v-container class="pa-0 d-flex align-center" style="max-width: 1300px;">
      <v-app-bar-title>Lost Creek</v-app-bar-title>
  
      <template v-if="!searchActive">
        <v-menu open-on-hover elevation="0">
          <template v-slot:activator="{ props }">
            <v-btn class="text-none" size="large" v-bind="props"> AI Services </v-btn>
          </template>
  
          <v-list density="compact" elevation="0" border>
            <v-list-item to="/ai-consulting" class="text-none"> 
              <v-list-item-title>AI Consulting</v-list-item-title>
              <v-list-item-subtitle>Placeholder subtitle for AI Consulting</v-list-item-subtitle>
            </v-list-item>
            <v-list-item to="/training-experimentation" class="text-none"> 
              <v-list-item-title>Training & Experimentation</v-list-item-title>
              <v-list-item-subtitle>Placeholder subtitle for Training & Experimentation</v-list-item-subtitle>
            </v-list-item>
            <v-list-item to="/ai-applications" class="text-none"> 
              <v-list-item-title>AI Applications</v-list-item-title>
              <v-list-item-subtitle>Placeholder subtitle for AI Applications</v-list-item-subtitle>
            </v-list-item>
             <v-list-item to="/ai-augmented-data" class="text-none"> 
              <v-list-item-title>AI Augmented Data</v-list-item-title>
              <v-list-item-subtitle>Placeholder subtitle for AI Augmented Data</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-menu>
        <v-btn text class="text-none" size="large" to="/about-us">About Us</v-btn>
        <v-btn text class="text-none" size="large" to="/contact-us">Contact Us</v-btn>
        <v-btn text class="text-none" size="large" to="/resources">Resources</v-btn>
      </template>
  
      <v-text-field
        v-if="searchActive"
        ref="searchFieldRef"
        v-model="searchText"
        @keyup.enter="handleSearchSubmit"
        density="compact"
        variant="solo-filled"
        rounded
        placeholder="Search..."
        hide-details
        class="mx-4 search-field"
      ></v-text-field>
  
      <v-spacer></v-spacer>
  
      <v-btn icon="mdi-magnify" @click="searchActive = !searchActive"></v-btn>
  
      <v-btn icon="mdi-account-circle-outline"></v-btn>
    </v-container>
    </v-app-bar>
</template>

<script setup>
const searchActive = ref(false)
const searchFieldRef = ref(null)
const searchText = ref('')

function handleSearchSubmit() {
  if (searchText.value.trim()) {
    // Placeholder action: Show input in snackbar
    

    // Optional: Clear the search field after submit
    // searchText.value = '';

    // Optional: Hide search bar after submit
    // searchActive.value = false;

    console.log('Search submitted:', searchText.value); // Log for debugging
  }
}

// --- Handle AI Service Menu Item Click (Placeholder) ---
function handleMenuItemClick(serviceName) {
  // Placeholder action: Log or show simple alert
  // In a real scenario, this would navigate or trigger another action
  console.log(`Menu item clicked: ${serviceName}`);
  alert(`${serviceName} feature would run now.`); // Simple feedback as per step 4 guidelines [cite: 8]
}
</script>