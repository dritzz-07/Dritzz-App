import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Chrome, ArrowRight, Sparkles, AlertCircle, Phone, Lock, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { useNavigate } from "react-router-dom";

export default function SignInPage() {
  const { loginWithGoogle, user, loading } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      navigate("/app");
    }
  }, [user, loading, navigate]);

  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("+91");
  const [verificationCode, setVerificationCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      navigate("/app");
    } catch (err: any) {
      if (err?.code === "auth/unauthorized-domain") {
        setError("Domain not authorized for Google OAuth.");
      } else if (err?.code === "auth/popup-closed-by-user") {
        setError("Sign in cancelled.");
      } else if (err?.code === "auth/network-request-failed") {
        setError("Network request failed.");
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
        { size: "invisible" }
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
        appVerifier
      );
      setConfirmationResult(confirmation);
    } catch (err: any) {
      setError(err.message || "Failed to send verification code. Ensure the number is correct.");
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
      navigate("/app");
    } catch (err: any) {
      setError("Invalid verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C] flex flex-col pt-safe-area pb-safe relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[10%] left-[-20%] w-[80vw] h-[80vh] bg-[radial-gradient(circle_at_center,_rgba(25,35,65,0.4),_transparent_60%)]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vh] bg-[radial-gradient(circle_at_center,_rgba(30,45,95,0.5),_transparent_70%)]" />
      </div>

      <div className="relative z-10 flex flex-col flex-1 px-6 justify-center max-w-md mx-auto w-full group">
        <div className="mb-10 flex flex-col items-center text-center">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 15 }}
            className="w-16 h-16 bg-gradient-to-br from-zinc-600/20 to-zinc-900/10 rounded-[20px] flex items-center justify-center mb-6 border border-white/5 shadow-[inset_0_0_20px_rgba(255,255,255,0.2)]"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-medium text-white tracking-tight mb-2"
          >
            Sign In or Join
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/60 text-sm"
          >
            Get access to premium car care.
          </motion.p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 min-w-[16px] mt-0.5" />
            <span className="break-words leading-relaxed">{error}</span>
          </div>
        )}

        <div className="space-y-5">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full h-14 bg-white text-black font-semibold rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors"
          >
            <Chrome className="w-5 h-5" />
            <span className="text-[13px] tracking-wide">Continue with Google</span>
          </button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-900/40"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-[0.2em] font-medium">
              <span className="bg-[#0A0A0C] px-4 text-neutral-300/50">
                OR CONTINUE WITH PHONE
              </span>
            </div>
          </div>

          <form onSubmit={confirmationResult ? handleVerifyCode : handleSendCode} className="space-y-4">
            <div id="recaptcha-container"></div>
            
            {!confirmationResult ? (
              <>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-neutral-500 group-focus-within:text-white transition-colors" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full h-14 bg-black/40 border border-zinc-900 rounded-2xl pl-12 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-neutral-500 focus:bg-neutral-900/40 transition-all font-medium"
                  />
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="w-5 h-5 text-neutral-500 group-focus-within:text-white transition-colors" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Phone Number (e.g. +91 9876543210)"
                    className="w-full h-14 bg-black/40 border border-zinc-900 rounded-2xl pl-12 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-neutral-500 focus:bg-neutral-900/40 transition-all font-medium"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading || !phoneNumber || !name.trim()}
                  className="w-full h-14 bg-blue-600 text-white font-semibold rounded-2xl mt-4 flex items-center justify-center gap-2 hover:bg-blue-500 transition-colors disabled:opacity-50"
                >
                  {isLoading ? "Sending..." : "Send Code"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-neutral-500 group-focus-within:text-white transition-colors" />
                  </div>
                  <input
                    type="text"
                    required
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    className="w-full h-14 bg-black/40 border border-zinc-900 rounded-2xl pl-12 pr-4 text-lg text-white placeholder-zinc-600 focus:outline-none focus:border-neutral-500 focus:bg-neutral-900/40 transition-all font-medium tracking-[0.3em]"
                    maxLength={6}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading || verificationCode.length < 6}
                  className="w-full h-14 bg-blue-600 text-white font-semibold rounded-2xl mt-4 flex items-center justify-center gap-2 hover:bg-blue-500 transition-colors disabled:opacity-50"
                >
                  {isLoading ? "Verifying..." : "Verify & Sign In"}
                  <Sparkles className="w-4 h-4" />
                </button>
                <div className="text-center pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmationResult(null);
                      setVerificationCode("");
                      setError(null);
                    }}
                    className="text-xs font-medium text-white/50 hover:text-white transition-colors underline-offset-4 hover:underline"
                  >
                    Change Phone Number
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
