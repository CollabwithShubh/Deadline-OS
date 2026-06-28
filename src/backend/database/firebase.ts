import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

let db: any;

export function getDb() {
  if (db) return db;
  
  try {
    let configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (process.env.NODE_ENV === 'production' && fs.existsSync(path.join(process.cwd(), 'firebase-applet-config.production.json'))) {
      configPath = path.join(process.cwd(), 'firebase-applet-config.production.json');
    } else if (process.env.NODE_ENV === 'staging' && fs.existsSync(path.join(process.cwd(), 'firebase-applet-config.staging.json'))) {
      configPath = path.join(process.cwd(), 'firebase-applet-config.staging.json');
    }
    
    if (!fs.existsSync(configPath)) {
      throw new Error(`Firebase config not found at ${configPath}`);
    }
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    const firebaseConfig = {
      apiKey: config.apiKey,
      authDomain: config.authDomain,
      projectId: config.projectId,
      storageBucket: config.storageBucket,
      messagingSenderId: config.messagingSenderId,
      appId: config.appId
    };
    
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    
    if (config.firestoreDatabaseId) {
      db = getFirestore(app, config.firestoreDatabaseId);
    } else {
      db = getFirestore(app);
    }
    
    console.log('Firebase initialized successfully with database:', config.firestoreDatabaseId || 'default');
    return db;
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    throw error;
  }
}
