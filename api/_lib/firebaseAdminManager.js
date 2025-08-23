import admin from 'firebase-admin';

/**
 * @file api/_lib/firebaseAdminManager.js
 * @description Server-side manager for initializing and handling multiple Firebase Admin SDK instances.
 * This is the secure, server-side equivalent of the original multiProjectDal.
 */

// This object caches initialized apps for performance in a serverless environment.
// This prevents re-initialization on every API call.
const initializedApps = {};

/**
 * Retrieves and parses the service account JSON from environment variables.
 * @param {string} projectId - The ID of the project ('operational', 'bizData', etc.)
 * @returns {object} The parsed service account credential object.
 */
function getServiceAccount(projectId) {
  switch (projectId) {
    case 'operational':
      if (!process.env.FIREBASE_ADMIN_OPERATIONAL_KEY) throw new Error('FIREBASE_ADMIN_OPERATIONAL_KEY not set');
      return JSON.parse(process.env.FIREBASE_ADMIN_OPERATIONAL_KEY);
    case 'bizData':
      if (!process.env.FIREBASE_ADMIN_BIZDATA_KEY) throw new Error('FIREBASE_ADMIN_BIZDATA_KEY not set');
      return JSON.parse(process.env.FIREBASE_ADMIN_BIZDATA_KEY);
    case 'bizTrends':
      if (!process.env.FIREBASE_ADMIN_BIZTRENDS_KEY) throw new Error('FIREBASE_ADMIN_BIZTRENDS_KEY not set');
      return JSON.parse(process.env.FIREBASE_ADMIN_BIZTRENDS_KEY);
    case 'audit':
      if (!process.env.FIREBASE_ADMIN_AUDIT_KEY) throw new Error('FIREBASE_ADMIN_AUDIT_KEY not set');
      return JSON.parse(process.env.FIREBASE_ADMIN_AUDIT_KEY);
    default:
      throw new Error(`Invalid or unsupported project ID: ${projectId}`);
  }
}

/**
 * Initializes a Firebase Admin app for a given project ID if it hasn't been already.
 * @param {string} projectId - The ID of the project.
 * @returns {admin.app.App} The initialized Firebase Admin app instance.
 */
function initializeAppForProject(projectId) {
  // If the app is already initialized, return the cached instance.
  if (initializedApps[projectId]) {
    return initializedApps[projectId];
  }

  const serviceAccount = getServiceAccount(projectId);

  // Initialize the app with a UNIQUE name. This is required for multi-app support.
  // We use the projectId as the unique app name.
  const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  }, projectId);

  // Cache the initialized app
  initializedApps[projectId] = app;

  console.log(`Firebase Admin SDK initialized for project: ${projectId}`);
  return app;
}

/**
 * Gets the Firestore instance for a specific project.
 * @param {string} projectId - The ID of the project.
 * @returns {admin.firestore.Firestore} The Firestore instance for the specified project.
 */
export function getDbForProject(projectId) {
  const app = initializeAppForProject(projectId);
  return app.firestore();
}

/**
 * Gets the Auth instance for a specific project.
 * NOTE: This is included for Phase 2, but will not be used in Phase 1.
 * @param {string} projectId - The ID of the project.
 * @returns {admin.auth.Auth} The Auth instance for the specified project.
 */
export function getAuthForProject(projectId) {
  const app = initializeAppForProject(projectId);
  return app.auth();
}