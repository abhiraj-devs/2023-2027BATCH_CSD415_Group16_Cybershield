import React, { useState } from "react";
import { Settings, Cpu, Shield } from "lucide-react";
import { clearAllHistory } from "../services/api";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";

export default function SettingsView() {
  const { 
    user, 
    isAdmin, 
    emailVerified, 
    logout, 
    deleteCurrentAccount,
    resendVerificationEmail, 
    sendEmailOtp,
    checkEmailVerificationStatus 
  } = useAuth();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [verificationFeedback, setVerificationFeedback] = useState<string | null>(null);
  const [purging, setPurging] = useState(false);
  
  // Account deletion state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleClearCache = async () => {
    if (!isAdmin) {
      alert("Restricted Operation: Cache purge requires Administrator privileges.");
      return;
    }
    if (!confirm("Are you sure you want to purge all local threat intelligence, network events, and scan history?")) {
      return;
    }
    setPurging(true);
    try {
      await clearAllHistory();
      alert("Cache and local logs purged successfully by Administrator!");
    } catch (e: any) {
      alert("Failed to clear data: " + (e.message || "Unknown error"));
    } finally {
      setPurging(false);
    }
  };

  const handleResend = async () => {
    if (!user?.email) return;
    setResending(true);
    setVerificationFeedback(null);
    try {
      const res = await sendEmailOtp(user.email, "profile_verification");
      setVerificationFeedback(`Verification OTP (${res.otpCode || "dispatched"}) sent to ${user.email}. Check inbox or sign-in modal to verify.`);
    } catch (e: any) {
      const ok = await resendVerificationEmail();
      if (ok) {
        setVerificationFeedback(`Verification email sent to ${user.email}. Please check your inbox.`);
      } else {
        setVerificationFeedback("Could not send verification email. Please try again.");
      }
    } finally {
      setResending(false);
    }
  };

  const handleCheckStatus = async () => {
    setChecking(true);
    setVerificationFeedback(null);
    try {
      const verified = await checkEmailVerificationStatus();
      if (verified) {
        setVerificationFeedback("Email is verified! Access confirmed.");
      } else {
        setVerificationFeedback("Email not verified yet. Please enter the OTP code received in your email.");
      }
    } finally {
      setChecking(false);
    }
  };

  const handleDeleteAccountConfirm = async () => {
    setDeleteError(null);
    setDeleting(true);
    try {
      await deleteCurrentAccount();
      setShowDeleteModal(false);
      alert("Your account has been deleted successfully.");
    } catch (e: any) {
      setDeleteError(e.message || "Failed to delete account. Please re-authenticate and try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans pb-10">
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {/* Account Deletion Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 space-y-4 shadow-2xl">
            <div>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800">
                CRITICAL ACTION
              </span>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-1">Delete Account Permanently</h3>
            </div>
            <p className="text-xs text-zinc-700 dark:text-zinc-300">
              This action will completely delete your account (<span className="font-mono text-white">{user?.email}</span>), remove all your profile credentials, and revoke security access. This action cannot be reversed.
            </p>

            {deleteError && (
              <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded text-xs text-rose-300">
                <span className="font-bold">[Error]</span> {deleteError}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 py-2 px-3 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded text-xs font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccountConfirm}
                disabled={deleting}
                className="flex-1 py-2 px-3 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-bold transition-colors cursor-pointer"
              >
                <span>{deleting ? "Deleting..." : "Confirm Delete"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-6 rounded-md bg-white dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
            <Settings size={20} className="text-zinc-600 dark:text-zinc-400" />
            <span>Settings & Identity</span>
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-1">
            Manage credentials, email OTP verification, security roles, system preferences, and API access credentials.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {user ? (
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setAuthModalOpen(true)}
                className="flex-1 sm:flex-initial px-3 py-2 rounded-md bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 text-xs font-medium transition-colors cursor-pointer text-center"
              >
                Authentication Details
              </button>
              <button
                onClick={logout}
                className="flex-1 sm:flex-initial px-3 py-2 rounded-md bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-white border border-zinc-200 dark:border-zinc-800 text-xs font-medium transition-colors cursor-pointer text-center"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-sm cursor-pointer text-center"
            >
              Sign In / Register
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Authentication & Access Card */}
        <div className="p-6 rounded-md bg-white dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 space-y-4 flex flex-col">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Identity & Role Status</h3>
            {isAdmin ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                ADMINISTRATOR
              </span>
            ) : user ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-950/80 text-blue-400 border border-blue-800">
                NORMAL USER
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                GUEST
              </span>
            )}
          </div>

          <div className="space-y-4 text-sm font-mono text-zinc-700 dark:text-zinc-300 flex-1">
            {/* User Details */}
            <div>
              <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Authenticated Account</label>
              <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-900 rounded flex items-center space-x-3">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || "User"} className="w-9 h-9 rounded-full border border-zinc-300 dark:border-zinc-700 object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center font-bold text-zinc-700 dark:text-zinc-300">
                    {user?.email ? user.email.charAt(0).toUpperCase() : "?"}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">{user?.displayName || (user ? user.email?.split("@")[0] : "Not Signed In")}</p>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 truncate">{user?.email || "Sign in using Google or Email/Password + OTP"}</p>
                </div>
              </div>
            </div>

            {/* Email Verification */}
            <div>
              <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Email Verification & OTP</label>
              <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-900 rounded">
                {user ? (
                  emailVerified ? (
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400">[Verified] Email & OTP Active</span>
                      <span className="text-[10px] text-emerald-500/80 font-mono">Active</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-amber-400 block">[Pending] Verification Required</span>
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={handleResend}
                          disabled={resending}
                          className="flex-1 px-2.5 py-1.5 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded text-[11px] font-sans text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer"
                        >
                          {resending ? "Sending..." : "Send OTP to Email"}
                        </button>
                        <button
                          onClick={handleCheckStatus}
                          disabled={checking}
                          className="flex-1 px-2.5 py-1.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 rounded text-[11px] font-sans text-emerald-300 transition-colors cursor-pointer"
                        >
                          {checking ? "Checking..." : "Refresh Status"}
                        </button>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>Sign in to manage email verification</span>
                    <button
                      onClick={() => setAuthModalOpen(true)}
                      className="text-emerald-400 underline font-sans text-[11px] cursor-pointer"
                    >
                      Sign In
                    </button>
                  </div>
                )}
                {verificationFeedback && (
                  <p className="text-[10px] font-sans text-emerald-400 mt-2">{verificationFeedback}</p>
                )}
              </div>
            </div>

            {/* Account Lifecycle & Deletion */}
            <div>
              <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Account Actions</label>
              <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-900 rounded flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">
                    {isAdmin ? "Admin Role" : user ? "Normal User Role" : "Guest Mode"}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-sans block truncate">
                    {user ? "Permanently remove account and data" : "Authenticate to access all features"}
                  </span>
                </div>
                {user ? (
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="shrink-0 px-3 py-1.5 rounded bg-rose-950/30 hover:bg-rose-900/50 border border-rose-900/50 text-rose-400 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Delete Account
                  </button>
                ) : (
                  <button
                    onClick={() => setAuthModalOpen(true)}
                    className="shrink-0 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Data Management & Governance Card */}
        <div className="p-6 rounded-md bg-white dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 space-y-4 flex flex-col">
          <div className="border-b border-zinc-200 dark:border-zinc-800 pb-2">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Data Management & Permissions</h3>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 font-sans">
            Manage data retention, purge cached scans, and inspect authorization policies.
          </p>

          <div className="p-3.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-900 rounded space-y-2 text-xs flex-1">
            <div className="text-zinc-700 dark:text-zinc-300 font-bold uppercase tracking-wider text-[10px]">
              Permission Matrix
            </div>
            <ul className="space-y-1 text-[11px] text-zinc-600 dark:text-zinc-400 font-sans">
              <li className="flex items-center justify-between">
                <span>Phishing & Malware Scanners</span>
                <span className="text-emerald-400 font-mono">All Users</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Network & Vulnerability Telemetry</span>
                <span className="text-emerald-400 font-mono">All Users</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Threat Intelligence Feed Search</span>
                <span className="text-emerald-400 font-mono">All Users</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Alert Webhook Testing (Discord / Slack)</span>
                <span className="text-emerald-400 font-mono">All Users</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Purge Scans & Security Logs</span>
                <span className={isAdmin ? "text-emerald-400 font-mono font-bold" : "text-rose-400 font-mono"}>
                  {isAdmin ? "Admin Allowed" : "Admin Only"}
                </span>
              </li>
            </ul>
          </div>

          <div className="pt-2">
            <button
              onClick={handleClearCache}
              disabled={purging || !isAdmin}
              title={!isAdmin ? "Restricted to Administrator" : "Purge data"}
              className={`flex items-center justify-center w-full px-4 py-2.5 rounded text-xs font-bold transition-colors ${
                isAdmin 
                  ? "bg-red-950/40 hover:bg-red-900/60 border border-red-900/60 text-red-400 cursor-pointer"
                  : "bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 cursor-not-allowed"
              }`}
            >
              <span>
                {purging 
                  ? "PURGING..." 
                  : isAdmin 
                  ? "PURGE LOCAL DATA (ADMIN ONLY)" 
                  : "PURGE LOCAL DATA (ADMIN ONLY - LOCKED)"}
              </span>
            </button>
            {!isAdmin && (
              <p className="text-[10px] text-zinc-500 text-center mt-1.5 font-sans">
                Only authorized Administrators have permission to purge system data.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
