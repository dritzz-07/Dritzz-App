import { motion, useScroll, useTransform } from "motion/react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { useRef, useState } from "react";

export default function ShowcaseVideo() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <section
      ref={containerRef}
      className="relative py-16 md:py-32 bg-black overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-16 mb-12 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-block px-3 py-1 mb-6 rounded-full bg-zinc-500/10 border border-white/5 text-xs font-bold uppercase tracking-widest text-white"
        >
          Premium Experience
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="font-sporty font-black text-4xl md:text-5xl uppercase tracking-tighter text-white mb-6"
        >
          SEE THE{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">
            DETAIL
          </span>{" "}
          IN ACTION
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-neutral-100 max-w-2xl text-sm md:text-xs font-medium tracking-wide"
        >
          WITNESS THE PREMIUM CARE YOUR VEHICLE DESERVES. EVERY WIPE, EVERY
          SPRAY, DELIVERED WITH METICULOUS PRECISION.
        </motion.p>
      </div>

      <motion.div
        style={{ scale, opacity }}
        className="max-w-6xl mx-auto px-6 w-full relative"
      >
        <div className="relative aspect-video rounded-[2rem] overflow-hidden bg-white/5 border border-white/10 shadow-[0_0_50px_rgba(16,185,129,0.1)] group">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 pointer-events-none" />

          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted={isMuted}
            playsInline
            // To add your own video:
            // 1. Upload your video file (e.g., 'my-video.mp4') to the 'public' folder in the file explorer.
            // 2. Change the 'src' below to src="/my-video.mp4"
            src="https://assets.mixkit.co/videos/49197/49197-720.mp4"
          />

          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 z-20 flex items-end justify-between opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
            <button
              onClick={togglePlay}
              className="w-16 h-16 rounded-full bg-white/10  border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors shrink-0"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 fill-current" />
              ) : (
                <Play className="w-6 h-6 fill-current ml-1" />
              )}
            </button>

            <button
              onClick={toggleMute}
              className="w-12 h-12 rounded-full bg-white/5  border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors shrink-0"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
