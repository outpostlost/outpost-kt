<route lang="yaml">
    meta:
      layout: app
  </route>
  <template>
    <v-sheet class="flex-grow-1 d-flex flex-column" flat rounded color="surface">
      <v-row class="flex-grow-1 ma-0">
        <v-col class="d-flex flex-column pa-0">
          <v-card :class="['flex-grow-1', 'd-flex', 'flex-column', dynamicBgClass]" flat :border="0">
            <v-card-text class="flex-grow-1" style="overflow-y: auto;" :border="0">
              <v-container fluid>
                <v-row>
                <v-col cols="2">

                  <v-card variant="text" :class="[dynamicHeaderClass, 'text-h5', dynamicBgClass]" :border="0">{{ PAGE_TITLE || 'Loading...' }}</v-card>
                </v-col>
              </v-row>
                <v-row>
                    <v-col cols="12">
                    <v-card class="bg-surface" variant="outlined">
                            <v-card-title class="text-secondary"> Full Width 1 col</v-card-title>
                            <v-card-text>
                                
                               col1 contents

                            </v-card-text>
                    </v-card>
                    </v-col>    
                </v-row>
                <v-row> 
                    <v-col cols="4">
                        <v-card class="bg-surface" variant="outlined">
                                <v-card-title class="text-secondary"> 30/70 2 col</v-card-title>
                                <v-card-text>
                                    
                                col1 contents

                                </v-card-text>
                        </v-card>
                    </v-col>
                    <v-col cols="8">
                        <v-card class="bg-surface" variant="outlined">
                                <v-card-title class="text-secondary"> 30/70 2 col</v-card-title>
                                <v-card-text>
                                    
                                col2 contents

                                </v-card-text>
                        </v-card>
                    </v-col> 
                </v-row>  
                <v-row> 
                    <v-col cols="6">
                        <v-card class="bg-surface" variant="outlined">
                                <v-card-title class="text-secondary"> 50/50 2 col</v-card-title>
                                <v-card-text>
                                    
                                col1 contents

                                </v-card-text>
                        </v-card>
                    </v-col>
                    <v-col cols="6">
                        <v-card class="bg-surface" variant="outlined">
                                <v-card-title class="text-secondary"> 50/50 2 col</v-card-title>
                                <v-card-text>
                                    
                                col2 contents

                                </v-card-text>
                        </v-card>
                    </v-col> 
                </v-row> 
                <v-row> 
                    <v-col cols="8">
                        <v-card class="bg-surface" variant="outlined">
                                <v-card-title class="text-secondary"> 70/30 2 col</v-card-title>
                                <v-card-text>
                                    
                                col1 contents

                                </v-card-text>
                        </v-card>
                    </v-col>
                    <v-col cols="4">
                        <v-card class="bg-surface" variant="outlined">
                                <v-card-title class="text-secondary"> 70/30 2 col</v-card-title>
                                <v-card-text>
                                    
                                col2 contents

                                </v-card-text>
                        </v-card>
                    </v-col> 
                </v-row>  
                <v-row> 
                    <v-col cols="4">
                        <v-card class="bg-surface" variant="outlined">
                                <v-card-title class="text-secondary"> 3 cols</v-card-title>
                                <v-card-text>
                                    
                                col1 contents

                                </v-card-text>
                        </v-card>
                    </v-col>
                    <v-col cols="4">
                        <v-card class="bg-surface" variant="outlined">
                                <v-card-title class="text-secondary"> 3 cols</v-card-title>
                                <v-card-text>
                                    
                                col2 contents

                                </v-card-text>
                        </v-card>
                    </v-col> 
                    <v-col cols="4">
                        <v-card class="bg-surface" variant="outlined">
                                <v-card-title class="text-secondary"> 3 cols</v-card-title>
                                <v-card-text>
                                    
                                col3 contents

                                </v-card-text>
                        </v-card>
                    </v-col> 
                </v-row> 
                <v-row> 
                    <v-col cols="3">
                        <v-card class="bg-surface" variant="outlined">
                                <v-card-title class="text-secondary"> 4 cols</v-card-title>
                                <v-card-text>
                                    
                                col1 contents

                                </v-card-text>
                        </v-card>
                    </v-col>
                    <v-col cols="3">
                        <v-card class="bg-surface" variant="outlined">
                                <v-card-title class="text-secondary"> 4 cols</v-card-title>
                                <v-card-text>
                                    
                                col2 contents

                                </v-card-text>
                        </v-card>
                    </v-col> 
                    <v-col cols="3">
                        <v-card class="bg-surface" variant="outlined">
                                <v-card-title class="text-secondary"> 4 cols</v-card-title>
                                <v-card-text>
                                    
                                col3 contents

                                </v-card-text>
                        </v-card>
                    </v-col>
                    <v-col cols="3">
                        <v-card class="bg-surface" variant="outlined">
                                <v-card-title class="text-secondary"> 4 cols</v-card-title>
                                <v-card-text>
                                    
                                col4 contents

                                </v-card-text>
                        </v-card>
                    </v-col>  
                </v-row> 
                <v-row> 
                    <v-col cols="2">
                        <v-card class="bg-surface" variant="outlined">
                                <v-card-title class="text-secondary"> 6 cols</v-card-title>
                                <v-card-text>
                                    
                                col1 contents

                                </v-card-text>
                        </v-card>
                    </v-col>
                    <v-col cols="2">
                        <v-card class="bg-surface" variant="outlined">
                                <v-card-title class="text-secondary"> 6 cols</v-card-title>
                                <v-card-text>
                                    
                                col2 contents

                                </v-card-text>
                        </v-card>
                    </v-col> 
                    <v-col cols="2">
                        <v-card class="bg-surface" variant="outlined">
                                <v-card-title class="text-secondary"> 6 cols</v-card-title>
                                <v-card-text>
                                    
                                col3 contents

                                </v-card-text>
                        </v-card>
                    </v-col>
                    <v-col cols="2">
                        <v-card class="bg-surface" variant="outlined">
                                <v-card-title class="text-secondary"> 6 cols</v-card-title>
                                <v-card-text>
                                    
                                col4 contents

                                </v-card-text>
                        </v-card>
                    </v-col> 
                    <v-col cols="2">
                        <v-card class="bg-surface" variant="outlined">
                                <v-card-title class="text-secondary"> 6 cols</v-card-title>
                                <v-card-text>
                                    
                                col5 contents

                                </v-card-text>
                        </v-card>
                    </v-col> 
                    <v-col cols="2">
                        <v-card class="bg-surface" variant="outlined">
                                <v-card-title class="text-secondary"> 6 cols</v-card-title>
                                <v-card-text>
                                    
                                col6 contents

                                </v-card-text>
                        </v-card>
                    </v-col> 
                </v-row>
            </v-container>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-sheet>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, watch } from 'vue';
  import { useRoute } from 'vue-router';
  import useNotify from '@/composables/useNotify'; // For notifications [cite: 3]
  import useAuth from '@/composables/useAuth'
  import { useTheme } from 'vuetify';
  
  const route = useRoute();
  const notify = useNotify();
  
  const pageModel = ref(null); // Model to store reatcive data
  const pageData = ref(null);

  const dynamicBgClass = computed(() => {
  return theme.current.value.dark ? 'bg-charcoal' : 'bg-parchment';
});

const dynamicHeaderClass = computed(() => {
  return theme.current.value.dark ? 'text-stone-gray' : 'text-secondary';
});
  
  const { currentUser, updateUserEmail, updateUserPassword, logoutUser } = useAuth();
  
  const pageMetaData = {
    title: "[page title here]"
  }
  

  onMounted(() => {
    pageData.value = pageMetaData;
  
    if (pageData.value?.title) {
      document.title = pageData.value.title;
    }
  });
  </script>
  
  <style scoped>
  /* Add any specific styles for your dynamic page view */
  </style>