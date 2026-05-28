import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { Car, Settings2 } from "lucide-react";
import brandLogo from "../assets/images/regenerated_image_1779967524984.png";

export default function WelcomePage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [showIntro, setShowIntro] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isEditing) return; // Freeze intro if editing
    // Fallback: Complete the intro after 8 seconds if video onEnded doesn't fire
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 8000);
    return () => clearTimeout(timer);
  }, [isEditing]);

  useEffect(() => {
    // Only redirect if auth is loaded, user is present, and intro has finished
    if (!showIntro && !loading && user) {
      navigate("/app");
    }
  }, [user, loading, navigate, showIntro]);

  return (
    <>
      {/* Dev Tool: Toggle Edit Mode */}
      <div className="fixed top-12 right-6 z-[100] flex gap-2">
        <button
          onClick={() => {
            const nextMode = !isEditing;
            setIsEditing(nextMode);
            setShowIntro(nextMode ? true : false); // Force show if entering edit mode
          }}
          className={`flex items-center gap-2 px-3 py-2 rounded-full backdrop-blur-md border text-xs font-medium transition-all ${
            isEditing 
              ? "bg-blue-500/20 text-blue-400 border-blue-500/50" 
              : "bg-white/10 text-white/50 border-white/10 hover:text-white"
          }`}
          title="Toggle Edit Mode for Brand Reveal"
        >
          <Settings2 size={16} />
          {isEditing ? "Editing Reveal" : "Edit Reveal"}
        </button>
      </div>

      <AnimatePresence>
        {showIntro && (
          <motion.div
            key="intro-screen"
            className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center overflow-hidden"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(5px)" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            {/* Ambient Background Glows removed */}

            <motion.div
              className="flex items-center justify-center bg-black relative w-[344px] h-[646.667px] max-w-full max-h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Masking overlays to hide watermarks from Minimax/Hailuo AI */}
              <div className="absolute inset-0 pointer-events-none z-10 shadow-[inset_0_0_120px_40px_black] mix-blend-multiply"></div>
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none z-20"></div>
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black to-transparent pointer-events-none z-20"></div>
              
              <video 
                ref={(el) => {
                  if (el) el.playbackRate = 1.75;
                }}
                src="/My_Video.mp4"
                autoPlay 
                muted 
                playsInline
                onEnded={() => {
                  if (!isEditing) {
                    setShowIntro(false);
                  }
                }}
                className="w-[110%] h-[110%] max-w-none max-h-none object-contain pointer-events-none"
                style={{
                  WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 75%)',
                  maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 75%)'
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Welcome Page (Revealed after intro) */}
      <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
        
        <div className="z-10 flex flex-col items-center justify-center flex-1 w-full px-6 text-center pt-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: showIntro ? 0 : 1, scale: showIntro ? 0.8 : 1 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: showIntro ? 0 : 0.8 }}
          >
            <motion.img 
              animate={{ 
                y: [0, -8, 0]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut"
              }}
              src={brandLogo}
              alt="Dritzz Logo" 
              className="w-[180px] h-[180px] mb-6 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            />
          </motion.div>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: showIntro ? 0 : 1, y: showIntro ? 20 : 0 }}
            transition={{ duration: 0.6, delay: showIntro ? 0 : 1.1 }}
            className="text-gray-400 max-w-sm mb-12 uppercase tracking-[0.15em] font-medium text-sm leading-relaxed"
          >
            India's Smartest Doorstep<br />Car Wash Service
          </motion.p>
        </div>

        <div className="w-full px-6 pb-12 z-10 flex flex-col gap-4">
          <motion.button 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: showIntro ? 0 : 1, y: showIntro ? 20 : 0 }}
            transition={{ duration: 0.6, delay: showIntro ? 0 : 1.2 }}
            onClick={() => navigate("/login")}
            className="w-full h-14 rounded-2xl bg-white text-black font-semibold text-lg flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors shadow-[0_4px_20px_rgba(255,255,255,0.1)]"
          >
            Sign In to your account
          </motion.button>
        </div>
      </div>
    </>
  );
}
