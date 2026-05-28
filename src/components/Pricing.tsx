import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Droplets,
  Sparkles,
  Gem,
  Check,
  CalendarRange,
  ArrowRight,
} from "lucide-react";
import { PACKAGES } from "../constants";
import { VehicleType, Package } from "../types";

const IconMap: Record<string, any> = {
  Droplets,
  Sparkles,
  Gem,
};

interface PricingProps {
  onSelectPackage: (pkgId: string, vehicleType: VehicleType) => void;
}

export default function Pricing({ onSelectPackage }: PricingProps) {
  const [vehicle, setVehicle] = useState<VehicleType>("hatchback");

  const getButtonText = (pkgId: string) => {
    switch (pkgId) {
      case "monthly":
        return "Get Membership";
      case "premium":
        return "Book Premium Wash";
      case "basic":
      default:
        return "Book Now";
    }
  };

  const getBadgeText = (pkgId: string) => {
    if (pkgId === "monthly")
      return (
        <span className="flex items-center gap-1.5">
          MOST POPULAR
          <Sparkles className="w-3.5 h-3.5 text-zinc-300 animate-pulse" />
        </span>
      );
    if (pkgId === "premium") return "Best Seller";
    return null;
  };

  // Reorder packages so Monthly is in the center on large screens
  const orderedPackages = [
    PACKAGES.find((p) => p.id === "basic"),
    PACKAGES.find((p) => p.id === "monthly"),
    PACKAGES.find((p) => p.id === "premium"),
  ].filter(Boolean) as Package[];

  return (
    <section
      id="packages"
      className="px-6 md:px-16 py-16 md:py-32 bg-[#0a0a0a] border-t border-white/5 relative overflow-hidden"
    >
      {/* Premium Background elements */}
      <div className="absolute hidden md:block top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] bg-zinc-600/10 opacity-10 rounded-full pointer-events-none" />
      <div className="absolute hidden md:block bottom-0 right-0 w-96 h-96 bg-zinc-500/5 opacity-10 rounded-full pointer-events-none" />

      <div className="text-center relative z-10 flex flex-col items-center mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div
          className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5"
          style={{ borderColor: "#000000" }}
        >
          <Sparkles className="w-3 h-3 text-white" />
          <span className="text-xs uppercase tracking-widest text-neutral-300 font-bold">
            Premium Doorstep Care
          </span>
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold mb-5 text-white tracking-tight leading-tight">
          Why Pay Every Time? <br className="hidden md:block" />
          <span className="text-diamond-shine drop-shadow-sm">
            Go Monthly & Save More.
          </span>
        </h2>
        <p className="text-neutral-100 max-w-2xl text-xs md:text-lg font-medium drop-shadow-sm">
          Professional doorstep car care designed for busy lifestyles.
        </p>

        {/* Vehicle Toggle */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-12 bg-black/80 p-2 rounded-full border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.8)]" style={{ borderColor: "#444040" }}>
          {(["hatchback", "sedan", "suv"] as VehicleType[]).map((v) => (
            <button
              key={v}
              onClick={() => setVehicle(v)}
              className={`relative overflow-hidden px-8 py-3.5 text-xs uppercase tracking-[0.15em] font-bold transition-all duration-300 rounded-full ${
                vehicle === v
                  ? "bg-gradient-to-tr from-zinc-100 via-white to-zinc-200 text-black animate-diamond-shine scale-105"
                  : "text-neutral-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <div className="flex items-center gap-3">
                {v === "hatchback" && <HatchbackIcon className="w-4 h-4" />}
                {v === "sedan" && <SedanIcon className="w-4 h-4" />}
                {v === "suv" && <SuvIcon className="w-4 h-4" />}
                <span>{v === "suv" ? "SUV / MUV" : v}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="hidden md:flex flex-col lg:flex-row items-center lg:items-stretch justify-center gap-8 max-w-7xl mx-auto relative z-10">
        <AnimatePresence>
          {orderedPackages.map((pkg) => {
            const Icon = IconMap[pkg.icon] || Droplets;
            const price = pkg.price[vehicle];
            const isMonthly = pkg.id === "monthly";
            const badgeText = getBadgeText(pkg.id);

            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{
                  y: -16,
                  transition: { type: "spring", stiffness: 300, damping: 20 },
                }}
                className={`group relative flex flex-col w-full max-w-md lg:w-1/3 transition-all duration-500 rounded-[2rem] 
                  ${
                    isMonthly
                      ? "p-10 lg:-mt-8 lg:mb-8 bg-gradient-to-b from-zinc-900/40 to-neutral-900/80 border-2 border-neutral-500/50 shadow-[0_0_60px_-15px_rgba(255,255,255,0.5)] z-20 scale-100 lg:scale-105"
                      : "p-8 lg:mt-8 bg-neutral-900/95 border border-white/10 shadow-xl hover:border-white/20 z-10"
                  }`}
              >
                {/* Glowing Border effect for Monthly */}
                {isMonthly && (
                  <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-b from-zinc-400/[0.15] to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                )}

                {/* Badges */}
                {badgeText && (
                  <div
                    className={`absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap shadow-xl
                    ${isMonthly ? "bg-gradient-to-r from-black via-zinc-800 to-black text-white shadow-black/50 border border-zinc-700/50 animate-slow-shine" : "bg-neutral-800 text-neutral-100 border border-white/10"}`}
                    style={
                      !isMonthly && badgeText === "Best Seller"
                        ? {
                            borderWidth: "1.8888889999999998px",
                            borderRadius: "40px",
                            paddingRight: "31px",
                            marginLeft: "0px",
                            marginTop: "-12px",
                            backgroundColor: "#010101",
                            borderColor: "#f8f3f3",
                          }
                        : {
                            borderWidth: "1.8888889999999998px",
                            borderRadius: "40px",
                            paddingRight: "31px",
                            marginLeft: "0px",
                            marginTop: "-12px",
                          }
                    }
                  >
                    {badgeText}
                  </div>
                )}

                {isMonthly && (
                  <motion.div
                    animate={{ scale: [1, 1.1, 1], y: [0, -5, 0] }}
                    transition={{
                      repeat: Infinity,
                      duration: 3,
                      ease: "easeInOut",
                    }}
                    className="absolute top-8 right-8"
                  >
                    <div className="absolute hidden md:block inset-0 bg-zinc-500 opacity-10 opacity-20 rounded-full" />
                    <Icon className="w-10 h-10 text-white relative z-10 drop-shadow-sm" />
                  </motion.div>
                )}
                {!isMonthly && (
                  <motion.div
                    animate={{ y: [0, -4, 0], scale: [1, 1.05, 1] }}
                    transition={{
                      repeat: Infinity,
                      duration: 4,
                      ease: "easeInOut",
                      delay: pkg.id === "basic" ? 0 : 1,
                    }}
                    className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 mb-6 group-hover:bg-white/10 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all"
                    style={
                      pkg.id === "basic"
                        ? { backgroundColor: "#338dea", borderColor: "#000000" }
                        : undefined
                    }
                  >
                    <Icon
                      className="w-6 h-6 text-neutral-300 group-hover:text-white transition-colors"
                      style={
                        pkg.id === "basic"
                          ? { backgroundColor: "#338dea" }
                          : undefined
                      }
                    />
                  </motion.div>
                )}

                <h3
                  className={`font-black tracking-tight mb-2 uppercase ${isMonthly ? "text-2xl text-white" : "text-2xl text-neutral-100"}`}
                >
                  {pkg.name}
                </h3>
                <p
                  className={`text-xs mb-8 leading-relaxed font-medium ${isMonthly ? "text-white/80" : "text-neutral-100"}`}
                >
                  {pkg.tagline}
                </p>

                <div className="mb-8">
                  <div className="flex items-baseline gap-2">
                    <span
                      className={`font-black tracking-tighter ${isMonthly ? "text-6xl text-white" : "text-5xl text-neutral-100"}`}
                    >
                      ₹{price}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <div
                      className={`text-[11px] uppercase tracking-widest font-bold ${isMonthly ? "text-neutral-300" : "text-neutral-300"}`}
                    >
                      {isMonthly ? "per month" : "per wash"} ·{" "}
                      {vehicle === "suv" ? "SUV / MUV" : vehicle}
                    </div>
                  </div>
                </div>

                <div className="h-px w-full bg-white/10 mb-8" />

                <ul className="flex-1 space-y-4 mb-10">
                  {pkg.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className={`flex items-start gap-4 text-xs font-medium ${isMonthly && idx === 0 ? "text-white" : "text-neutral-300"}`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isMonthly && idx === 0 ? "bg-zinc-500 text-white" : "bg-zinc-500/20 text-white"}`}
                      >
                        <Check className="w-3 h-3" />
                      </div>
                      <span
                        className={isMonthly && idx === 0 ? "font-bold" : ""}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {isMonthly && (
                  <div className="mb-6 p-4 rounded-xl bg-zinc-500/10 border border-white/5 flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-white shrink-0" />
                    <span className="text-xs font-bold text-white">
                      Save Up To ₹1,500+ Monthly
                    </span>
                  </div>
                )}

                <button
                  onClick={() => onSelectPackage(pkg.id, vehicle)}
                  className={
                    isMonthly
                      ? "w-full btn-primary text-xs"
                      : "w-full btn-secondary text-xs"
                  }
                  style={
                    !isMonthly ? { backgroundColor: "#000000" } : undefined
                  }
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {getButtonText(pkg.id)}
                    {isMonthly && <ArrowRight className="w-4 h-4" />}
                  </span>
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Mobile Swipe View */}
      <div className="md:hidden flex overflow-x-auto snap-x snap-mandatory gap-4 pb-8 pt-6 -mx-6 px-6 hide-scrollbar relative z-10">
        {orderedPackages.map((pkg) => {
          const Icon = IconMap[pkg.icon] || Droplets;
          const price = pkg.price[vehicle];
          const isMonthly = pkg.id === "monthly";
          const badgeText = getBadgeText(pkg.id);

          return (
            <div
              key={pkg.id}
              className={`snap-center shrink-0 w-[85vw] max-w-[280px] rounded-3xl flex flex-col relative
                 ${
                   isMonthly
                     ? "bg-gradient-to-b from-zinc-900/40 to-neutral-900/80 border-2 border-neutral-500/50 shadow-[0_0_30px_rgba(255,255,255,0.15)] p-5 z-20"
                     : "bg-neutral-900/95 border border-white/10 shadow-xl p-5 z-10"
                 }`}
            >
              {badgeText && (
                <div
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap shadow-xl ${isMonthly ? "bg-gradient-to-r from-black via-zinc-800 to-black text-white shadow-black/50 border border-zinc-700/50" : "bg-neutral-800 text-neutral-100 border border-white/10"}`}
                >
                  {badgeText}
                </div>
              )}

              <div className="flex items-center justify-between mb-1 mt-1">
                <h3
                  className={`font-black tracking-tight uppercase ${isMonthly ? "text-lg text-white" : "text-lg text-neutral-100"}`}
                >
                  {pkg.name}
                </h3>
                <Icon
                  className={`w-6 h-6 ${isMonthly ? "text-white" : "text-neutral-400"}`}
                />
              </div>

              <p
                className={`text-[11px] mb-4 font-medium ${isMonthly ? "text-white/80" : "text-neutral-400"}`}
              >
                {pkg.tagline}
              </p>

              <div className="mb-4">
                <span
                  className={`font-black tracking-tighter ${isMonthly ? "text-4xl text-white" : "text-3xl text-neutral-100"}`}
                >
                  ₹{price}
                </span>
                <div
                  className={`text-[9px] uppercase tracking-widest font-bold mt-1 ${isMonthly ? "text-neutral-300" : "text-neutral-400"}`}
                >
                  {isMonthly ? "per month" : "per wash"} ·{" "}
                  {vehicle === "suv" ? "SUV / MUV" : vehicle}
                </div>
              </div>

              <div className="h-px w-full bg-white/10 mb-4" />

              <ul className="flex-1 space-y-2 mb-6">
                {pkg.features.map((feature, idx) => (
                  <li
                    key={idx}
                    className={`flex items-start gap-2 text-[10px] font-medium leading-tight ${isMonthly && idx === 0 ? "text-white" : "text-neutral-300"}`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isMonthly && idx === 0 ? "bg-zinc-500 text-white" : "bg-zinc-500/20 text-white"}`}
                    >
                      <Check className="w-2 h-2" />
                    </div>
                    <span className={isMonthly && idx === 0 ? "font-bold" : ""}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => onSelectPackage(pkg.id, vehicle)}
                className={
                  isMonthly
                    ? "w-full btn-primary py-3 text-[10px]"
                    : "w-full btn-secondary py-3 text-[10px]"
                }
                style={!isMonthly ? { backgroundColor: "#000000" } : undefined}
              >
                <span className="relative z-10 flex items-center justify-center gap-1.5">
                  {getButtonText(pkg.id)}
                  {isMonthly && <ArrowRight className="w-3 h-3" />}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA Section */}
      <div className="mt-40 max-w-5xl mx-auto px-4 md:px-0 relative z-10 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative px-[30px] pt-[62px] pb-[62px] text-[16px] rounded-[3rem] bg-[#050505] border border-white/10 overflow-hidden group shadow-[0_0_80px_-20px_rgba(255,255,255,0.3)] text-center"
        >
          {/* Animated Background Gradients & Glows */}
          <div className="absolute hidden md:block -top-40 -right-40 w-[500px] h-[500px] bg-zinc-600/20 opacity-10 rounded-full group-hover:bg-zinc-500/30 transition-colors duration-1000 pointer-events-none" />
          <div className="absolute hidden md:block -bottom-40 -left-40 w-[500px] h-[500px] bg-neutral-900/20 opacity-10 rounded-full group-hover:bg-zinc-800/30 transition-colors duration-1000 pointer-events-none" />

          {/* Premium Grid/Texture */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

          {/* Top Edge Highlight */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-zinc-400 to-transparent opacity-70" />

          <div className="relative z-10 flex flex-col items-center">
            {/* VIP Badge */}
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{
                repeat: Infinity,
                duration: 2.5,
                ease: "easeInOut",
              }}
              className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/60 bg-gradient-to-r from-black via-zinc-800 to-black animate-slow-shine shadow-[0_0_20px_rgba(255,255,255,0.15)]"
            >
              <Sparkles className="w-4 h-4 text-white animate-pulse" />
              <span className="text-xs sm:text-xs font-black uppercase tracking-[0.3em] text-white">
                Dritzz Black Membership
              </span>
              <Sparkles className="w-4 h-4 text-white animate-pulse" />
            </motion.div>

            <h3 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight">
              <span className="text-white drop-shadow-md text-[28px]">One Membership.</span>{" "}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-300 via-zinc-100 to-zinc-400 drop-shadow-sm text-[28px]">
                Clean Car All Month.
              </span>
            </h3>
            <p className="text-neutral-100 text-[14px] font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
              Join hundreds of smart car owners choosing an effortless, premium
              doorstep car care experience.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full">
              <button
                onClick={() => onSelectPackage("monthly", vehicle)}
                className="w-full sm:w-auto btn-primary text-[8px] leading-[16.3333px]"
              >
                <Gem className="w-4 h-4" />
                Get Membership
              </button>
              <button
                onClick={() =>
                  document
                    .getElementById("packages")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="w-full sm:w-auto btn-secondary text-[10px]"
              >
                Schedule Wash
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

const SedanIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M21.36,10.59l-3.33-4.44A3,3,0,0,0,15.63,5H8.38a3,3,0,0,0-2.4,1.15L2.64,10.59A3,3,0,0,0,2,12.4V17a2,2,0,0,0,2,2h1a2,2,0,0,0,2-2v-1h10v1a2,2,0,0,0,2,2h1a2,2,0,0,0,2-2V12.4A3,3,0,0,0,21.36,10.59ZM7.58,7.35a1,1,0,0,1,.8-.35h7.24a1,1,0,0,1,.8.4l2.1,2.8a1,1,0,0,1-.8,1.6H5.48a1,1,0,0,1-.8-1.6ZM6.5,15.5A1.5,1.5,0,1,1,8,14,1.5,1.5,0,0,1,6.5,15.5Zm11,0A1.5,1.5,0,1,1,19,14,1.5,1.5,0,0,1,17.5,15.5Z" />
  </svg>
);

const HatchbackIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M19.45,10.63l-2-4A1.986,1.986,0,0,0,15.66,5.5h-8.5A2,2,0,0,0,5.4,6.63l-1.92,4.8A2.99,2.99,0,0,0,2,14.07V18a1,1,0,0,0,1,1h1a1,1,0,0,0,1-1v-1h14v1a1,1,0,0,0,1,1h1a1,1,0,0,0,1-1v-3.93A2.99,2.99,0,0,0,19.45,10.63ZM7.33,7.5h8.5l1.09,2.18A1.018,1.018,0,0,0,17.83,10H5.53A1,1,0,0,0,6.46,9.68ZM6.5,15.5A1.5,1.5,0,1,1,8,14,1.5,1.5,0,0,1,6.5,15.5Zm11,0A1.5,1.5,0,1,1,19,14,1.5,1.5,0,0,1,17.5,15.5Z" />
  </svg>
);

const SuvIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M19.45,10.63l-2-6A1.986,1.986,0,0,0,15.66,3.5h-8.5A2,2,0,0,0,5.4,4.63l-2,6A2.99,2.99,0,0,0,2,13v5a1,1,0,0,0,1,1h1a1,1,0,0,0,1-1v-1h14v1a1,1,0,0,0,1,1h1a1,1,0,0,0,1-1v-5A2.99,2.99,0,0,0,19.45,10.63ZM7.33,5.5h8.5l1.67,5H6.5ZM6.5,15.5A1.5,1.5,0,1,1,8,14,1.5,1.5,0,0,1,6.5,15.5Zm11,0A1.5,1.5,0,1,1,19,14,1.5,1.5,0,0,1,17.5,15.5Z" />
  </svg>
);
