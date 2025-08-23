<template>
  <v-row no-gutters align="center">
    <v-col>
      {{ message }}
    </v-col>
    <v-col cols="auto">
      <v-btn
        :icon="currentIcon"
        variant="text"
        size="small"
        @click="copyToClipboard"
      />
    </v-col>
  </v-row>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  message: {
    type: String,
    required: true
  },
  toastId: {
    type: [String, Number],
    default: null
  }
});

const currentIcon = ref('mdi-content-copy');

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(props.message);
    currentIcon.value = 'mdi-check-circle-outline';
    
    setTimeout(() => {
      currentIcon.value = 'mdi-content-copy';
    }, 2000);
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
  }
};
</script>