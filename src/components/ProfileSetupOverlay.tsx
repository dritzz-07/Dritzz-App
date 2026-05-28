import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  User,
  Mail,
  MapPin,
  Car,
  ArrowRight,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function ProfileSetupOverlay() {
  const { userProfile, updateUserProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState(userProfile?.fullName || "");
  const [email, setEmail] = useState(userProfile?.email || "");
  const [city, setCity] = useState(userProfile?.city || "");
  const [carModel, setCarModel] = useState(userProfile?.carModel || "");

  // Only show if userProfile is loaded and profileCompleted is false
  if (!userProfile || userProfile.profileCompleted) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!fullName.trim()) {
        throw new Error("Full Name is required");
      }

      await updateUserProfile({
        fullName: fullName.trim(),
        email: email.trim() || null,
        city: city.trim() || null,
        carModel: carModel.trim() || null,
        profileCompleted: true,
      });
    } catch (err: any) {
      setError(err.message || "Failed to save profile. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 "
          // No onClick to close because this is mandatory
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-[440px] bg-neutral-900 border border-white/10 rounded-[32px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] max-h-[90vh] overflow-y-auto"
        >
          <div className="p-8 pt-12">
            <div className="mb-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                <Sparkles className="w-8 h-8 text-black" />
              </div>

              <h2 className="text-3xl font-black text-white tracking-tighter mb-2 uppercase">
                COMPLETE PROFILE
              </h2>
              <p className="text-neutral-300 text-xs">
                Just a few more details to unlock your premium experience.
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="w-4 h-4 text-neutral-300" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full Name (Required)"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-colors"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4 text-neutral-300" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address (Optional)"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-colors"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Car className="w-4 h-4 text-neutral-300" />
                </div>
                <input
                  type="text"
                  value={carModel}
                  onChange={(e) => setCarModel(e.target.value)}
                  placeholder="Primary Car Model (Optional)"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-colors"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MapPin className="w-4 h-4 text-neutral-300" />
                </div>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City (Optional)"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !fullName.trim()}
                className="w-full h-14 btn-primary !mt-4"
              >
                {isLoading ? "Saving..." : "Complete Setup"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
