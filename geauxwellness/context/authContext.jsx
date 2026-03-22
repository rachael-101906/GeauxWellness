import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { serverTimestamp } from "firebase/firestore";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const register = async (firstName, email, password, confirmPassword) => {
    if (password !== confirmPassword) {
      throw new Error("Passwords do not match. Please try again.");
    }
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", user.uid), {
      firstName,
      email,
      createdAt: serverTimestamp(),
    });
    return user;
  };

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const forgottenPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  const logout = () => signOut(auth);

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
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
