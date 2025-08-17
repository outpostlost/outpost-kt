/**
 * @file src/dal/multiProjectDal.js
 * @description Enhanced DAL supporting multiple Firebase projects with dynamic switching capabilities
 * Extends the existing single-project DAL to support toolbench's multi-project requirements
 */

import {
    initializeApp,
    getApps,
    deleteApp
} from 'firebase/app';
import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    collection,
    query,
    getDocs,
    Timestamp
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

class MultiProjectDAL {
    constructor() {
        this.activeProject = null;
        this.projectConfigs = new Map();
        this.firebaseApps = new Map();
        this.firestoreInstances = new Map();
        this.initialized = false;
    }

    /**
     * Initialize the multi-project DAL
     */
    async initialize() {
        if (this.initialized) return;

        try {
            console.log('MultiProjectDAL: Initializing...');
            this.initialized = true;
            console.log('MultiProjectDAL: Initialization complete');
        } catch (error) {
            console.error('MultiProjectDAL: Initialization failed:', error);
            throw error;
        }
    }

    /**
     * Load and register a Firebase project configuration
     */
    async loadProject(projectId, firebaseConfig) {
        await this.initialize();

        try {
            // Validate configuration
            this.validateFirebaseConfig(firebaseConfig);

            // Check if project already loaded
            if (this.projectConfigs.has(projectId)) {
                //console.log(`MultiProjectDAL: Project ${projectId} already loaded`);
                return this.projectConfigs.get(projectId);
            }

            // Create unique app name
            const appName = `toolbench-${projectId}`;

            // Check if app already exists (cleanup from previous session)
            const existingApp = getApps().find(app => app.name === appName);
            if (existingApp) {
                await deleteApp(existingApp);
                //console.log(`MultiProjectDAL: Cleaned up existing app: ${appName}`);
            }

            // Initialize Firebase app
            const app = initializeApp(firebaseConfig, appName);
            const db = getFirestore(app);

            // Store references
            this.projectConfigs.set(projectId, firebaseConfig);
            this.firebaseApps.set(projectId, app);
            this.firestoreInstances.set(projectId, db);

            //console.log(`MultiProjectDAL: Project ${projectId} loaded successfully`);
            return firebaseConfig;

        } catch (error) {
            console.error(`MultiProjectDAL: Failed to load project ${projectId}:`, error);
            throw error;
        }
    }

    /**
     * Switch to a specific Firebase project
     */
    async switchToProject(projectId) {
        await this.initialize();

        if (!this.projectConfigs.has(projectId)) {
            throw new Error(`Project ${projectId} not loaded. Call loadProject() first.`);
        }

        this.activeProject = projectId;
        //console.log(`MultiProjectDAL: Switched to project ${projectId}`);
        
        return {
            projectId,
            config: this.projectConfigs.get(projectId),
            app: this.firebaseApps.get(projectId),
            db: this.firestoreInstances.get(projectId)
        };
    }

    /**
     * Get Firestore instance for active or specified project
     */
    getFirestore(projectId = null) {
        const targetProject = projectId || this.activeProject;
        
        if (!targetProject) {
            throw new Error('No active project set and no projectId specified. Call switchToProject() first.');
        }

        if (!this.firestoreInstances.has(targetProject)) {
            throw new Error(`Project ${targetProject} not loaded. Call loadProject() first.`);
        }

        return this.firestoreInstances.get(targetProject);
    }

    /**
     * Get currently active project ID
     */
    getActiveProjectId() {
        return this.activeProject;
    }

    /**
     * Get all loaded projects
     */
    getLoadedProjects() {
        return Array.from(this.projectConfigs.keys());
    }

    /**
     * Validate Firebase configuration
     */
    validateFirebaseConfig(config) {
        const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
        const missingFields = requiredFields.filter(field => !config[field]);

        if (missingFields.length > 0) {
            throw new Error(`Invalid Firebase config. Missing fields: ${missingFields.join(', ')}`);
        }

        return true;
    }

    /**
     * Helper for Firestore error handling
     */
    handleFirestoreError(error, context, projectId = null) {
        const project = projectId || this.activeProject || 'unknown';
        console.error(`MultiProjectDAL Error [${project}] (${context}):`, error.code, error.message, error);
        
        error.statusCode = error.code === 'permission-denied' ? 403 :
                          error.code === 'unauthenticated' ? 401 :
                          error.code === 'not-found' ? 404 : 500;
        throw error;
    }

    // === CRUD Operations (with multi-project support) ===

    /**
     * Retrieve a document by ID from specified collection
     */
    async getItemById(collectionName, id, projectId = null) {
        const targetProject = projectId || this.activeProject;
        const context = `getItemById (${collectionName}) [Project: ${targetProject}]`;
        
        if (!collectionName || !id) {
            const error = new Error("Collection name and ID are required.");
            error.statusCode = 400;
            throw error;
        }

        try {
            const db = this.getFirestore(projectId);
            //console.log(`DEBUG: ${context} - Using project: ${targetProject}`);
            
            const docRef = doc(db, collectionName, id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                delete data.id; // Prevent ID collision
                return { id: docSnap.id, ...data };
            } else {
                console.warn(`${context}: Document with ID ${id} not found.`);
                return null;
            }
        } catch (error) {
            this.handleFirestoreError(error, context, targetProject);
        }
    }

    /**
     * Add a new document with auto-generated ID
     */
    async addItem(collectionName, data, projectId = null) {
        const targetProject = projectId || this.activeProject;
        const context = `addItem (${collectionName}) [Project: ${targetProject}]`;
        
        if (!collectionName || !data) {
            const error = new Error("Collection name and data are required.");
            error.statusCode = 400;
            throw error;
        }

        const dataToAdd = {
            ...data,
            createdAt: data.createdAt || new Date().toISOString(),
            lastModified: new Date().toISOString(),
        };

        try {
            const db = this.getFirestore(projectId);
            const collectionRef = collection(db, collectionName);
            const docRef = await addDoc(collectionRef, dataToAdd);
            
            //console.log(`${context}: Document added with ID ${docRef.id}`);
            return docRef.id;
        } catch (error) {
            this.handleFirestoreError(error, context, targetProject);
        }
    }

    /**
     * Set (create or overwrite) a document with specific ID
     */
    async setItem(collectionName, id, data, merge = false, projectId = null) {
        const targetProject = projectId || this.activeProject;
        const context = `setItem (${collectionName}) [Project: ${targetProject}]`;
        
        if (!collectionName || !id || !data) {
            const error = new Error("Collection name, ID, and data are required.");
            error.statusCode = 400;
            throw error;
        }

        const dataToSet = {
            ...data,
            lastModified: new Date().toISOString(),
            ...((!merge && !data.createdAt) ? { createdAt: new Date().toISOString() } : {}),
        };

        // Remove ID field if it matches the document ID
        if (dataToSet.hasOwnProperty('id') && dataToSet.id === id) {
            delete dataToSet.id;
        }

        try {
            const db = this.getFirestore(projectId);
            const docRef = doc(db, collectionName, id);
            await setDoc(docRef, dataToSet, { merge: merge });
            
            //console.log(`${context}: Document ${merge ? 'merged' : 'set'} with ID ${id}`);
        } catch (error) {
            this.handleFirestoreError(error, context, targetProject);
        }
    }

    /**
     * Update specific fields of an existing document
     */
    async updateItem(collectionName, id, updateData, projectId = null) {
        const targetProject = projectId || this.activeProject;
        const context = `updateItem (${collectionName}) [Project: ${targetProject}]`;
        
        if (!collectionName || !id || !updateData || Object.keys(updateData).length === 0) {
            const error = new Error("Collection name, ID, and non-empty update data are required.");
            error.statusCode = 400;
            throw error;
        }

        const dataToUpdate = {
            ...updateData,
            lastModified: new Date().toISOString(),
        };

        // Prevent accidental updates to protected fields
        if (dataToUpdate.hasOwnProperty('createdAt')) {
            console.warn(`${context}: Attempted to update 'createdAt' field for ID ${id}. Removing from update.`);
            delete dataToUpdate.createdAt;
        }
        if (dataToUpdate.hasOwnProperty('id')) {
            console.warn(`${context}: Attempted to update 'id' field for ID ${id}. Removing from update.`);
            delete dataToUpdate.id;
        }

        try {
            const db = this.getFirestore(projectId);
            const docRef = doc(db, collectionName, id);
            await updateDoc(docRef, dataToUpdate);
            
            //console.log(`${context}: Document updated with ID ${id}`);
        } catch (error) {
            if (error.code === 'not-found') {
                console.error(`${context}: Document with ID ${id} not found for update.`);
            }
            this.handleFirestoreError(error, context, targetProject);
        }
    }

    /**
     * Delete a document by ID
     */
    async deleteDocument(collectionName, id, projectId = null) {
        const targetProject = projectId || this.activeProject;
        const context = `deleteDocument (${collectionName}) [Project: ${targetProject}]`;
        
        if (!collectionName || !id) {
            const error = new Error("Collection name and ID are required.");
            error.statusCode = 400;
            throw error;
        }

        try {
            const db = this.getFirestore(projectId);
            const docRef = doc(db, collectionName, id);
            await deleteDoc(docRef);
            
            //console.log(`${context}: Document deleted with ID ${id}`);
        } catch (error) {
            this.handleFirestoreError(error, context, targetProject);
        }
    }

    /**
     * Retrieve all documents from a collection
     */
    async getAllItems(collectionName, queryConstraints = [], projectId = null) {
        const targetProject = projectId || this.activeProject;
        const context = `getAllItems (${collectionName}) [Project: ${targetProject}]`;
        
        if (!collectionName) {
            const error = new Error("Collection name is required.");
            error.statusCode = 400;
            throw error;
        }

        const items = [];
        try {
            const db = this.getFirestore(projectId);
            const collectionRef = collection(db, collectionName);
            const q = query(collectionRef, ...queryConstraints);
            const querySnapshot = await getDocs(q);

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                delete data.id; // Prevent ID collision
                items.push({ id: doc.id, ...data });
            });

            //console.log(`${context}: Retrieved ${items.length} documents`);
            return items;
        } catch (error) {
            this.handleFirestoreError(error, context, targetProject);
            return items;
        }
    }

    /**
     * Touch last modified timestamp
     */
    async touchLastModified(collectionName, id, projectId = null) {
        const targetProject = projectId || this.activeProject;
        const context = `touchLastModified (${collectionName}/${id}) [Project: ${targetProject}]`;
        
        if (!collectionName || !id) {
            const error = new Error("Collection name and ID are required for touchLastModified.");
            error.statusCode = 400;
            throw error;
        }

        try {
            const db = this.getFirestore(projectId);
            const docRef = doc(db, collectionName, id);
            await updateDoc(docRef, { lastModified: Timestamp.now() });
            
            //console.log(`${context}: Successfully touched document.`);
        } catch (error) {
            if (error.code === 'not-found') {
                console.error(`${context}: Document with ID ${id} not found.`);
            }
            this.handleFirestoreError(error, context, targetProject);
        }
    }

    /**
     * Clean up a project (remove from memory and delete Firebase app)
     */
    async unloadProject(projectId) {
        try {
            if (this.firebaseApps.has(projectId)) {
                const app = this.firebaseApps.get(projectId);
                await deleteApp(app);
                console.log(`MultiProjectDAL: Firebase app deleted for project: ${projectId}`);
            }

            this.projectConfigs.delete(projectId);
            this.firebaseApps.delete(projectId);
            this.firestoreInstances.delete(projectId);

            if (this.activeProject === projectId) {
                this.activeProject = null;
                //console.log(`MultiProjectDAL: Active project cleared (was ${projectId})`);
            }

            console.log(`MultiProjectDAL: Project ${projectId} unloaded successfully`);
        } catch (error) {
            console.error(`MultiProjectDAL: Failed to unload project ${projectId}:`, error);
            throw error;
        }
    }

    /**
     * Clean up all projects
     */
    async cleanup() {
        const projectIds = Array.from(this.projectConfigs.keys());
        
        for (const projectId of projectIds) {
            await this.unloadProject(projectId);
        }

        this.activeProject = null;
        //console.log('MultiProjectDAL: Cleanup complete');
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