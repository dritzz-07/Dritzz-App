import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Chrome,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Phone,
  Lock,
  Smartphone,
  User,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";
import { auth } from "../lib/firebase";

interface AuthOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "signup"; // Kept for compatibility but ignored
}

export default function AuthOverlay({ isOpen, onClose }: AuthOverlayProps) {
  const { loginWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("+91");
  const [verificationCode, setVerificationCode] = useState("");
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);

  useEffect(() => {
    setName("");
    setPhoneNumber("+91");
    setVerificationCode("");
    setConfirmationResult(null);
    setError(null);
  }, [isOpen]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      if (err?.code === "auth/unauthorized-domain") {
        setError(
          `This domain (${window.location.hostname}) is not authorized for Google OAuth inside your Firebase project. Please add it in the Firebase Console under Authentication > Settings > Authorized domains.`,
        );
      } else if (err?.code === "auth/popup-closed-by-user") {
        setError("Sign in cancelled.");
      } else if (err?.code === "auth/network-request-failed") {
        setError(
          "Network request failed. If you are using a preview environment in an iframe or an ad-blocker, try opening the app in a new tab.",
        );
      } else {
        setError(err.message || "Failed to login with Google");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: () => {
            // reCAPTCHA solved
          },
        },
      );
    }
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      setupRecaptcha();
      const appVerifier = (window as any).recaptchaVerifier;
      const digitsOnly = phoneNumber.replace(/\D/g, "");
      const formattedPhone = phoneNumber.startsWith("+")
        ? "+" + digitsOnly
        : `+91${digitsOnly}`;
      const confirmation = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        appVerifier,
      );
      setConfirmationResult(confirmation);
    } catch (err: any) {
      setError(
        err.message ||
          "Failed to send verification code. Ensure the number is correct.",
      );
      if ((window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier.clear();
        (window as any).recaptchaVerifier = null;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) return;
    setIsLoading(true);
    setError(null);
    try {
      if (name.trim()) {
        localStorage.setItem("authFullName", name.trim());
      }
      await confirmationResult.confirm(verificationCode);
      onClose();
    } catch (err: any) {
      setError("Invalid verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80  bg-black/60"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-[440px] bg-gradient-to-b from-zinc-950 to-black border border-zinc-900/30 rounded-[40px] overflow-hidden shadow-[0_0_100px_rgba(255,255,255,0.15)] max-h-[90vh] overflow-y-auto"
          >
            {/* Subtle top glare */}
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-zinc-500/[0.08] to-transparent pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors z-10"
            >
              <X className="w-5 h-5 text-white/80" />
            </button>

            <div className="relative p-8 pt-12">
              <div className="mb-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-zinc-600/20 to-zinc-900/10 rounded-[20px] flex items-center justify-center mb-6 border border-white/5 shadow-[inset_0_0_20px_rgba(255,255,255,0.2)] relative">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-400 to-transparent opacity-50" />
                  <Sparkles className="w-8 h-8 text-white" />
                </div>

                <h2 className="text-2xl font-medium text-white tracking-tight mb-2">
                  Welcome to Dritzz
                </h2>
                <p className="text-white/80 text-xs">
                  Sign in or create an account instantly.
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-xs"
                >
                  <AlertCircle className="w-4 h-4 min-w-[16px]" />
                  <span className="break-words">{error}</span>
                </motion.div>
              )}

              <div className="space-y-5">
                <button
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full h-14 btn-primary !mt-4 animate-diamond-shine"
                >
                  <Chrome className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">
                    {isLoading ? "Processing..." : "Continue with Google"}
                  </span>
                </button>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-900/40"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase tracking-[0.2em] font-medium">
                    <span className="bg-black px-4 text-neutral-300/50">
                      OR CONTINUE WITH PHONE
                    </span>
                  </div>
                </div>

                <form
                  onSubmit={
                    confirmationResult ? handleVerifyCode : handleSendCode
                  }
                  className="space-y-4"
                >
                  <div id="recaptcha-container"></div>
                  {!confirmationResult ? (
                    <>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <User className="w-5 h-5 text-neutral-300/50 group-focus-within:text-white transition-colors" />
                        </div>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Full Name"
                          className="w-full h-14 bg-black/20 border border-zinc-900/30 rounded-2xl pl-12 pr-4 text-xs text-white placeholder-zinc-300/30 focus:outline-none focus:border-neutral-500/50 focus:bg-neutral-900/20 transition-all font-medium shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
                        />
                      </div>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Phone className="w-5 h-5 text-neutral-300/50 group-focus-within:text-white transition-colors" />
                        </div>
                        <input
                          type="tel"
                          required
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="Phone Number (e.g. +91 9876543210)"
                          className="w-full h-14 bg-black/20 border border-zinc-900/30 rounded-2xl pl-12 pr-4 text-xs text-white placeholder-zinc-300/30 focus:outline-none focus:border-neutral-500/50 focus:bg-neutral-900/20 transition-all font-medium shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isLoading || !phoneNumber || !name.trim()}
                        className="w-full h-14 btn-primary !mt-4 animate-diamond-shine"
                      >
                        {isLoading ? "Sending..." : "Send Verification Code"}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Lock className="w-5 h-5 text-neutral-300/50 group-focus-within:text-white transition-colors" />
                        </div>
                        <input
                          type="text"
                          required
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          placeholder="Enter 6-digit OTP"
                          className="w-full h-14 bg-black/20 border border-zinc-900/30 rounded-2xl pl-12 pr-4 text-lg text-white placeholder-zinc-300/30 focus:outline-none focus:border-neutral-500/50 focus:bg-neutral-900/20 transition-all font-medium tracking-[0.3em] shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
                          maxLength={6}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isLoading || verificationCode.length < 6}
                        className="w-full h-14 btn-primary !mt-4 animate-diamond-shine"
                      >
                        <span className="relative z-10">
                          {isLoading ? "Verifying..." : "Verify & Sign In"}
                        </span>
                        <Sparkles className="w-4 h-4 relative z-10" />
                      </button>
                      <div className="text-center pt-3">
                        <button
                          type="button"
                          onClick={() => {
                            setConfirmationResult(null);
                            setVerificationCode("");
                            setError(null);
                          }}
                          className="text-xs font-medium text-white/60 hover:text-white transition-colors underline-offset-4 hover:underline"
                        >
                          Change Phone Number
                        </button>
                      </div>
                    </>
                  )}
                </form>
              </div>
            </div>

            <div className="bg-black/20 p-6 text-center border-t border-zinc-900/30 flex items-center justify-center gap-2">
              <Sparkles className="w-3 h-3 text-white/80" />
              <span className="text-[11px] uppercase tracking-[0.2em] font-black text-white/80">
                Encrypted & Secure with Firebase
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
