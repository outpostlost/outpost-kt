<route lang="yaml">
  meta:
    layout: app
</route>
<template>
  <v-sheet class="flex-grow-1 d-flex flex-column" flat rounded color="transparent">
    <v-row class="flex-grow-1 ma-0">
      <v-col class="d-flex flex-column pa-0">
        <v-card class="flex-grow-1 d-flex flex-column" flat>
          <v-toolbar color="secondary" dark flat density="compact">
            <v-toolbar-title>
              {{ pageData?.title || 'Default Title' }}
            </v-toolbar-title>
          </v-toolbar>

          <v-card-text class="flex-grow-1" style="overflow-y: auto;">
            
            <v-card class="mb-6" variant="outlined">
                    <v-card-title>Account Information</v-card-title>
                    <v-card-text>
                      <v-list>
                        <v-list-item>
                          <v-list-item-title>Email</v-list-item-title>
                          <v-list-item-subtitle>{{ currentUser?.email || 'Not available' }}</v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item>
                          <v-list-item-title>Account Created</v-list-item-title>
                          <v-list-item-subtitle>{{ formatDate(currentUser?.metadata?.creationTime) }}</v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item>
                          <v-list-item-title>Last Sign In</v-list-item-title>
                          <v-list-item-subtitle>{{ formatDate(currentUser?.metadata?.lastSignInTime) }}</v-list-item-subtitle>
                        </v-list-item>
                        <v-btn 
      
      to="/manage-profile"
      color="primary"
    >Edit email/password</v-btn>
                      </v-list>
                    </v-card-text>
                  </v-card>

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


const route = useRoute();
const notify = useNotify();

const pageModel = ref(null); // Model to store reatcive data
const pageData = ref(null);

const { currentUser, updateUserEmail, updateUserPassword, logoutUser } = useAuth();

const pageMetaData = {
  title: "Account"
}

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return 'Not available';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'Not available';
  }
};

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