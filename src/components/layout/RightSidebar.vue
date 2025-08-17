<template>
  <v-navigation-drawer
    v-model="appStore.rightDrawerOpen"
    location="right"
    temporary
    width="300"
  >
    <v-list>
      <v-list-item
        prepend-icon="mdi-cog"
        title="Settings"
      ></v-list-item>
    </v-list>

    <v-divider></v-divider>

    <v-list density="compact">
      <v-list-item title="Theme Settings">
        <v-switch
          v-model="appStore.darkMode"
          label="Dark Mode"
          color="primary"
        ></v-switch>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
</script>