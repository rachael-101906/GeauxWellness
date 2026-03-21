import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyCR_WVVUdQeCmu2zmQvPxzO6HLsmcy2HUE',
  authDomain: 'geauxwellness-4b645.firebaseapp.com',
  projectId: 'geauxwellness-4b645',
  storageBucket: 'geauxwellness-4b645.firebasestorage.app',
  messagingSenderId: '350661489394',
  appId: '1:350661489394:web:da05a2e597f92492c9166b',
  measurementId: 'G-X6PKFC5ZP9',
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)

export { auth, db, storage }
