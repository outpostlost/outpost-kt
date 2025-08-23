import { ref } from 'vue';
import blobUploadService from '@/services/blobUploadService';

export default function useBlobUpload() {
  const isUploading = ref(false);
  const uploadResult = ref(null);
  const uploadError = ref(null);

  const uploadFile = async (file, metadata) => {
    console.log('=== COMPOSABLE DEBUG ===');
    console.log('Composable Debug - Received file:', file);
    console.log('Composable Debug - File type:', typeof file);
    console.log('Composable Debug - File size:', file?.size);
    console.log('Composable Debug - File name:', file?.name);
    console.log('Composable Debug - Received metadata:', metadata);
    console.log('Composable Debug - About to call blobUploadService.uploadFile...');
    
    isUploading.value = true;
    uploadResult.value = null;
    uploadError.value = null;

    try {
      const result = await blobUploadService.uploadFile(file, metadata);
      uploadResult.value = result;
      return result;
    } catch (error) {
      uploadError.value = error.message;
      throw error;
    } finally {
      isUploading.value = false;
    }
  };

  const resetUpload = () => {
    uploadResult.value = null;
    uploadError.value = null;
  };

  return {
    isUploading,
    uploadResult,
    uploadError,
    uploadFile,
    resetUpload
  };
}