import { defineStore } from 'pinia';
//import multiProjectDAL from '@/dal/multiProjectDal';

export const useLayoutStore = defineStore('layout', {
  state: () => ({
    leftDrawerOpen: true,
    rightDrawerOpen: false,
    rightDrawerContent: null, // can be 'settings', 'quick-menu', etc.
    appMenuItems: [],
    loadingMenu: false,
  }),

  actions: {
    /**
     * Toggles the open/closed state of the left navigation drawer.
     */
    toggleLeftDrawer() {
      this.leftDrawerOpen = !this.leftDrawerOpen;
    },

    /**
     * Toggles the right drawer's visibility and sets its content.
     * If the drawer is already open with the same content, it closes it.
     * If it's open with different content, it just swaps the content.
     * If it's closed, it opens with the specified content.
     * @param {string} contentIdentifier - The identifier for the content to display (e.g., 'settings').
     */
    toggleRightDrawer(contentIdentifier) {
      if (this.rightDrawerOpen && this.rightDrawerContent === contentIdentifier) {
        this.rightDrawerOpen = false;
        this.rightDrawerContent = null;
      } else {
        this.rightDrawerOpen = true;
        this.rightDrawerContent = contentIdentifier;
      }
    },

    /**
     * Closes the right drawer.
     */
    closeRightDrawer() {
        this.rightDrawerOpen = false;
        this.rightDrawerContent = null;
    },

    /**
     * Fetches the application menu items from the 'appMenu' collection in Firestore.
     * Uses the 'operational' project via multiProjectDAL.
     */
    async fetchAppMenu() {
      if (this.appMenuItems.length > 0) return; // Avoid refetching
      this.loadingMenu = true;
      try {
        // Switch to the operational project to be certain
        await multiProjectDAL.switchToProject('operational');
        const items = await multiProjectDAL.getAllItems('appMenu');
        
        // Sort items by the 'order' field
        this.appMenuItems = items.sort((a, b) => a.order - b.order);

      } catch (error) {
        console.error("Error fetching app menu:", error);
        // Optionally use useNotify composable here to show an error toast
      } finally {
        this.loadingMenu = false;
      }
    },
  },
});