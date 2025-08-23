import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  // UI State - Drawer Management
  const leftDrawerOpen = ref(true)
  const leftDrawerRail = ref(false)
  const rightDrawerOpen = ref(false)

  // UI State - Search Functionality
  const searchActive = ref(false)
  const searchText = ref('')

  // Settings State - Basic theme only
  const darkMode = ref(false)

  // UI Actions - Drawer Controls
  const toggleLeftDrawer = () => {
    leftDrawerOpen.value = !leftDrawerOpen.value
  }

  const toggleLeftRail = () => {
    leftDrawerRail.value = !leftDrawerRail.value
  }

  const toggleRightDrawer = () => {
    rightDrawerOpen.value = !rightDrawerOpen.value
  }

  // UI Actions - Search Controls
  const toggleSearch = () => {
    searchActive.value = !searchActive.value
    if (!searchActive.value) {
      searchText.value = ''
    }
  }

  const handleSearchSubmit = () => {
    if (searchText.value.trim()) {
      // For now, just show notification - can be enhanced later
      console.log('Search submitted:', searchText.value)
      // Could emit event or call search service here
    }
  }

  // Settings Actions
  const updateDarkMode = (value) => {
    darkMode.value = value
  }

  // Initialize theme state on store creation
  const initializeTheme = (theme) => {
    if (theme) {
      theme.global.name.value = darkMode.value ? 'dark' : 'light'
    }
  }

  return {
    // UI State
    leftDrawerOpen,
    leftDrawerRail,
    rightDrawerOpen,
    searchActive,
    searchText,
    
    // Settings State
    darkMode,
    
    // Actions
    toggleLeftDrawer,
    toggleLeftRail,
    toggleRightDrawer,
    toggleSearch,
    handleSearchSubmit,
    updateDarkMode,
    initializeTheme
  }
})