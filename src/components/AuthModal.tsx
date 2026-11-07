import React, { useState, useEffect } from "react";
import { X, Eye, EyeOff, Check, ShieldCheck, Mail, Lock, AlertCircle, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import CyberShieldLogo from "./CyberShieldLogo";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "email" | "google";
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { 
    user, 
    isAdmin, 
    signInWithGoogle, 
    signInWithEmail, 
    signUpWithEmail, 
    logout, 
    deleteCurrentAccount 
  } = useAuth();

  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loadingAction, setLoadingAction] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Sync email from user context if available
  useEffect(() => {
    if (user?.email && !email) {
      setEmail(user.email);
    }
  }, [user]);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setMsg(null);
    setLoadingAction(true);
    try {
      await signInWithGoogle();
      setMsg("Successfully signed in with Google.");
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to sign in with Google.");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setMsg(null);

    const activeEmail = email.trim();
    if (!activeEmail || !activeEmail.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    if (isRegistering) {
      if (password.length < 6) {
        setErrorMsg("Password must be at least 6 characters long.");
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg("Passwords do not match. Please verify your confirmation password.");
        return;
      }
    } else {
      if (!password) {
        setErrorMsg("Please enter your password.");
        return;
      }
    }

    setLoadingAction(true);
    try {
      if (isRegistering) {
        await signUpWithEmail(activeEmail, password);
        setMsg(`Account created and signed in successfully!`);
        setTimeout(() => {
          onClose();
        }, 700);
      } else {
        await signInWithEmail(activeEmail, password);
        setMsg(`Signed in successfully as ${activeEmail}.`);
        setTimeout(() => {
          onClose();
        }, 700);
      }
    } catch (e: any) {
      console.error("Auth error:", e);
      setErrorMsg(e.message || "Authentication failed. Please verify your credentials.");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDeleteAccount = async () => {
    setErrorMsg(null);
    setLoadingAction(true);
    try {
      await deleteCurrentAccount();
      setMsg("Your account has been deleted.");
      setConfirmDelete(false);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to delete account.");
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto font-sans">
      <div className="w-full max-w-md bg-[#0d0d0d] border border-zinc-800 rounded-xl shadow-2xl p-4 sm:p-6 relative overflow-hidden my-auto max-h-[94vh] overflow-y-auto">
        {/* Top gradient highlight */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-500" />

        <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-5">
          <div className="flex items-center space-x-3">
            <CyberShieldLogo className="w-8 h-8 shrink-0 drop-shadow-[0_0_8px_rgba(0,210,255,0.4)]" />
            <div>
              <h2 className="text-base font-bold text-zinc-100 tracking-tight">CyberShield SOC</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Identity & Access Control</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-zinc-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-fadeIn">
            <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-400" />
            <div>
              <span className="font-bold mr-1">[Error]</span> {errorMsg}
            </div>
          </div>
        )}

        {msg && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2 animate-fadeIn">
            <Check size={15} className="shrink-0 mt-0.5 text-emerald-400" />
            <div>
              <span className="font-bold mr-1">[Success]</span> {msg}
            </div>
          </div>
        )}

        {user ? (
          /* Logged In User Profile */
          <div className="space-y-4">
            <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-lg flex items-center space-x-3">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || "User"} 
                  className="w-11 h-11 rounded-full border border-zinc-700 object-cover" 
                  referrerPolicy="no-referrer" 
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-zinc-300 font-mono text-base">
                  {user.email ? user.email.charAt(0).toUpperCase() : "U"}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-zinc-100 truncate">{user.displayName || user.email?.split("@")[0]}</p>
                <p className="text-[11px] text-zinc-400 truncate font-mono">{user.email}</p>
                <div className="mt-1 flex items-center space-x-2">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                    isAdmin 
                      ? "bg-emerald-950/80 text-emerald-400 border-emerald-700" 
                      : "bg-blue-950/80 text-blue-400 border-blue-700"
                  }`}>
                    {isAdmin ? "Administrator" : "SOC Analyst"}
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border bg-emerald-950/60 text-emerald-400 border-emerald-800">
                    Active
                  </span>
                </div>
              </div>
            </div>

            {confirmDelete ? (
              <div className="p-4 bg-rose-950/30 border border-rose-900/50 rounded-lg space-y-3 text-xs">
                <p className="text-rose-400 font-bold uppercase tracking-wider">
                  Confirm Account Deletion
                </p>
                <p className="text-zinc-300 leading-relaxed">
                  Are you sure you want to permanently delete your account? This action cannot be undone.
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1 py-2 px-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded font-medium text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={loadingAction}
                    className="flex-1 py-2 px-3 bg-rose-600 hover:bg-rose-500 text-white rounded font-bold text-xs transition-colors flex items-center justify-center cursor-pointer"
                  >
                    <span>{loadingAction ? "Deleting..." : "Delete Permanently"}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 pt-2">
                <button
                  onClick={onClose}
                  className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors cursor-pointer shadow-sm"
                >
                  Continue to SOC Dashboard
                </button>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={logout}
                    className="flex-1 py-2 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium border border-zinc-800 transition-colors cursor-pointer"
                  >
                    Sign Out
                  </button>
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="flex-1 py-2 px-3 rounded-lg bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 text-xs font-medium border border-rose-900/40 transition-colors cursor-pointer"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Authentication Forms */
          <div className="space-y-4">
            {/* Google SSO Button */}
            <button
              id="google-signin-btn"
              onClick={handleGoogleSignIn}
              disabled={loadingAction}
              className="w-full flex items-center justify-center space-x-3 py-2.5 px-4 rounded-lg bg-white hover:bg-zinc-100 text-zinc-900 font-semibold text-xs transition-all shadow-md disabled:opacity-50 cursor-pointer border border-zinc-200"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{loadingAction ? "Authenticating..." : "Continue with Google"}</span>
            </button>

            {/* Divider */}
            <div className="relative my-3 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800" />
              </div>
              <span className="relative bg-[#0d0d0d] px-2 text-[11px] text-zinc-500 uppercase tracking-wider font-mono">
                or with email
              </span>
            </div>

            {/* Sign In vs Create Account Tabs */}
            <div className="flex border-b border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(false);
                  setErrorMsg(null);
                }}
                className={`flex-1 pb-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border-b-2 cursor-pointer ${
                  !isRegistering
                    ? "border-emerald-500 text-emerald-400"
                    : "border-transparent text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <LogIn size={14} />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(true);
                  setErrorMsg(null);
                }}
                className={`flex-1 pb-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border-b-2 cursor-pointer ${
                  isRegistering
                    ? "border-emerald-500 text-emerald-400"
                    : "border-transparent text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <UserPlus size={14} />
                <span>Create Account</span>
              </button>
            </div>

            {/* Email & Password Form */}
            <form onSubmit={handleEmailAuth} className="space-y-3 pt-1">
              <div>
                <label className="block text-[11px] text-zinc-400 font-medium mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="analyst@cybershield.ai"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 font-medium mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-10 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? "Hide password" : "Show password"}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password (Registration only) */}
              {isRegistering && (
                <div>
                  <label className="block text-[11px] text-zinc-400 font-medium mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-10 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      title={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                      aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors p-1 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-[10px] text-rose-400 mt-1">Passwords do not match</p>
                  )}
                  {confirmPassword && password === confirmPassword && (
                    <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                      <Check size={12} /> Passwords match
                    </p>
                  )}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loadingAction}
                  className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors disabled:opacity-50 cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                >
                  {loadingAction ? (
                    <span>Authenticating...</span>
                  ) : isRegistering ? (
                    <>
                      <UserPlus size={14} />
                      <span>Create Account</span>
                    </>
                  ) : (
                    <>
                      <LogIn size={14} />
                      <span>Sign In to CyberShield</span>
                    </>
                  )}
                </button>
              </div>

              <div className="pt-2 border-t border-zinc-800/80 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(!isRegistering);
                    setErrorMsg(null);
                    setConfirmPassword("");
                  }}
                  className="text-xs text-zinc-400 hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {isRegistering 
                    ? "Already registered? Sign In to your account" 
                    : "Don't have an account yet? Create one"}
                </button>
              </div>
            </form>

            <div className="pt-2 text-center text-[10px] text-zinc-500 font-mono flex items-center justify-center gap-1">
              <ShieldCheck size={12} className="text-emerald-400" />
              <span>Protected by Firebase Authentication & Google Cloud Identity.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
