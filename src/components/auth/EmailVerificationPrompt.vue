<template>
  <v-main>
    <v-container class="fill-height" fluid>
      <v-row align="center" justify="center">
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title class="text-h5 text-center">
              Email Verification Required
            </v-card-title>
            
            <v-card-text class="text-center">
              <v-icon 
                icon="mdi-email-outline" 
                size="64" 
                color="warning" 
                class="mb-4" 
              />
              
              <p>Please check your email and click the verification link to access the app.</p>
              <p><strong>Email:</strong> {{ userEmail }}</p>
              <p class="text-caption mt-4">
                After clicking the verification link, you will be automatically redirected back.
              </p>
              
              <v-btn 
                color="primary" 
                @click="handleResendVerification"
                :loading="isResending"
                class="mt-4 mr-2"
              >
                Resend Verification Email
              </v-btn>
              
              <v-btn 
                color="info" 
                @click="handleCheckVerification"
                :loading="isChecking"
                class="mt-4 mr-2"
              >
                Check Verification Status
              </v-btn>
              
              <v-btn 
                color="error" 
                @click="handleLogout"
                class="mt-4"
              >
                Logout
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script setup>
import { ref } from 'vue'
import useNotify from '@/composables/useNotify'

const notify = useNotify()

// Mock props/data for future auth integration
const userEmail = ref('user@example.com')
const isResending = ref(false)
const isChecking = ref(false)

const handleResendVerification = async () => {
  isResending.value = true
  // Future: actual resend verification logic
  notify.info('Resend verification function would run now')
  isResending.value = false
}

const handleCheckVerification = async () => {
  isChecking.value = true
  // Future: actual check verification logic
  notify.info('Check verification function would run now')
  isChecking.value = false
}

const handleLogout = async () => {
  // Future: actual logout logic
  notify.info('Logout function would run now')
}
</script>