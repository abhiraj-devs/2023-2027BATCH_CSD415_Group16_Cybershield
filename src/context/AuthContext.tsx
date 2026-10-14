import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  User, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  deleteUser,
  signOut, 
  sendEmailVerification, 
  onAuthStateChanged,
  browserPopupRedirectResolver
} from "firebase/auth";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "../services/firebase";
import { sendAuthOtp, verifyAuthOtp, deleteAccountApi, registerWithServerApi, loginWithServerApi } from "../services/api";

export const ADMIN_EMAIL = "abhirajcsecec@gmail.com";

interface AuthContextType {
  user: User | any | null;
  loading: boolean;
  role: "admin" | "user" | null;
  isAdmin: boolean;
  emailVerified: boolean;
  error: string | null;
  setError: (err: string | null) => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  sendEmailOtp: (email: string, purpose?: string) => Promise<{ message: string; otpCode?: string; expiresInSeconds: number }>;
  verifyEmailOtp: (email: string, otp: string) => Promise<boolean>;
  logout: () => Promise<void>;
  deleteCurrentAccount: () => Promise<void>;
  resendVerificationEmail: () => Promise<boolean>;
  checkEmailVerificationStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentUserEmail = user?.email?.toLowerCase().trim() || "";
  const isAdmin = currentUserEmail === ADMIN_EMAIL.toLowerCase();
  const role = user ? (isAdmin ? "admin" : "user") : null;
  const emailVerified = !!user; // Direct authentication without OTP verification

  const syncUserToFirestore = async (uid: string, email: string, displayName?: string, photoURL?: string) => {
    const normalizedEmail = email.toLowerCase().trim();
    const userIsAdmin = normalizedEmail === ADMIN_EMAIL.toLowerCase();
    const assignedRole = userIsAdmin ? "admin" : "user";

    try {
      await setDoc(
        doc(db, "users", uid),
        {
          uid,
          email: normalizedEmail,
          displayName: displayName || normalizedEmail.split("@")[0],
          photoURL: photoURL || "",
          role: assignedRole,
          emailVerified: true,
          lastLoginAt: new Date().toISOString(),
        },
        { merge: true }
      );

      if (userIsAdmin) {
        await setDoc(
          doc(db, "admins", uid),
          {
            uid,
            email: normalizedEmail,
            grantedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }
    } catch (err) {
      console.warn("Could not sync profile to Firestore:", err);
    }
  };

  useEffect(() => {
    // Check initial local session if available
    try {
      const savedStr = localStorage.getItem("cybershield_user");
      if (savedStr) {
        const saved = JSON.parse(savedStr);
        if (saved?.email) {
          const userIsAdmin = saved.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
          setUser({
            uid: saved.uid || "usr_" + Date.now(),
            email: saved.email,
            displayName: saved.displayName || saved.email.split("@")[0],
            photoURL: saved.photoURL || "",
            emailVerified: true,
            reload: async () => {},
          });
        }
      }
    } catch {}

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser && currentUser.email) {
        setUser(currentUser);
        setLoading(false);

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

        await syncUserToFirestore(
          currentUser.uid,
          currentUser.email,
          currentUser.displayName || undefined,
          currentUser.photoURL || undefined
        );
      } else {
        try {
          const savedStr = localStorage.getItem("cybershield_user");
          if (savedStr) {
            const saved = JSON.parse(savedStr);
            if (saved?.email) {
              setUser({
                uid: saved.uid || "usr_" + Date.now(),
                email: saved.email,
                displayName: saved.displayName || saved.email.split("@")[0],
                photoURL: saved.photoURL || "",
                emailVerified: true,
                reload: async () => {},
              });
              setLoading(false);
              return;
            }
          }
        } catch {}

        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const googleAuthPendingRef = React.useRef(false);

  const signInWithGoogle = async () => {
    setError(null);
    if (googleAuthPendingRef.current) {
      return;
    }
    googleAuthPendingRef.current = true;
    try {
      const result = await signInWithPopup(auth, googleProvider, browserPopupRedirectResolver);
      setUser(result.user);
      if (result.user.email) {
        await syncUserToFirestore(
          result.user.uid,
          result.user.email,
          result.user.displayName || undefined,
          result.user.photoURL || undefined
        );
      }
    } catch (err: any) {
      const code = err?.code || "";
      const message = err?.message || "";
      let userFriendlyMsg = "Google sign-in could not be completed.";

      if (code === "auth/popup-blocked" || message.includes("popup-blocked")) {
        userFriendlyMsg = "The Google login popup was blocked by your browser. Please allow popups or use Email & Password sign-in.";
      } else if (code === "auth/popup-closed-by-user" || message.includes("popup-closed-by-user")) {
        userFriendlyMsg = "Google sign-in popup was closed before completing.";
      } else if (code === "auth/cancelled-popup-request" || message.includes("cancelled-popup-request")) {
        userFriendlyMsg = "Previous sign-in attempt was cancelled. Please try again.";
      } else if (message.includes("INTERNAL ASSERTION FAILED")) {
        userFriendlyMsg = "Authentication window state reset. Please try signing in again.";
      } else {
        console.warn("Google sign in exception:", err);
        userFriendlyMsg = err.message || "Failed to sign in with Google";
      }

      setError(userFriendlyMsg);
      throw new Error(userFriendlyMsg);
    } finally {
      googleAuthPendingRef.current = false;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    setError(null);
    const normalizedEmail = email.trim().toLowerCase();
    try {
      const res = await signInWithEmailAndPassword(auth, normalizedEmail, password);
      setUser(res.user);
      await syncUserToFirestore(res.user.uid, normalizedEmail, res.user.displayName || undefined);
      return res.user;
    } catch (err: any) {
      // If Email/Password provider is disabled in Firebase Console, fallback to direct server account login & Firestore storage
      if (
        err.code === "auth/operation-not-allowed" || 
        err.code === "auth/admin-restricted-operation" ||
        err.message?.includes("operation-not-allowed") ||
        err.message?.includes("admin-restricted-operation")
      ) {
        const loginRes = await loginWithServerApi(normalizedEmail, password);
        const fallbackUser: any = {
          uid: loginRes.data?.user?.id || "usr_" + Date.now(),
          email: normalizedEmail,
          displayName: loginRes.data?.user?.name || normalizedEmail.split("@")[0],
          photoURL: "",
          emailVerified: true,
          reload: async () => {},
        };
        try {
          localStorage.setItem("cybershield_user", JSON.stringify({
            email: normalizedEmail,
            uid: fallbackUser.uid,
            displayName: fallbackUser.displayName,
            role: normalizedEmail === ADMIN_EMAIL.toLowerCase() ? "admin" : "user",
            emailVerified: true,
          }));
          if (loginRes.data?.token) {
            localStorage.setItem("cybershield_token", loginRes.data.token);
          }
        } catch {}
        await syncUserToFirestore(fallbackUser.uid, normalizedEmail, fallbackUser.displayName);
        setUser(fallbackUser);
        return fallbackUser;
      }
      console.error("Email sign in error:", err);
      setError(err.message || "Failed to sign in with email and password");
      throw err;
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    setError(null);
    const normalizedEmail = email.trim().toLowerCase();
    try {
      const res = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
      setUser(res.user);
      await syncUserToFirestore(res.user.uid, normalizedEmail);
      return res.user;
    } catch (err: any) {
      // If Email/Password provider is disabled in Firebase Console, fallback to server registration & Firestore storage
      if (
        err.code === "auth/operation-not-allowed" || 
        err.code === "auth/admin-restricted-operation" ||
        err.message?.includes("operation-not-allowed") ||
        err.message?.includes("admin-restricted-operation")
      ) {
        const regRes = await registerWithServerApi(normalizedEmail.split("@")[0], normalizedEmail, password);
        const fallbackUser: any = {
          uid: regRes.data?.user?.id || "usr_" + Date.now(),
          email: normalizedEmail,
          displayName: regRes.data?.user?.name || normalizedEmail.split("@")[0],
          photoURL: "",
          emailVerified: true,
          reload: async () => {},
        };
        try {
          localStorage.setItem("cybershield_user", JSON.stringify({
            email: normalizedEmail,
            uid: fallbackUser.uid,
            displayName: fallbackUser.displayName,
            role: normalizedEmail === ADMIN_EMAIL.toLowerCase() ? "admin" : "user",
            emailVerified: true,
          }));
          if (regRes.data?.token) {
            localStorage.setItem("cybershield_token", regRes.data.token);
          }
        } catch {}
        await syncUserToFirestore(fallbackUser.uid, normalizedEmail, fallbackUser.displayName);
        setUser(fallbackUser);
        return fallbackUser;
      }
      console.error("Email sign up error:", err);
      setError(err.message || "Failed to create account with email and password");
      throw err;
    }
  };

  const sendEmailOtp = async (email: string, purpose: string = "login") => {
    setError(null);
    try {
      const data = await sendAuthOtp(email.trim(), purpose);
      return data;
    } catch (err: any) {
      setError(err.message || "Failed to send OTP to email");
      throw err;
    }
  };

  const verifyEmailOtp = async (email: string, otp: string): Promise<boolean> => {
    setError(null);
    try {
      const data = await verifyAuthOtp(email.trim(), otp.trim());
      if (data.verified) {
        const normalized = email.toLowerCase().trim();

        try {
          const userStr = localStorage.getItem("cybershield_user");
          const existing = userStr ? JSON.parse(userStr) : {};
          localStorage.setItem("cybershield_user", JSON.stringify({
            ...existing,
            email: normalized,
            emailVerified: true,
            role: normalized === ADMIN_EMAIL.toLowerCase() ? "admin" : "user",
          }));
        } catch {}

        setUser((prev: any) => {
          if (!prev) {
            return {
              uid: "usr_" + Date.now(),
              email: normalized,
              displayName: normalized.split("@")[0],
              photoURL: "",
              emailVerified: true,
              reload: async () => {},
            };
          }
          return {
            ...prev,
            emailVerified: true,
          };
        });

        // Update Firestore if logged in with Firebase Auth
        if (auth.currentUser) {
          try {
            await setDoc(
              doc(db, "users", auth.currentUser.uid),
              { emailVerified: true },
              { merge: true }
            );
          } catch {}
        }
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.message || "Invalid OTP code");
      return false;
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
    if (!currentUser) return;

    const email = currentUser.email || "";
    const uid = currentUser.uid;

    try {
      // 1. Delete from Firestore users collection
      try {
        await deleteDoc(doc(db, "users", uid));
      } catch (e) {
        console.warn("Firestore user doc deletion warning:", e);
      }

      // 2. Delete from admins collection if present
      if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        try {
          await deleteDoc(doc(db, "admins", uid));
        } catch (e) {
          console.warn("Firestore admin doc deletion warning:", e);
        }
      }

      // 3. Delete from server backend in-memory registry
      try {
        await deleteAccountApi(email);
      } catch (e) {
        console.warn("Server account purge warning:", e);
      }

      // 4. Delete from Firebase Auth
      await deleteUser(currentUser);
      setUser(null);
    } catch (err: any) {
      console.error("Failed to delete user account:", err);
      if (err.code === "auth/requires-recent-login") {
        throw new Error("Security verification expired. Please sign out, sign back in, and try deleting your account again.");
      }
      setError(err.message || "Failed to delete account");
      throw err;
    }
  };

  const resendVerificationEmail = async (): Promise<boolean> => {
    if (!auth.currentUser) return false;
    try {
      await sendEmailVerification(auth.currentUser);
      return true;
    } catch (err: any) {
      console.error("Failed to send verification email:", err);
      setError(err.message || "Failed to send verification email");
      return false;
    }
  };

  const checkEmailVerificationStatus = async (): Promise<boolean> => {
    if (!auth.currentUser) return false;
    try {
      await auth.currentUser.reload();
      const updatedUser = auth.currentUser;
      setUser({ ...updatedUser } as User);
      return true;
    } catch (err: any) {
      console.error("Failed to reload user verification status:", err);
      return false;
    }
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
        sendEmailOtp,
        verifyEmailOtp,
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
