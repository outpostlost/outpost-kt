<template>
  <v-sheet color="transparent">
    <v-list-subheader>Settings</v-list-subheader>
    <v-list-item>
      <v-switch
        v-model="darkModeModel"
        :label="`Dark mode: ${darkModeModel}`"
        false-value="no"
        true-value="yes"
        hide-details
      ></v-switch>
    </v-list-item>
    <v-list-item>
      <v-list-item-title>Setting 2</v-list-item-title>
    </v-list-item>
    <v-divider class="my-2"></v-divider>
    <v-list-item>
      <v-list-item-subtitle>More settings will go here.</v-list-item-subtitle>
    </v-list-item>
  </v-sheet>
</template>

<script setup>
import { computed } from 'vue';
import { useTheme } from 'vuetify';
import { useAppStore } from '@/stores/app.js';

const theme = useTheme();
const appStore = useAppStore();

const darkModeModel = computed({
  get: () => appStore.darkMode,
  set: (value) => {
    appStore.darkMode = value;
    theme.change(value === 'yes' ? 'dark' : 'light');
  }
});
</script>