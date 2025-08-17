<template>
  <v-navigation-drawer
    v-model="appStore.leftDrawerOpen"
    :rail="appStore.leftDrawerRail"
    permanent
    location="left"
  >
    

    <v-list density="compact" nav>
      <v-list-item
        prepend-icon="mdi-home"
        title="Home"
        value="home"
      ></v-list-item>
      <v-list-item
        prepend-icon="mdi-account"
        title="Profile"
        value="profile"
      ></v-list-item>
      <v-list-item
        prepend-icon="mdi-folder"
        title="Projects"
        value="projects"
      ></v-list-item>
      <v-list-item
        prepend-icon="mdi-chart-line"
        title="Analytics"
        value="analytics"
      ></v-list-item>
      <v-list-item
        prepend-icon="mdi-cog"
        title="Settings"
        value="settings"
      ></v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
</script>