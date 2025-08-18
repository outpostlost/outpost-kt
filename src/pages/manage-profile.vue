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
              {{ pageData?.title || 'Profile' }}
            </v-toolbar-title>
            <v-spacer />
            
          </v-toolbar>

          <v-card-text class="flex-grow-1" style="overflow-y: auto;">
            <v-container>
              <v-row>
                <v-col cols="12" md="8" lg="6">
                  
                  <!-- User Information Card -->
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
                      </v-list>
                    </v-card-text>
                  </v-card>

                  <!-- Change Email Card -->
                  <v-card class="mb-6" variant="outlined">
                    <v-card-title>Change Email</v-card-title>
                    <v-card-text>
                      <v-form ref="emailForm" v-model="emailFormValid" @submit.prevent="handleEmailChange">
                        <v-text-field
                          v-model="emailData.newEmail"
                          label="New Email Address"
                          type="email"
                          :rules="emailRules"
                          variant="outlined"
                          class="mb-3"
                        />
                        <v-text-field
                          v-model="emailData.currentPassword"
                          label="Current Password"
                          type="password"
                          :rules="passwordRules"
                          variant="outlined"
                          class="mb-3"
                        />
                        <v-btn
                          type="submit"
                          color="primary"
                          :loading="emailLoading"
                          :disabled="!emailFormValid || emailLoading"
                        >
                          Update Email
                        </v-btn>
                      </v-form>
                    </v-card-text>
                  </v-card>

                  <!-- Change Password Card -->
                  <v-card variant="outlined">
                    <v-card-title>Change Password</v-card-title>
                    <v-card-text>
                      <v-form ref="passwordForm" v-model="passwordFormValid" @submit.prevent="handlePasswordChange">
                        <v-text-field
                          v-model="passwordData.currentPassword"
                          label="Current Password"
                          type="password"
                          :rules="passwordRules"
                          variant="outlined"
                          class="mb-3"
                        />
                        <v-text-field
                          v-model="passwordData.newPassword"
                          label="New Password"
                          type="password"
                          :rules="newPasswordRules"
                          variant="outlined"
                          class="mb-3"
                        />
                        <v-text-field
                          v-model="passwordData.confirmPassword"
                          label="Confirm New Password"
                          type="password"
                          :rules="confirmPasswordRules"
                          variant="outlined"
                          class="mb-3"
                        />
                        <v-btn
                          type="submit"
                          color="primary"
                          :loading="passwordLoading"
                          :disabled="!passwordFormValid || passwordLoading"
                        >
                          Update Password
                        </v-btn>
                      </v-form>
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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import useAuth from '@/composables/useAuth';
import useNotify from '@/composables/useNotify';

const router = useRouter();
const notify = useNotify();
const { currentUser, updateUserEmail, updateUserPassword, logoutUser } = useAuth();

const pageModel = ref(null);   
const pageData = ref(null);
const emailForm = ref(null);
const passwordForm = ref(null);
const emailFormValid = ref(false);
const passwordFormValid = ref(false);
const emailLoading = ref(false);
const passwordLoading = ref(false);

const emailData = ref({
  newEmail: '',
  currentPassword: ''
});

const passwordData = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const pageMetaData = {
  title: "Profile"
};

// Validation rules
const emailRules = [
  v => !!v || 'Email is required',
  v => /.+@.+\..+/.test(v) || 'Email must be valid',
  v => v !== currentUser.value?.email || 'New email must be different from current email'
];

const passwordRules = [
  v => !!v || 'Password is required'
];

const newPasswordRules = [
  v => !!v || 'New password is required',
  v => v.length >= 6 || 'Password must be at least 6 characters'
];

const confirmPasswordRules = [
  v => !!v || 'Please confirm your password',
  v => v === passwordData.value.newPassword || 'Passwords do not match'
];

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

// Handle email change
const handleEmailChange = async () => {
  if (!emailFormValid.value) return;

  emailLoading.value = true;
  const result = await updateUserEmail(emailData.value.newEmail, emailData.value.currentPassword);
  emailLoading.value = false;

  if (result.success) {
    emailData.value.newEmail = '';
    emailData.value.currentPassword = '';
    emailForm.value.reset();
  }
};

// Handle password change
const handlePasswordChange = async () => {
  if (!passwordFormValid.value) return;

  passwordLoading.value = true;
  const result = await updateUserPassword(passwordData.value.currentPassword, passwordData.value.newPassword);
  passwordLoading.value = false;

  if (result.success) {
    passwordData.value.currentPassword = '';
    passwordData.value.newPassword = '';
    passwordData.value.confirmPassword = '';
    passwordForm.value.reset();
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
/* Add any specific styles for profile page */
</style>