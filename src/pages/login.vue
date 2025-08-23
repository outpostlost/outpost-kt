<template>
  <v-app>
    <v-main>
      <v-container fluid class="fill-height">
        <v-row justify="center" align="center" class="fill-height">
          <v-col cols="12" sm="8" md="6" lg="4" xl="3">
            
            <v-card-title class="text-center text-h4 mb-8 pa-0">
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
                class="mb-4"
              />

              <v-text-field
                v-model="loginData.password"
                label="Password"
                type="text"
                :rules="passwordRules"
                :disabled="isLoading"
                required
                variant="outlined"
                class="mb-4"
              />

              <v-btn
                type="submit"
                color="primary"
                block
                :loading="isLoading"
                :disabled="!formValid || isLoading"
                size="large"
                class="mb-4"
              >
                Login
              </v-btn>

              <!-- Generic Login Error Display -->
              <v-alert
                v-if="loginError"
                type="error"
                variant="tonal"
                class="mb-4"
                text="Login failed. Please check your credentials and try again."
              />

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
    </v-main>

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
  </v-app>
</template>

<script setup>
import { ref, onMounted } from 'vue';
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
  v => v.length >= 1 || 'Password is required'
];

// Handle login submission
const handleLogin = async () => {
  if (!formValid.value) return;

  loginError.value = false; // Clear previous error
  
  const result = await loginUser(loginData.value.email, loginData.value.password);
  
  if (result.success) {
    router.push(result.redirectTo);
  } else {
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
.fill-height {
  height: 100vh;
}
</style>