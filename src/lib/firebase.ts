import { initializeApp, type FirebaseOptions } from 'firebase/app'
import { connectAuthEmulator, getAuth } from 'firebase/auth'
import { connectFirestoreEmulator, initializeFirestore } from 'firebase/firestore'

const config: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

/** True once every required Firebase env var has been supplied. Falls back to local-only mode otherwise. */
export const firebaseEnabled = Boolean(config.apiKey && config.projectId && config.appId)

const app = firebaseEnabled ? initializeApp(config) : null

export const auth = app ? getAuth(app) : null

// ignoreUndefinedProperties keeps an optional field that happens to be
// undefined from failing an entire write.
export const db = app ? initializeFirestore(app, { ignoreUndefinedProperties: true }) : null

// Local development against the Firebase emulators, opted into with
// VITE_FIREBASE_EMULATOR=1. Never active in a production build.
if (import.meta.env.DEV && import.meta.env.VITE_FIREBASE_EMULATOR === '1' && auth && db) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
  connectFirestoreEmulator(db, '127.0.0.1', 8080)
}
