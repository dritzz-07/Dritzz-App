import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useState } from "react";

export default function WaterSplashEffects() {
  const { scrollYProgress } = useScroll();

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {/* Subtle Mist/Vapor Layers */}
      <motion.div
        style={{ opacity: useTransform(scrollYProgress, [0, 1], [0.1, 0.25]) }}
        className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent "
      />
    </div>
  );
}
