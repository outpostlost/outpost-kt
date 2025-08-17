import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

export default createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi'
  },
  defaults: {
    VBtn: {
      variant: 'flat',
      style: {
        textTransform: 'none'
      }
    },
    VCard: {
      elevation: 0,
      border: 'primary thin',
      variant: 'outlined',
      class: 'bg-surface',
      
    },
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
        colors: {
          // System colors are inherited from settings.scss\
          primary: '#A16034',
          secondary: '#53826F',
          accent: '#82B1FF',
          error: '#D5746D',
          info: '#AEC5D7',
          success: '#5AA95E',
          warning: '#DCB478',
          'sand':'#D9D2C0',
          'terracotta': '#C9B3A5',
          'alpine-blue': '#085D65',
          // --- Define Backgrounds ---
          background: '#D9D2C0',  // Use 'vanilla' for the main background
          surface: '#f5f5f5',     // Use 'whitesmoke' for card/dialog backgrounds (or #FFFFFF)
          surfaceDarker: '#EE11EE',
        }
      },
      dark: {
        dark: true,
        colors: {
          primary: '#875330',
          secondary: '#424242',
          accent: '#82B1FF',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FFC107',
          'terracotta': '#8F7565',
          'alpine-blue': '#266F76',
        }
      }
    },
    variations: {
      colors: ['terracotta','alpine-blue','sand'],
      lighten: 4,
      darken: 3
    },
  }
})