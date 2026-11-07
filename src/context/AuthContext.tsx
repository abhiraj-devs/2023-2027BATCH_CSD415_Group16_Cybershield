import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  User, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  deleteUser,
  signOut, 
  onAuthStateChanged,
  browserPopupRedirectResolver
} from "firebase/auth";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "../services/firebase";
import { deleteAccountApi } from "../services/api";

export const ADMIN_EMAIL = "abhirajcsecec@gmail.com";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  role: "admin" | "user" | null;
  isAdmin: boolean;
  emailVerified: boolean;
  error: string | null;
  setError: (err: string | null) => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  deleteCurrentAccount: () => Promise<void>;
  resendVerificationEmail: () => Promise<boolean>;
  checkEmailVerificationStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentUserEmail = user?.email?.toLowerCase().trim() || "";
  const isAdmin = currentUserEmail === ADMIN_EMAIL.toLowerCase();
  const role = user ? (isAdmin ? "admin" : "user") : null;
  // All authenticated users have immediate, full access without OTP or verification requirements
  const emailVerified = !!user;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser && currentUser.email) {
        const userIsAdmin = currentUser.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
        const assignedRole = userIsAdmin ? "admin" : "user";

        try {
          localStorage.setItem("cybershield_user", JSON.stringify({
            email: currentUser.email,
            uid: currentUser.uid,
            displayName: currentUser.displayName || currentUser.email.split("@")[0],
            role: assignedRole,
            emailVerified: true,
          }));
        } catch {}

        try {
          await setDoc(
            doc(db, "users", currentUser.uid),
            {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName || currentUser.email.split("@")[0],
              photoURL: currentUser.photoURL || "",
              role: assignedRole,
              emailVerified: true,
              lastLoginAt: new Date().toISOString(),
            },
            { merge: true }
          );

          if (userIsAdmin) {
            await setDoc(
              doc(db, "admins", currentUser.uid),
              {
                uid: currentUser.uid,
                email: currentUser.email,
                grantedAt: new Date().toISOString(),
              },
              { merge: true }
            );
          }
        } catch (err) {
          console.warn("Could not sync profile to Firestore:", err);
        }
      } else {
        try {
          localStorage.removeItem("cybershield_user");
          localStorage.removeItem("cybershield_token");
        } catch {}
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider, browserPopupRedirectResolver);
      setUser(result.user);
    } catch (err: any) {
      console.error("Google sign in error:", err);
      const msg = err.message || "Failed to sign in with Google";
      setError(msg);
      throw new Error(msg);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    setError(null);
    const normalizedEmail = email.trim();
    try {
      const cred = await signInWithEmailAndPassword(auth, normalizedEmail, password);
      setUser(cred.user);
    } catch (err: any) {
      console.error("Firebase sign in error:", err);
      let msg = err.message || "Failed to sign in. Please verify your credentials.";
      if (
        err.code === "auth/invalid-credential" || 
        err.code === "auth/user-not-found" || 
        err.code === "auth/wrong-password"
      ) {
        msg = "Invalid email or password. Please check your credentials.";
      } else if (err.code === "auth/invalid-email") {
        msg = "Please enter a valid email address.";
      } else if (err.code === "auth/too-many-requests") {
        msg = "Too many failed attempts. Please try again later.";
      }
      setError(msg);
      throw new Error(msg);
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    setError(null);
    const normalizedEmail = email.trim();
    try {
      const cred = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
      setUser(cred.user);
    } catch (err: any) {
      console.error("Firebase registration error:", err);
      let msg = err.message || "Failed to register account.";
      if (err.code === "auth/email-already-in-use") {
        msg = "This email is already registered. Please sign in instead.";
      } else if (err.code === "auth/weak-password") {
        msg = "Password should be at least 6 characters.";
      } else if (err.code === "auth/invalid-email") {
        msg = "Please enter a valid email address.";
      }
      setError(msg);
      throw new Error(msg);
    }
  };

  const logout = async () => {
    try {
      try {
        localStorage.removeItem("cybershield_user");
        localStorage.removeItem("cybershield_token");
      } catch {}
      await signOut(auth);
      setUser(null);
    } catch (err: any) {
      console.error("Sign out error:", err);
      setError(err.message || "Failed to sign out");
    }
  };

  const deleteCurrentAccount = async () => {
    setError(null);
    const currentUser = auth.currentUser;
    const email = currentUser?.email || user?.email || "";
    if (!currentUser) return;

    try {
      const uid = currentUser.uid;
      try {
        await deleteDoc(doc(db, "users", uid));
      } catch (e) {
        console.warn("Firestore user doc deletion warning:", e);
      }

      if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        try {
          await deleteDoc(doc(db, "admins", uid));
        } catch (e) {
          console.warn("Firestore admin doc deletion warning:", e);
        }
      }

      try {
        await deleteUser(currentUser);
      } catch (delErr: any) {
        if (delErr.code === "auth/requires-recent-login") {
          throw new Error("Security verification expired. Please sign out, sign back in, and try deleting your account again.");
        }
        console.warn("Firebase deleteUser warning:", delErr);
      }

      if (email) {
        try {
          await deleteAccountApi(email);
        } catch (e) {
          console.warn("Server account purge warning:", e);
        }
      }

      try {
        localStorage.removeItem("cybershield_user");
        localStorage.removeItem("cybershield_token");
      } catch {}

      setUser(null);
    } catch (err: any) {
      console.error("Failed to delete user account:", err);
      setError(err.message || "Failed to delete account");
      throw err;
    }
  };

  const resendVerificationEmail = async (): Promise<boolean> => {
    return true;
  };

  const checkEmailVerificationStatus = async (): Promise<boolean> => {
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        role,
        isAdmin,
        emailVerified,
        error,
        setError,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        logout,
        deleteCurrentAccount,
        resendVerificationEmail,
        checkEmailVerificationStatus,
      }}
    >
      {children}
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
