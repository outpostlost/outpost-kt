//import multiProjectDAL from '@/dal/multiProjectDal';

class BlobUploadService {
  
  /**
   * Upload file to blob storage and store metadata in Firestore
   */
  async uploadFile(file, metadata) {
    console.log('=== SERVICE METHOD DEBUG ===');
    console.log('Service Method Debug - this context:', this);
    console.log('Service Method Debug - arguments.length:', arguments.length);
    console.log('Service Method Debug - Received file parameter:', file);
    console.log('Service Method Debug - File type:', typeof file);
    console.log('Service Method Debug - File size:', file?.size);
    console.log('Service Method Debug - File name:', file?.name);
    console.log('Service Method Debug - Received metadata parameter:', metadata);
    console.log('Service Method Debug - Starting upload process...');
    
    try {
      // Ensure we're using the operational project
      await multiProjectDAL.switchToProject('operational');
      console.log('Service Debug - Switched to operational project');

      // Build the URL
      const uploadUrl = `/api/blob-upload?filename=${encodeURIComponent(metadata.fileName)}`;
      console.log('Service Debug - Upload URL:', uploadUrl);

      // Upload raw file to blob storage via API
      console.log('Service Debug - About to fetch API...');
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: file,
      });

      console.log('Service Debug - Response status:', response.status);
      console.log('Service Debug - Response ok:', response.ok);
      
      const result = await response.json();
      console.log('Service Debug - Response JSON:', result);

      if (!result.success) {
        throw new Error(result.message || 'Blob upload failed');
      }

      // Prepare complete metadata for Firestore
      const firestoreMetadata = {
        fileName: metadata.fileName,
        description: metadata.description,
        source: metadata.source,
        notes: metadata.notes ? [metadata.notes] : [],
        url: result.blobUrl,
        fileSize: file.size,
        fileType: file.type,
        uploadStatus: 'successful',
        uploadType: 'new'
      };

      console.log('Service Debug - About to store metadata:', firestoreMetadata);

      // Store metadata in Firestore
      const documentId = await multiProjectDAL.addItem('dataUploads', firestoreMetadata);

      console.log(`Upload complete - Blob: ${result.blobUrl}, Document: ${documentId}`);

      return {
        success: true,
        blobUrl: result.blobUrl,
        documentId,
        fileSize: file.size,
        fileType: file.type
      };

    } catch (error) {
      console.error('Service Debug - Error caught:', error);

      // Store failure metadata in Firestore (with safer file access)
      try {
        const failureMetadata = {
          fileName: metadata.fileName,
          description: metadata.description || '',
          source: metadata.source || '',
          notes: metadata.notes ? [metadata.notes] : [],
          url: '',
          fileSize: file?.size || 0,
          fileType: file?.type || '',
          uploadStatus: 'failure',
          uploadType: 'new'
        };
        
        console.log('Service Debug - Storing failure metadata:', failureMetadata);
        await multiProjectDAL.addItem('dataUploads', failureMetadata);
      } catch (metadataError) {
        console.error('Service Debug - Failed to store failure metadata:', metadataError);
      }

      throw error;
    }
  }
}

export default new BlobUploadService();