<template>
  <v-navigation-drawer
    v-model="layoutStore.leftDrawerOpen"
    permanent
    location="left"
    :border="0"
  >
    <v-list v-if="layoutStore.loadingMenu" density="compact" nav>
        <v-list-item>
            <v-progress-circular indeterminate ></v-progress-circular>
        </v-list-item>
    </v-list>

    <v-list v-else density="compact" nav color="primary">
      <v-list-item
        v-for="item in layoutStore.appMenuItems"
        :key="item.id"
        :prepend-icon="item.icon"
        :title="item.title"
        :to="item.route"
        exact
      ></v-list-item>
      
      
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useLayoutStore } from '@/stores/useLayoutStore';
import { useAppStore } from '@/stores/app';
import { useTheme } from 'vuetify';
const theme = useTheme();

const menutextColor = computed(() => {
  return theme.current.value.dark ? 'slate-gray' : 'primary';
});

const layoutStore = useLayoutStore();
const appStore = useAppStore();
</script>