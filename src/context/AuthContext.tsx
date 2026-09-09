import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  User, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  deleteUser,
  signOut, 
  sendEmailVerification, 
  onAuthStateChanged 
} from "firebase/auth";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "../services/firebase";
import { sendAuthOtp, verifyAuthOtp, deleteAccountApi } from "../services/api";

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
  sendEmailOtp: (email: string, purpose?: string) => Promise<{ message: string; otpCode?: string; expiresInSeconds: number }>;
  verifyEmailOtp: (email: string, otp: string) => Promise<boolean>;
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
  const [otpVerifiedEmail, setOtpVerifiedEmail] = useState<string | null>(null);

  const currentUserEmail = user?.email?.toLowerCase().trim() || "";
  const isAdmin = currentUserEmail === ADMIN_EMAIL.toLowerCase();
  const role = user ? (isAdmin ? "admin" : "user") : null;
  
  // Either Firebase says email is verified, or user completed OTP email verification
  const emailVerified = !!user?.emailVerified || (!!user?.email && otpVerifiedEmail === currentUserEmail);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser && currentUser.email) {
        const userIsAdmin = currentUser.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
        const assignedRole = userIsAdmin ? "admin" : "user";
        const isVerifiedNow = !!currentUser.emailVerified || (otpVerifiedEmail === currentUser.email.toLowerCase().trim());

        try {
          await setDoc(
            doc(db, "users", currentUser.uid),
            {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName || currentUser.email.split("@")[0],
              photoURL: currentUser.photoURL || "",
              role: assignedRole,
              emailVerified: isVerifiedNow,
              lastLoginAt: new Date().toISOString(),
            },
            { merge: true }
          );

          if (userIsAdmin && isVerifiedNow) {
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
      }
    });

    return () => unsubscribe();
  }, [otpVerifiedEmail]);

  const signInWithGoogle = async () => {
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
    } catch (err: any) {
      console.error("Google sign in error:", err);
      setError(err.message || "Failed to sign in with Google");
      throw err;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    setError(null);
    try {
      const res = await signInWithEmailAndPassword(auth, email.trim(), password);
      setUser(res.user);
    } catch (err: any) {
      console.error("Email sign in error:", err);
      setError(err.message || "Failed to sign in with email and password");
      throw err;
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    setError(null);
    try {
      const res = await createUserWithEmailAndPassword(auth, email.trim(), password);
      setUser(res.user);
    } catch (err: any) {
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
        setOtpVerifiedEmail(normalized);

        // Update Firestore if logged in
        if (auth.currentUser) {
          await setDoc(
            doc(db, "users", auth.currentUser.uid),
            { emailVerified: true },
            { merge: true }
          );
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
      await signOut(auth);
      setUser(null);
      setOtpVerifiedEmail(null);
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
      setOtpVerifiedEmail(null);
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
      return !!updatedUser.emailVerified || (otpVerifiedEmail === updatedUser.email?.toLowerCase().trim());
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
