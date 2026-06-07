// src/config/firebase.config.ts

import * as admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

let firebaseApp: admin.app.App;

function initializeFirebase(): admin.app.App {
  if (admin.apps.length > 0) {
    return admin.apps[0] as admin.app.App;
  }

  // Option A: Load from service account JSON file path
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (serviceAccountPath) {
    const resolvedPath = path.resolve(serviceAccountPath);
    if (fs.existsSync(resolvedPath)) {
      const serviceAccount = JSON.parse(
        fs.readFileSync(resolvedPath, 'utf-8'),
      ) as admin.ServiceAccount;

      return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
  }

  // Option B: Build credential from individual environment variables
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Firebase credentials are missing. ' +
        'Set FIREBASE_SERVICE_ACCOUNT_PATH or ' +
        'FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY in .env',
    );
  }

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      // Replace escaped newlines from .env string format
      privateKey: privateKey.replace(/\\n/g, '\n'),
    }),
  });
}

firebaseApp = initializeFirebase();

export { firebaseApp };
export const auth = admin.auth(firebaseApp);
export const firestore = admin.firestore(firebaseApp);

// Enable Firestore emulator if configured
const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST;
if (emulatorHost) {
  process.env.FIRESTORE_EMULATOR_HOST = emulatorHost;
  console.log(`[Firebase] Using Firestore Emulator at ${emulatorHost}`);
}