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
            <v-container>
              <v-row justify="center">
                <v-col cols="12" sm="8" md="6" lg="4" xl="3">
                  
                  <v-card-title class="text-center text-h4 mb-6">
                    Welcome to Outpost KT
                  </v-card-title>
                  
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
                      :type="showPassword ? 'text' : 'password'"
                      :rules="passwordRules"
                      :disabled="isLoading"
                      required
                      variant="outlined"
                      class="mb-3"
                      :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                      @click:append-inner="showPassword = !showPassword"
                    />

                    <!-- Login Error Display -->
                    <v-alert
                      v-if="loginError"
                      type="error"
                      variant="text"
                      class="mb-3"
                    >
                      Login failed. Please check your credentials and try again.
                    </v-alert>

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

                </v-col>
              </v-row>
            </v-container>
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
const showPassword = ref(false);
const loginError = ref(false);

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

  loginError.value = false; // Clear previous error
  
  console.log('Attempting login with email:', loginData.value.email);
  
  const result = await loginUser(loginData.value.email, loginData.value.password);
  
  if (result.success) {
    console.log('Login successful, redirecting to:', result.redirectTo);
    router.push(result.redirectTo);
  } else {
    console.log('Login failed:', result.error);
    loginError.value = true;
  }
};

// Handle password reset
const handlePasswordReset = async () => {
  if (!resetEmail.value || !/.+@.+\..+/.test(resetEmail.value)) {
    notify.error('Please enter a valid email address');
    return;
  }

  resetLoading.value = true;
  console.log('Attempting password reset for email:', resetEmail.value);
  
  const result = await resetPassword(resetEmail.value);
  resetLoading.value = false;

  if (result.success) {
    showPasswordReset.value = false;
    resetEmail.value = '';
  } else {
    console.log('Password reset failed:', result.error);
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