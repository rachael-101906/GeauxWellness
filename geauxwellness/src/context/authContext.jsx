/* eslint-disable react-hooks/exhaustive-deps */
import {
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { createContext, useContext, useEffect, useState } from 'react'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'

import { auth, db } from '../../services/firebase'

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const ensureUserProfile = async (firebaseUser, firstName = '') => {
    if (!firebaseUser?.uid) return

    const userRef = doc(db, 'users', firebaseUser.uid)
    const snapshot = await getDoc(userRef)

    if (!snapshot.exists()) {
      await setDoc(userRef, {
        firstName: firstName || firebaseUser.displayName || '',
        lastName: '',
        email: firebaseUser.email || '',
        memberSince: serverTimestamp(),
      })
      return
    }

    // Keep key profile fields in sync without overwriting existing user data.
    await setDoc(
      userRef,
      {
        email: firebaseUser.email || snapshot.data()?.email || '',
        firstName: snapshot.data()?.firstName || firstName || firebaseUser.displayName || '',
      },
      { merge: true },
    )
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        try {
          await ensureUserProfile(firebaseUser)
        } catch (error) {
          console.error('Error ensuring user profile:', error)
        }
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const register = async (firstName, email, password, confirmPassword) => {
    if (password !== confirmPassword) {
      throw new Error('Passwords do not match. Please try again.')
    }

    const credential = await createUserWithEmailAndPassword(auth, email, password)

    if (firstName?.trim()) {
      await updateProfile(credential.user, { displayName: firstName.trim() })
    }

    await ensureUserProfile(credential.user, firstName?.trim() || '')
    return credential
  }

  const login = async (email, password) => {
    const credential = await signInWithEmailAndPassword(auth, email, password)
    await ensureUserProfile(credential.user)
    return credential
  }
  const forgottenPassword = (email) => sendPasswordResetEmail(auth, email)
  const logout = () => signOut(auth)

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        forgottenPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
