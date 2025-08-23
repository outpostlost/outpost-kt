// src/plugins/vuetify.js

// REMOVED: import 'vuetify/styles' - The plugin handles this automatically.
import { createVuetify } from 'vuetify'
// REMOVED: import * as components from 'vuetify/components' - The plugin handles this.
// REMOVED: import * as directives from 'vuetify/directives' - The plugin handles this.

// NOTE: Your icon imports were commented out, so I've left them that way.
// If you need icons, you will need to uncomment these and install the packages.
// import '@mdi/font/css/materialdesignicons.css'
// import { aliases, mdi } from 'vuetify/iconsets/mdi'

export default createVuetify({
  // The 'components' and 'directives' options are no longer needed here.
  // The vite-plugin-vuetify with autoImport: true handles it for you.
  
  // Your custom icon configuration will need these variables if you uncomment the imports above.
  /*
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    }
  },
  */

  // All of your theme and defaults configuration below is PERFECT. Do not change it.
  defaults: {
    VBtn: {
      variant: 'flat',
      rounded: "lg",
      style: {
        textTransform: 'none'
      }
    },
    VCard: {
      elevation: 0,
      border: 'primary thin',
      variant: 'outlined',
      class: 'bg-surface',
      style: 'border-radius: 24px;',
    },
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#8d3915',
          secondary: '#7d7a4c',
          accent: '#82B1FF',
          error: '#D5746D',
          info: '#AEC5D7',
          success: '#7AB77D',
          warning: '#DCB478',
          background: '#f5f5f5',
          surface: '#f5f5f5',
        }
      },
      dark: {
        dark: true,
        colors: {
          primary: '#8d3915',
          secondary: '#7d7a4c',
          accent: '#82B1FF',
          error: '#D5746D',
          info: '#AEC5D7',
          success: '#7AB77D',
          warning: '#DCB478',
          surface: '#292421',
        }
      }
    },
  }
})