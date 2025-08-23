// src/plugins/index.js
/**
 * plugins/index.js
 *
 * Automatically included in `./src/main.js`
 */
// Original Plugins
import vuetify from './vuetify'
import pinia from '@/stores'
import router from '@/router'
// --- Add Vue Toastification Imports ---
import Toast, { POSITION } from "vue-toastification";
import "vue-toastification/dist/index.css";
// --- End Toastification Imports ---
export function registerPlugins (app) {
  
  // --- Register original plugins ---
  // Registering them first is generally fine
  app
    .use(vuetify)
    .use(router)
    .use(pinia);
  // --- End original plugins ---
  // --- Define Toastification Options ---
  // Define options object for vue-toastification
  const toastOptions = {
    position: POSITION.TOP_RIGHT,
    timeout: 5000,
    closeOnClick: true,
    pauseOnFocusLoss: false,
    pauseOnHover: true,
    draggable: false,
    draggablePercent: 0.6,
    showCloseButtonOnHover: false,
    hideProgressBar: true,
    closeButton: "button", // Display close button ('button', 'svg' or false)
    icon: true,            // Show default icons per type
    rtl: false,            // Right-to-left layout
    transition: "Vue-Toastification__fade", // Default fade transition
    maxToasts: 10,         // Max concurrent toasts
    newestOnTop: true,      // Show newest toast on top
    shareAppContext: true
    // shareAppContext: true // Optional: Add this if components inside toasts need app context
  };
  // --- End Toastification Options ---
  // --- Register Vue Toastification with Debugging ---
 
  try {
      // Register the plugin with the app instance and options
      app.use(Toast, toastOptions);
      // --- OR --- For debugging, try registering WITHOUT options:
      // app.use(Toast);
      
  } catch (err) {
      // Log any error that occurs specifically during Toastification registration
      console.error('--- Toast Debug: ERROR during app.use(Toast) ---', err);
  }
  // --- End Toastification Registration ---
  
}