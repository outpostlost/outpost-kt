<template>
  <v-sheet class="flex-grow-1 d-flex flex-column" flat rounded color="transparent">
    <v-row class="flex-grow-1 ma-0">
      <v-col class="d-flex flex-column pa-0">
        <v-card class="flex-grow-1 d-flex flex-column" flat>
          <v-toolbar color="primary" dark flat density="compact">
            <v-toolbar-title>
              {{ pageData?.title || 'Login' }}
            </v-toolbar-title>
          </v-toolbar>

          <v-card-text class="flex-grow-1 d-flex align-center justify-center" style="overflow-y: auto;">
            <v-card max-width="400" class="pa-4">
              <v-card-title class="text-center">
                Welcome to Outpost KT
              </v-card-title>
              
              <v-card-text>
                <v-form ref="loginForm" v-model="formValid" @submit.prevent="handleLogin">
                  <v-text-field
                    v-model="loginData.email"
                    label="Email"
                    type="email"
                    :rules="emailRules"
                    :disabled="isLoading"
                    required
                    variant="outlined"
                    class="mb-3"
                  />

                  <v-text-field
                    v-model="loginData.password"
                    label="Password"
                    type="password"
                    :rules="passwordRules"
                    :disabled="isLoading"
                    required
                    variant="outlined"
                    class="mb-3"
                  />

                  <v-btn
                    type="submit"
                    color="primary"
                    block
                    :loading="isLoading"
                    :disabled="!formValid || isLoading"
                    size="large"
                    class="mb-3"
                  >
                    Login
                  </v-btn>

                  <v-btn
                    variant="text"
                    color="primary"
                    block
                    :disabled="isLoading"
                    @click="showPasswordReset = true"
                  >
                    Forgot Password?
                  </v-btn>
                </v-form>
              </v-card-text>
            </v-card>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Password Reset Dialog -->
    <v-dialog v-model="showPasswordReset" max-width="400">
      <v-card>
        <v-card-title>Reset Password</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="resetEmail"
            label="Email Address"
            type="email"
            :rules="emailRules"
            variant="outlined"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showPasswordReset = false">Cancel</v-btn>
          <v-btn 
            color="primary" 
            :loading="resetLoading"
            @click="handlePasswordReset"
          >
            Send Reset Email
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-sheet>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import useAuth from '@/composables/useAuth';
import useNotify from '@/composables/useNotify';

const router = useRouter();
const notify = useNotify();
const { loginUser, resetPassword, isLoading, authError } = useAuth();

const pageModel = ref(null);   
const pageData = ref(null);
const loginForm = ref(null);
const formValid = ref(false);
const showPasswordReset = ref(false);
const resetLoading = ref(false);

const loginData = ref({
  email: '',
  password: ''
});

const resetEmail = ref('');

const pageMetaData = {
  title: "Login"
};

// Validation rules
const emailRules = [
  v => !!v || 'Email is required',
  v => /.+@.+\..+/.test(v) || 'Email must be valid'
];

const passwordRules = [
  v => !!v || 'Password is required',
  v => v.length >= 6 || 'Password must be at least 6 characters'
];

// Handle login submission
const handleLogin = async () => {
  if (!formValid.value) return;

  const result = await loginUser(loginData.value.email, loginData.value.password);
  
  if (result.success) {
    // Navigate to redirect page or default
    router.push(result.redirectTo);
  }
};

// Handle password reset
const handlePasswordReset = async () => {
  if (!resetEmail.value || !/.+@.+\..+/.test(resetEmail.value)) {
    notify.error('Please enter a valid email address');
    return;
  }

  resetLoading.value = true;
  const result = await resetPassword(resetEmail.value);
  resetLoading.value = false;

  if (result.success) {
    showPasswordReset.value = false;
    resetEmail.value = '';
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
/* Add any specific styles for login page */
</style>