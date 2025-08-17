<route lang="yaml">
  meta:
    layout: app
  </route>
<template>
  <v-sheet class="flex-grow-1 d-flex flex-column" flat rounded color="transparent">
    <v-row class="flex-grow-1 ma-0">
      <v-col class="d-flex flex-column pa-0">
        <v-card class="flex-grow-1 d-flex flex-column" flat>
          <v-toolbar color="primary" dark flat density="compact">
            <v-toolbar-title>
              {{ pageData?.title || 'Layout Test' }}
            </v-toolbar-title>
          </v-toolbar>

          <v-card-text class="flex-grow-1" style="overflow-y: auto;">
            <v-card class="mb-4">
              <v-card-title>Layout Component Test</v-card-title>
              <v-card-text>
                <p>This page tests the modular layout components and Pinia store integration.</p>
                
                <v-row class="mt-4">
                  <v-col cols="12" md="6">
                    <v-card variant="outlined">
                      <v-card-title>Drawer Controls</v-card-title>
                      <v-card-text>
                        <v-btn 
                          @click="appStore.toggleLeftDrawer"
                          class="mr-2 mb-2"
                          variant="outlined"
                        >
                          Toggle Left Drawer
                        </v-btn>
                        <v-btn 
                          @click="appStore.toggleLeftRail"
                          class="mr-2 mb-2"
                          variant="outlined"
                        >
                          Toggle Left Rail
                        </v-btn>
                        <v-btn 
                          @click="appStore.toggleRightDrawer"
                          class="mr-2 mb-2"
                          variant="outlined"
                        >
                          Toggle Right Drawer
                        </v-btn>
                      </v-card-text>
                    </v-card>
                  </v-col>
                  
                  <v-col cols="12" md="6">
                    <v-card variant="outlined">
                      <v-card-title>Search Controls</v-card-title>
                      <v-card-text>
                        <v-btn 
                          @click="appStore.toggleSearch"
                          class="mr-2 mb-2"
                          variant="outlined"
                        >
                          Toggle Search
                        </v-btn>
                        <v-btn 
                          @click="testSearchSubmit"
                          class="mr-2 mb-2"
                          variant="outlined"
                        >
                          Test Search Submit
                        </v-btn>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>

                <v-card variant="outlined" class="mt-4">
                  <v-card-title>Store State</v-card-title>
                  <v-card-text>
                    <pre>{{ storeState }}</pre>
                  </v-card-text>
                </v-card>
              </v-card-text>
            </v-card>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-sheet>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import useNotify from '@/composables/useNotify'

const route = useRoute()
const notify = useNotify()
const appStore = useAppStore()

const pageModel = ref(null)
const pageData = ref(null)

const pageMetaData = {
  title: "Layout Test"
}

const storeState = computed(() => ({
  leftDrawerOpen: appStore.leftDrawerOpen,
  leftDrawerRail: appStore.leftDrawerRail,
  rightDrawerOpen: appStore.rightDrawerOpen,
  searchActive: appStore.searchActive,
  searchText: appStore.searchText,
  darkMode: appStore.darkMode
}))

const testSearchSubmit = () => {
  appStore.searchText = 'test search query'
  appStore.handleSearchSubmit()
  notify.success('Search submit test completed')
}

onMounted(() => {
  pageData.value = pageMetaData

  if (pageData.value?.title) {
    document.title = pageData.value.title
  }
})
</script>

<style scoped>

</style>