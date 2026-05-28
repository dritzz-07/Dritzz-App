import { motion, AnimatePresence } from "motion/react";
import { Star, Droplets, Zap } from "lucide-react";
import { useRef, useState, useEffect } from "react";

const BG_IMAGES = ["/d-image-1.jpg", "/d-image-3.png", "/d-image-4.png"];

export default function Hero() {
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIdx((prev) => (prev + 1) % BG_IMAGES.length);
    }, 4000); // Faster transition
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-[100dvh] lg:min-h-screen flex flex-col px-6 pt-[100px] lg:pt-[160px] pb-6 sm:pb-10 overflow-hidden bg-black text-center">
      {/* Background Slideshow */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <AnimatePresence mode="popLayout">
          <motion.img
            key={currentImageIdx}
            initial={{ scale: 1.05, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.5, ease: "easeOut" }}
            src={BG_IMAGES[currentImageIdx]}
            alt="Premium Car Detailing"
            className="absolute inset-0 w-full h-full object-cover max-[1023px]:object-contain object-center"
            referrerPolicy="no-referrer"
            fetchPriority="high"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-black/40 z-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/90 z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60 z-10" />
      </div>

      {/* Background Animation Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: Math.random() * 100 + "%",
              y: "110%",
              opacity: Math.random() * 0.3 + 0.1,
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{
              y: "-10%",
              x: Math.random() * 100 - 50 + "%",
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5,
            }}
            className="absolute"
          >
            <Droplets className="text-white/20 w-4 h-4" />
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 max-w-4xl mx-auto w-full flex flex-col items-center my-auto gap-2 sm:gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-block px-4 py-1.5 md:py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[9px] sm:text-xs font-bold uppercase tracking-widest text-neutral-100 shadow-2xl whitespace-nowrap mb-2 mt-2 sm:mt-[15px]"
        >
          Now Serving Hyderabad
        </motion.div>

        <motion.h1 className="font-sporty font-black text-2xl sm:text-4xl md:text-4xl lg:text-5xl xl:text-6xl leading-[1.1] sm:leading-[1.05] tracking-tighter uppercase select-none flex flex-wrap justify-center gap-x-3 sm:gap-x-6 gap-y-1 sm:gap-y-2">
          {["India’s", "Smartest", "Doorstep", "Car", "Wash", "Services"].map(
            (word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                animate={{
                  opacity: 1,
                  y: [0, -10, 0],
                  scale: 1,
                }}
                transition={{
                  opacity: { duration: 0.8, delay: 0.2 + i * 0.1 },
                  y: {
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5 + i * 0.2,
                  },
                  scale: { duration: 0.8, delay: 0.2 + i * 0.1 },
                }}
                className="inline-block bg-linear-to-b bg-clip-text text-transparent drop-shadow-lg from-white via-neutral-100 to-neutral-400"
              >
                {word}
              </motion.span>
            ),
          )}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-[9px] sm:text-sm text-neutral-200 leading-relaxed max-w-2xl uppercase font-display tracking-[0.1em] sm:tracking-[0.2em] font-medium px-4 mt-2 sm:mt-0"
        >
          Professional Detailing at your home, office, or apartment. Fast,
          affordable, and spotless.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-center gap-2 sm:gap-8 mt-2 sm:mt-6 w-fit sm:w-full mx-auto"
        >
          <motion.div
            animate={{
              y: [0, -5, 0],
              boxShadow: [
                "0 0 0px rgba(0,0,0,0)",
                "0 0 25px rgba(255,255,255,0.1)",
                "0 0 0px rgba(0,0,0,0)",
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="flex items-center justify-start gap-3 sm:gap-4 bg-white/10 backdrop-blur-md border border-white/20 px-3 sm:px-8 py-2 sm:py-5 rounded-2xl sm:rounded-[2rem] w-full sm:w-auto text-left shadow-xl"
          >
            <div className="w-6 h-6 sm:w-12 sm:h-12 rounded-full bg-slate-300/20 flex items-center justify-center border border-slate-300/30 shrink-0">
              <Droplets className="w-3 h-3 sm:w-6 sm:h-6 text-slate-200" />
            </div>
            <div className="flex flex-col">
              <span className="text-[7.5px] sm:text-[10px] uppercase tracking-widest text-slate-300 font-bold leading-tight">
                WE USE OUR OWN
              </span>
              <span className="text-[10px] sm:text-sm uppercase tracking-widest text-white font-black leading-tight">
                WATER SOURCE
              </span>
            </div>
          </motion.div>

          <motion.div
            animate={{
              y: [0, -5, 0],
              boxShadow: [
                "0 0 0px rgba(0,0,0,0)",
                "0 0 25px rgba(234,179,8,0.1)",
                "0 0 0px rgba(0,0,0,0)",
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.5,
            }}
            className="flex items-center justify-start gap-3 sm:gap-4 bg-white/10 backdrop-blur-md border border-white/20 px-3 sm:px-8 py-2 sm:py-5 rounded-2xl sm:rounded-[2rem] w-full sm:w-auto text-left shadow-xl"
          >
            <div className="w-6 h-6 sm:w-12 sm:h-12 rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500/30 shrink-0">
              <Zap className="w-3 h-3 sm:w-6 sm:h-6 text-yellow-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-[7.5px] sm:text-[10px] uppercase tracking-widest text-yellow-500 font-bold leading-tight">
                WE USE OUR OWN
              </span>
              <span className="text-[10px] sm:text-sm uppercase tracking-widest text-white font-black leading-tight">
                ELECTRICITY
              </span>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mt-3 sm:mt-8 w-full px-4 sm:px-0 max-w-xs sm:max-w-none mx-auto"
        >
          <a
            href="#booking"
            className="btn-primary flex-none w-full sm:w-auto text-center py-2.5 sm:py-4 px-6 sm:px-10 text-[10px] sm:text-sm animate-diamond-shine"
          >
            Book Now
          </a>
          <a
            href="#packages"
            className="btn-secondary flex-none w-full sm:w-auto text-center py-2.5 sm:py-4 px-6 sm:px-10 text-[10px] sm:text-sm bg-black/40 backdrop-blur-md animate-diamond-shine hover:!text-white"
          >
            View Pricing
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="flex flex-wrap justify-center gap-4 sm:gap-16 pt-3 sm:pt-14 mt-1 sm:mt-4 w-full"
        >
          {[
            { label: "Happy Cars", value: "250+" },
            { label: "Avg Rating", value: "4.9", icon: true },
            { label: "Avg Wash Time", value: "30 Min" },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center justify-center">
              <div className="font-display text-2xl sm:text-4xl text-white flex items-center justify-center gap-1.5 font-bold mb-1">
                {stat.value}
                {stat.icon && (
                  <Star className="w-4 h-4 sm:w-6 sm:h-6 fill-[#66a7e9] text-[#66a7e9]" />
                )}
              </div>
              <div className="text-[8px] sm:text-[10px] uppercase tracking-widest text-neutral-400 font-bold">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
