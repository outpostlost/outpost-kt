/**
 * @file src/dal/multiProjectDal.js
 * @description Refactored DAL that acts as a lightweight wrapper for the server-side DAL API.
 * It contains zero imports from the 'firebase' package. Its only job is to make fetch requests
 * to the secure server-side API endpoints.
 */

// Helper function to centralize API calls
async function apiCall(action, params, projectId) {
  if (!projectId) {
    throw new Error('No active project set. Call switchToProject() first.');
  }

  try {
    const response = await fetch('/api/dal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Project-ID': projectId,
      },
      body: JSON.stringify({ action, params }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'API error with no JSON response' }));
      console.error('API Error:', response.status, response.statusText, errorData);
      const error = new Error(`API Error: ${response.statusText} - ${errorData.error}`);
      error.statusCode = response.status;
      throw error;
    }

    return await response.json();
  } catch (error) {
    console.error(`DAL Fetch Error (${action}):`, error);
    // Re-throw the error so the calling component can handle it.
    throw error;
  }
}


class MultiProjectDAL {
  constructor() {
    this.activeProject = 'operational'; // Default to operational project
    this.initialized = true; // No async initialization needed anymore
    console.log('MultiProjectDAL (API Wrapper): Initialized');
  }

  async initialize() {
    // This function is kept for backward compatibility but does nothing.
    return Promise.resolve();
  }

  async loadProject(projectId, firebaseConfig) {
    // This function is kept for backward compatibility but does nothing.
    // Project loading is now handled securely on the server.
    console.log(`Project "${projectId}" is managed server-side. No client-side loading required.`);
    return Promise.resolve();
  }

  async switchToProject(projectId) {
    if (!projectId) {
      console.error('switchToProject requires a projectId');
      return;
    }
    this.activeProject = projectId;
    console.log(`MultiProjectDAL: Switched to project ${projectId}`);
    return Promise.resolve({ projectId });
  }

  getActiveProjectId() {
    return this.activeProject;
  }

  // === CRUD Operations (now using the API) ===

  async getItemById(collectionName, id, projectId = null) {
    const targetProject = projectId || this.activeProject;
    const params = { collectionName, id };
    return apiCall('getItemById', params, targetProject);
  }

  async addItem(collectionName, data, projectId = null) {
    const targetProject = projectId || this.activeProject;
    const params = { collectionName, data };
    const result = await apiCall('addItem', params, targetProject);
    return result.id; // Return only the new document ID, as before.
  }

  async setItem(collectionName, id, data, merge = false, projectId = null) {
    const targetProject = projectId || this.activeProject;
    const params = { collectionName, id, data, merge };
    return apiCall('setItem', params, targetProject);
  }

  async updateItem(collectionName, id, updateData, projectId = null) {
    const targetProject = projectId || this.activeProject;
    const params = { collectionName, id, updateData };
    return apiCall('updateItem', params, targetProject);
  }

  async deleteDocument(collectionName, id, projectId = null) {
    const targetProject = projectId || this.activeProject;
    const params = { collectionName, id };
    return apiCall('deleteDocument', params, targetProject);
  }

  async getAllItems(collectionName, queryConstraints = [], projectId = null) {
    // queryConstraints are ignored in this version, as server-side querying is not yet implemented.
    if (queryConstraints.length > 0) {
      console.warn('getAllItems: queryConstraints are not supported in this DAL version and will be ignored.');
    }
    const targetProject = projectId || this.activeProject;
    const params = { collectionName };
    return apiCall('getAllItems', params, targetProject);
  }

  async touchLastModified(collectionName, id, projectId = null) {
    // Implemented by sending an empty update request, which the server handles.
    const targetProject = projectId || this.activeProject;
    const params = { collectionName, id, updateData: {} };
    return apiCall('updateItem', params, targetProject);
  }
}

// Export singleton instance
const multiProjectDAL = new MultiProjectDAL();
export default multiProjectDAL;

// Export individual functions for backwards compatibility
export const {
  getItemById,
  addItem,
  setItem,
  updateItem,
  deleteDocument,
  getAllItems,
  touchLastModified
} = multiProjectDAL;