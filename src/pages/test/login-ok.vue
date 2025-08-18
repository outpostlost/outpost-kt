<template>
  <v-sheet class="flex-grow-1 d-flex flex-column" flat rounded color="transparent">
    <v-row class="flex-grow-1 ma-0">
      <v-col class="d-flex flex-column pa-0">
        <v-card class="flex-grow-1 d-flex flex-column" flat>
          <v-toolbar color="primary" dark flat density="compact">
            <v-toolbar-title>
              {{ pageData?.title || 'Login Success' }}
            </v-toolbar-title>
          </v-toolbar>

          <v-card-text class="flex-grow-1 d-flex align-center justify-center" style="overflow-y: auto;">
            <v-card max-width="600" class="pa-4">
              
              <!-- Success Message -->
              <v-card-title class="text-center text-success mb-4">
                <v-icon size="64" class="mb-2">mdi-check-circle</v-icon>
                <br>
                Login Successful!
              </v-card-title>
              
              <v-card-text class="text-center">
                
                <!-- User Information -->
                <v-card variant="outlined" class="mb-4">
                  <v-card-title>User Information</v-card-title>
                  <v-card-text>
                    <v-list>
                      <v-list-item>
                        <v-list-item-title>Email</v-list-item-title>
                        <v-list-item-subtitle>{{ currentUser?.email || 'Not available' }}</v-list-item-subtitle>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-title>User ID</v-list-item-title>
                        <v-list-item-subtitle>{{ currentUser?.uid || 'Not available' }}</v-list-item-subtitle>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-title>Email Verified</v-list-item-title>
                        <v-list-item-subtitle>
                          <v-chip 
                            :color="currentUser?.emailVerified ? 'success' : 'warning'" 
                            size="small"
                          >
                            {{ currentUser?.emailVerified ? 'Yes' : 'No' }}
                          </v-chip>
                        </v-list-item-subtitle>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-title>Last Sign In</v-list-item-title>
                        <v-list-item-subtitle>{{ formatDate(currentUser?.metadata?.lastSignInTime) }}</v-list-item-subtitle>
                      </v-list-item>
                    </v-list>
                  </v-card-text>
                </v-card>

                <!-- Navigation Options -->
                <v-card variant="outlined">
                  <v-card-title>What would you like to do?</v-card-title>
                  <v-card-text>
                    <v-btn
                      color="primary"
                      size="large"
                      class="ma-2"
                      @click="goToProfile"
                    >
                      <v-icon start>mdi-account</v-icon>
                      View Profile
                    </v-btn>

                    <v-btn
                      color="secondary"
                      size="large"
                      class="ma-2"
                      @click="handleLogout"
                    >
                      <v-icon start>mdi-logout</v-icon>
                      Logout
                    </v-btn>
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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import useAuth from '@/composables/useAuth';
import useNotify from '@/composables/useNotify';

const router = useRouter();
const notify = useNotify();
const { currentUser, logoutUser, isAuthenticated } = useAuth();

const pageModel = ref(null);   
const pageData = ref(null);

const pageMetaData = {
  title: "Login Success"
};

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

// Navigate to profile page
const goToProfile = () => {
  router.push('/profile');
};

// Handle logout
const handleLogout = async () => {
  const result = await logoutUser();
  if (result.success) {
    router.push('/login');
  }
};

onMounted(() => {
  pageData.value = pageMetaData;

  if (pageData.value?.title) {
    document.title = pageData.value.title;
  }

  // Check if user is actually authenticated
  if (!isAuthenticated.value) {
    notify.warning('You must be logged in to view this page');
    router.push('/login');
  }
});
</script>

<style scoped>
/* Add any specific styles for login success page */
</style>