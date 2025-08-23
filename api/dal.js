import { getDbForProject } from './_lib/firebaseAdminManager.js';
import admin from 'firebase-admin';

/**
 * @file api/dal.js
 * @description Single API endpoint to handle all DAL operations securely on the server.
 */

export default async function handler(req, res) {
  // This endpoint only accepts POST requests.
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('Method Not Allowed');
  }

  try {
    // 1. Get the project ID from the header.
    const projectId = req.headers['x-project-id'];
    if (!projectId) {
      return res.status(400).json({ error: 'X-Project-ID header is required.' });
    }

    // 2. Get the action and params from the request body.
    const { action, params } = req.body;
    if (!action || !params) {
      return res.status(400).json({ error: 'Request body must include "action" and "params".' });
    }

    // 3. Get the correct Firestore instance from the manager.
    const db = getDbForProject(projectId);
    let result;

    // 4. Perform the database operation based on the action.
    switch (action) {
      case 'getItemById': {
        const { collectionName, id } = params;
        const docRef = await db.collection(collectionName).doc(id).get();
        if (!docRef.exists) {
          result = null;
        } else {
          result = { id: docRef.id, ...docRef.data() };
        }
        return res.status(200).json(result);
      }

      case 'getAllItems': {
        const { collectionName } = params;
        const snapshot = await db.collection(collectionName).get();
        result = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return res.status(200).json(result);
      }

      case 'addItem': {
        const { collectionName, data } = params;
        const dataToAdd = {
          ...data,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          lastModified: admin.firestore.FieldValue.serverTimestamp(),
        };
        const docRef = await db.collection(collectionName).add(dataToAdd);
        return res.status(201).json({ id: docRef.id });
      }

      case 'setItem': {
        const { collectionName, id, data, merge = false } = params;
        const dataToSet = { ...data };
        if (merge) {
            dataToSet.lastModified = admin.firestore.FieldValue.serverTimestamp();
        } else {
            dataToSet.createdAt = data.createdAt || admin.firestore.FieldValue.serverTimestamp();
            dataToSet.lastModified = admin.firestore.FieldValue.serverTimestamp();
        }
        await db.collection(collectionName).doc(id).set(dataToSet, { merge });
        return res.status(200).json({ id });
      }

      case 'updateItem': {
        const { collectionName, id, updateData } = params;
        const dataToUpdate = {
          ...updateData,
          lastModified: admin.firestore.FieldValue.serverTimestamp(),
        };
        await db.collection(collectionName).doc(id).update(dataToUpdate);
        return res.status(200).json({ id });
      }

      case 'deleteDocument': {
        const { collectionName, id } = params;
        await db.collection(collectionName).doc(id).delete();
        return res.status(200).json({ id, message: 'Document deleted successfully.' });
      }
      
      // Note: touchLastModified is effectively an updateItem call.
      // The client can call updateItem with an empty object to achieve this.

      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }
  } catch (error) {
    console.error(`API Error: ${error.message}`, {
      code: error.code,
      stack: error.stack,
    });
    // Avoid sending detailed server errors to the client.
    return res.status(500).json({ error: 'An internal server error occurred.' });
  }
}