import React, { useState } from "react";
import { X, Eye, EyeOff, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import CyberShieldLogo from "./CyberShieldLogo";

export default function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { 
    user, 
    isAdmin, 
    emailVerified, 
    signInWithGoogle, 
    signInWithEmail,
    signUpWithEmail,
    sendEmailOtp,
    verifyEmailOtp,
    logout, 
    deleteCurrentAccount,
  } = useAuth();

  // Mode: 'google' | 'email'
  const [authMode, setAuthMode] = useState<"google" | "email">("email");
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // OTP flow step
  const [otpStep, setOtpStep] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [dispatchedOtpPreview, setDispatchedOtpPreview] = useState<string | null>(null);

  const [loadingAction, setLoadingAction] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Standard Password Criteria Evaluation
  const passwordCriteria = [
    { id: "length", label: "At least 8 characters", valid: password.length >= 8 },
    { id: "uppercase", label: "At least one uppercase letter (A-Z)", valid: /[A-Z]/.test(password) },
    { id: "lowercase", label: "At least one lowercase letter (a-z)", valid: /[a-z]/.test(password) },
    { id: "number", label: "At least one number (0-9)", valid: /[0-9]/.test(password) },
    { id: "special", label: "At least one special character (!@#$%^&*)", valid: /[^A-Za-z0-9]/.test(password) },
  ];
  const criteriaPassedCount = passwordCriteria.filter((c) => c.valid).length;
  const isStrongPassword = criteriaPassedCount === passwordCriteria.length;

  // Delete account confirmation
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setMsg(null);
    setLoadingAction(true);
    try {
      await signInWithGoogle();
      setMsg("Successfully signed in with Google!");
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to sign in with Google.");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleSendEmailOtpStep = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setMsg(null);

    if (!email || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    if (isRegistering) {
      if (!isStrongPassword) {
        setErrorMsg("Password must meet all 5 standard security criteria before registration.");
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg("Passwords do not match. Please verify your confirmation password.");
        return;
      }
    } else {
      if (!password || password.length < 6) {
        setErrorMsg("Password must be at least 6 characters.");
        return;
      }
    }

    setLoadingAction(true);
    try {
      if (isRegistering) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }

      const res = await sendEmailOtp(email, isRegistering ? "registration" : "login");
      setDispatchedOtpPreview(res.otpCode || null);
      setOtpStep(true);
      setMsg(`OTP code has been sent to ${email}. Enter the 6-digit code below.`);
    } catch (e: any) {
      if (e.code === "auth/user-not-found" || e.message?.includes("user-not-found")) {
        setErrorMsg("No account found with this email. Click 'Create new account' to register.");
      } else if (e.code === "auth/email-already-in-use" || e.message?.includes("email-already-in-use")) {
        setErrorMsg("An account with this email already exists. Click 'Sign In' instead.");
      } else {
        setErrorMsg(e.message || "Authentication failed. Please verify your credentials.");
      }
    } finally {
      setLoadingAction(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteredOtp || enteredOtp.trim().length !== 6) {
      setErrorMsg("Please enter the 6-digit OTP code received in your email.");
      return;
    }

    setLoadingAction(true);
    setErrorMsg(null);
    try {
      const success = await verifyEmailOtp(email, enteredOtp);
      if (success) {
        setMsg("OTP verified successfully! Access granted.");
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setErrorMsg("Invalid OTP code. Please check your email and try again.");
      }
    } catch (e: any) {
      setErrorMsg(e.message || "OTP verification failed.");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) return;
    setLoadingAction(true);
    setErrorMsg(null);
    try {
      const res = await sendEmailOtp(email, "verification_resend");
      setDispatchedOtpPreview(res.otpCode || null);
      setMsg(`Fresh OTP sent to ${email}.`);
    } catch (e: any) {
      setErrorMsg(e.message || "Could not resend OTP.");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDeleteAccount = async () => {
    setErrorMsg(null);
    setLoadingAction(true);
    try {
      await deleteCurrentAccount();
      setMsg("Your account and associated profile data have been permanently deleted.");
      setConfirmDelete(false);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to delete account.");
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto font-sans">
      <div className="w-full max-w-md bg-[#0a0a0a] border border-zinc-800 rounded-xl shadow-2xl p-4 sm:p-6 relative overflow-hidden my-auto max-h-[94vh] overflow-y-auto">
        {/* Accent top gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-500" />

        <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80 mb-5">
          <div className="flex items-center space-x-3">
            <CyberShieldLogo className="w-8 h-8 shrink-0 drop-shadow-[0_0_8px_rgba(0,210,255,0.4)]" />
            <div>
              <h2 className="text-base font-bold text-zinc-100 tracking-tight">CyberShield</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Authentication & Identity Management</p>
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
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            <span className="font-bold mr-1">[Error]</span> {errorMsg}
          </div>
        )}

        {msg && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
            <span className="font-bold mr-1">[Success]</span> {msg}
          </div>
        )}

        {user ? (
          /* Logged In View with Account Deletion Option */
          <div className="space-y-4">
            <div className="p-4 bg-zinc-900/70 border border-zinc-800 rounded-lg flex items-center space-x-3">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || "User"} className="w-10 h-10 rounded-full border border-zinc-700" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-zinc-300 font-mono">
                  {user.email ? user.email.charAt(0).toUpperCase() : "U"}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-zinc-100 truncate">{user.displayName || user.email?.split("@")[0]}</p>
                <p className="text-[11px] text-zinc-400 truncate font-mono">{user.email}</p>
                <div className="mt-1 flex items-center space-x-2">
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                    isAdmin 
                      ? "bg-emerald-950/80 text-emerald-400 border-emerald-700" 
                      : "bg-blue-950/80 text-blue-400 border-blue-700"
                  }`}>
                    {isAdmin ? "Administrator" : "Normal User"}
                  </span>
                  <span className={`text-[10px] font-mono ${emailVerified ? "text-emerald-400" : "text-amber-400"}`}>
                    {emailVerified ? "Verified" : "Unverified"}
                  </span>
                </div>
              </div>
            </div>

            {confirmDelete ? (
              <div className="p-4 bg-rose-950/30 border border-rose-900/50 rounded-lg space-y-3 text-xs">
                <p className="text-rose-400 font-bold uppercase tracking-wider">
                  Confirm Permanent Account Deletion
                </p>
                <p className="text-zinc-300">
                  Are you sure you want to permanently delete your account and all associated threat records? This action cannot be undone.
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
                  className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  Continue to Dashboard
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
            {/* Auth Method Selector */}
            <div className="flex bg-zinc-900/80 p-1 rounded-lg border border-zinc-800">
              <button
                type="button"
                onClick={() => { setAuthMode("email"); setOtpStep(false); }}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  authMode === "email" 
                    ? "bg-zinc-800 text-zinc-100 shadow-xs" 
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Email & Password
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode("google"); setOtpStep(false); }}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  authMode === "google" 
                    ? "bg-zinc-800 text-zinc-100 shadow-xs" 
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Google Sign In
              </button>
            </div>

            {authMode === "google" ? (
              /* Google Sign In */
              <div className="space-y-4 pt-2">
                <p className="text-xs text-zinc-400 text-center">
                  Sign in instantly with your verified Google account to authenticate your session.
                </p>

                <button
                  id="google-signin-btn"
                  onClick={handleGoogleSignIn}
                  disabled={loadingAction}
                  className="w-full flex items-center justify-center space-x-3 py-2.5 px-4 rounded-lg bg-white hover:bg-zinc-100 text-zinc-900 font-semibold text-sm transition-all shadow-md disabled:opacity-50 cursor-pointer border border-zinc-200"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{loadingAction ? "Authenticating..." : "Continue with Google"}</span>
                </button>
              </div>
            ) : !otpStep ? (
              /* Email & Password Form */
              <form onSubmit={handleSendEmailOtpStep} className="space-y-3 pt-1">
                <div>
                  <label className="block text-[11px] text-zinc-400 font-medium mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-400 font-medium mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-3 pr-10 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
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

                  {isRegistering ? (
                    <div className="space-y-2 pt-2">
                      {/* Password Strength Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="text-zinc-400">Strength:</span>
                          <span className={`font-semibold ${
                            password.length === 0 ? "text-zinc-500" :
                            criteriaPassedCount <= 1 ? "text-rose-400" :
                            criteriaPassedCount <= 3 ? "text-amber-400" :
                            criteriaPassedCount === 4 ? "text-blue-400" : "text-emerald-400"
                          }`}>
                            {password.length === 0 ? "Enter password" :
                             criteriaPassedCount <= 1 ? "Weak" :
                             criteriaPassedCount <= 3 ? "Fair" :
                             criteriaPassedCount === 4 ? "Good" : "Strong (All Criteria Met)"}
                          </span>
                        </div>
                        <div className="w-full bg-zinc-800/80 rounded-full h-1 overflow-hidden">
                          <div 
                            className={`h-1 rounded-full transition-all duration-300 ${
                              password.length === 0 ? "w-0" :
                              criteriaPassedCount <= 1 ? "bg-rose-500 w-1/5" :
                              criteriaPassedCount <= 3 ? "bg-amber-500 w-3/5" :
                              criteriaPassedCount === 4 ? "bg-blue-500 w-4/5" : "bg-emerald-500 w-full"
                            }`}
                          />
                        </div>
                      </div>

                      {/* Criteria Checklist */}
                      <div className="p-2.5 rounded-md bg-zinc-950 border border-zinc-800/80 space-y-1.5 text-[10px]">
                        <span className="text-zinc-400 font-medium block">Standard Security Criteria:</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-1">
                          {passwordCriteria.map((crit) => (
                            <div 
                              key={crit.id} 
                              className={`flex items-center space-x-1.5 transition-colors ${
                                crit.valid ? "text-emerald-400" : "text-zinc-500"
                              }`}
                            >
                              {crit.valid ? (
                                <Check size={12} className="shrink-0 text-emerald-400" />
                              ) : (
                                <span className="w-2.5 h-2.5 rounded-full border border-zinc-600 inline-block shrink-0" />
                              )}
                              <span className="leading-tight">{crit.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[10px] text-zinc-500 mt-1">Minimum 6 characters. A verification OTP will be sent to your email.</p>
                  )}
                </div>

                {/* Confirm Password (Registration only) */}
                {isRegistering && (
                  <div>
                    <label className="block text-[11px] text-zinc-400 font-medium mb-1">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-3 pr-10 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
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
                    className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    <span>{loadingAction ? "Processing..." : isRegistering ? "Register" : "Sign In"}</span>
                  </button>
                </div>

                <div className="flex items-center justify-center pt-2 border-t border-zinc-800/80">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegistering(!isRegistering);
                      setErrorMsg(null);
                      setConfirmPassword("");
                    }}
                    className="text-xs text-zinc-400 hover:text-emerald-400 transition-colors cursor-pointer"
                  >
                    {isRegistering ? "Already have an account? Sign In" : "Don't have an account? Create one"}
                  </button>
                </div>
              </form>
            ) : (
              /* OTP Verification Step */
              <form onSubmit={handleVerifyOtp} className="space-y-4 pt-1">
                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-xs space-y-1">
                  <p className="text-zinc-300 font-medium">
                    OTP Dispatched to: <strong className="font-mono text-zinc-100">{email}</strong>
                  </p>
                  <p className="text-zinc-500 text-[11px]">
                    Enter the 6-digit one-time password to verify your email and activate your session.
                  </p>
                  {dispatchedOtpPreview && (
                    <div className="mt-2 p-2 bg-emerald-950/40 border border-emerald-800/60 rounded text-[11px] text-emerald-300 flex items-center justify-between">
                      <span>Delivery Code: <strong className="font-mono text-xs">{dispatchedOtpPreview}</strong></span>
                      <button
                        type="button"
                        onClick={() => setEnteredOtp(dispatchedOtpPreview)}
                        className="underline text-[10px] hover:text-emerald-200 cursor-pointer"
                      >
                        Auto-fill
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-400 font-medium mb-1">6-Digit Email OTP</label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-center text-lg tracking-[0.3em] font-mono text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-2">
                  <button
                    type="submit"
                    disabled={loadingAction || enteredOtp.length !== 6}
                    className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    <span>{loadingAction ? "Verifying..." : "Verify OTP & Enter SOC"}</span>
                  </button>

                  <div className="flex items-center justify-between text-xs text-zinc-500 pt-1">
                    <button
                      type="button"
                      onClick={() => setOtpStep(false)}
                      className="hover:text-zinc-300 transition-colors cursor-pointer"
                    >
                      Back to Login
                    </button>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={loadingAction}
                      className="hover:text-emerald-400 transition-colors underline cursor-pointer"
                    >
                      Resend OTP Code
                    </button>
                  </div>
                </div>
              </form>
            )}

            <div className="pt-2 text-center text-[10px] text-zinc-600 font-mono">
              Secure SOC authentication portal with end-to-end credential verification.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
