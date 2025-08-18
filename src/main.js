/**
 * main.js - Sibling Project Template
 * 
 * Bootstraps Vuetify and other plugins then mounts the App
 * Uses external Firebase configuration file for easy management
 */

// Plugins
import { registerPlugins } from '@/plugins'
// Components
import App from './App.vue'
// Composables
import { createApp } from 'vue'

// Multi-project DAL for Firebase
import multiProjectDAL from '@/dal/multiProjectDal'


// Firebase initialization
import { initializeApp as initFirebaseApp } from 'firebase/app'


// Import Firebase configuration from external file
import { operationalConfig, bizDataConfig, bizTrendsConfig, auditConfig } from '@/config/firebase.js'

// Initialize Firebase
async function initializeFirebase() {
  try {
    // Load Biz Data project
    try {
      await multiProjectDAL.loadProject('bizData', bizDataConfig);
      console.log('Outpost Firebase Biz Data project loaded successfully');
    } catch (error) {
      console.error('Failed to load Biz Data project:', error);
      throw error;
    }

    // Load Biz Trends project
    try {
      await multiProjectDAL.loadProject('bizTrends', bizTrendsConfig);
      console.log('Outpost Firebase Biz Trends project loaded successfully');
    } catch (error) {
      console.error('Failed to load Biz Trends project:', error);
      throw error;
    }

    // Load operational project
    try {
      await multiProjectDAL.loadProject('operational', operationalConfig);
      console.log('Outpost Firebase Operational project loaded successfully');
    } catch (error) {
      console.error('Failed to load Operational project:', error);
      throw error;
    }

    // Load audit project
    try {
      await multiProjectDAL.loadProject('audit', auditConfig);
      console.log('Outpost Firebase Audit project loaded successfully');
    } catch (error) {
      console.error('Failed to load Audit project:', error);
      throw error;
    }

    // Set active project
    try {
      await multiProjectDAL.switchToProject('operational');
      console.log('Switched to active project: operational');
    } catch (error) {
      console.error('Failed to switch to operational project:', error);
      throw error;
    }
    
  } catch (error) {
    console.error("Firebase initialization error:", error);
    throw error;
  }
}

// Initialize Firebase and Vue app
async function initializeVueApp() {
  try {
    // Initialize Firebase first
    await initializeFirebase();
    
    // Create Vue App
    const app = createApp(App);
    
    // Register Vue plugins (Vuetify, Router, etc.)
    registerPlugins(app);
    
    // Mount the App
    app.mount('#app');
    
  } catch (error) {
    console.error('Application initialization failed:', error);
    
    // Try to show error using notification system
    try {
      // Create minimal Vue app for error notification
      const errorApp = createApp({
        async setup() {
          // Wait for next tick to ensure DOM is ready
          await new Promise(resolve => setTimeout(resolve, 100));
          
          try {
            const { default: useNotify } = await import('@/composables/useNotify.js');
            const notify = useNotify();
            notify.error(`Application initialization failed: ${error.message}. Please check console for details.`);
          } catch (notifyError) {
            console.error('Failed to load notification system:', notifyError);
            // Fallback to console and alert
            console.error('Critical: Application initialization failed');
            alert(`Application Error: ${error.message}\n\nCheck browser console for details.`);
          }
          
          return {};
        },
        template: '<v-app><v-main></v-main></v-app>'
      });
      
      registerPlugins(errorApp);
      errorApp.mount('#app');
      
    } catch (criticalError) {
      console.error('Critical error - even error handling failed:', criticalError);
      alert(`Critical Application Error: ${error.message}\n\nReload the page and check browser console.`);
    }
  }
}

// Start the application
initializeVueApp();
